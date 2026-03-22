#!/usr/bin/env python3
"""
Import per-transaction historical FX rates from Verve multi-currency exports.

KEY INSIGHT:
  Each transaction (round) happened at a DIFFERENT date with a DIFFERENT FX rate.
  Verve uses Bloomberg previous-day rate at the time of wire/invoice.
  We have 4 exports (CHF, EUR, USD, GBP) — same transactions, different currencies.

  By cross-referencing:
    - Original currency export → original invested amount
    - CHF export → CHF invested amount → derive fx_rate_orig_to_chf per txn
    - USD export → USD invested amount → derive fx_rate_orig_to_usd per txn

FORMULA PER TRANSACTION:
  fx_rate_orig_to_chf = CHF_amount / orig_amount
  fx_rate_orig_to_usd = USD_amount / orig_amount

EXAMPLE (Axelera AI, 3 rounds in EUR):
  Series A2 (2022):     EUR 25,000 × 0.9880 = CHF 24,700  |  × 1.0712 = USD 26,781
  CVL 2023 Conversion:  EUR  2,900 × 0.9642 = CHF  2,796  |  × 1.0717 = USD  3,108
  CVL 2025 Conversion:  EUR 15,000 × 0.9346 = CHF 14,019  |  × 1.1711 = USD 17,567
  → Different rate per transaction because EUR/CHF and EUR/USD moved over 3 years

USAGE:
  python3 import-verve-fx-rates.py --dry-run   # Preview changes
  python3 import-verve-fx-rates.py --confirm    # Generate SQL file
"""

import argparse
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("ERROR: openpyxl not installed. Run: pip install openpyxl --break-system-packages")
    sys.exit(1)


# ──────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────

# Map Verve company names → ANgelOS company names
VERVE_NAME_MAP = {
    "byrd technologies GmbH": "byrd",
    "Orbital Express Launch Limited": "Orbex",
    "CoachHub GmbH": "CoachHub",
    "Bob W Oy": "Bob W",
    "Fractory OÜ": "Fractory",
    "Fractory Solutions OÜ": "Fractory",
    "Cognism Limited": "Cognism",
    "Axelera AI B.V.": "Axelera AI",
    "ANYbotics AG": "ANYbotics",
    "CREAL SA": "CREAL",
    "9T Labs AG": "9T Labs",
    "Memo Therapeutics AG": "Memo Therapeutics",
    "Limula SA": "Limula",
    "aktiia SA": "aktiia",
    "Lexroom.ai AG": "Lexroom AI",
    "Lexroom S.r.l": "Lexroom AI",
    "Orakl Oncology SAS": "Orakl Oncology",
    "Miraex SA": "Miraex",
    "TURN2X GmbH": "TURN2X",
    "Veesion SAS": "Veesion",
    "Holo One AG": "Holo One",
    "Not a Hotel Venture Limited": "Bob W",  # Bob W rebranded
    "Sphere Technology Holdings, Inc.": "Holo One",
}

# Original investment currency per Verve company name
ORIG_CURRENCY = {
    "byrd technologies GmbH": "EUR",
    "CoachHub GmbH": "EUR",
    "Bob W Oy": "EUR",
    "Not a Hotel Venture Limited": "EUR",
    "Fractory OÜ": "EUR",
    "Fractory Solutions OÜ": "EUR",
    "Axelera AI B.V.": "EUR",
    "Lexroom.ai AG": "EUR",
    "Lexroom S.r.l": "EUR",
    "Orakl Oncology SAS": "EUR",
    "TURN2X GmbH": "EUR",
    "Veesion SAS": "EUR",
    "Cognism Limited": "USD",
    "Holo One AG": "USD",
    "Sphere Technology Holdings, Inc.": "USD",
    "Orbital Express Launch Limited": "GBP",
    "9T Labs AG": "CHF",
    "ANYbotics AG": "CHF",
    "CREAL SA": "CHF",
    "Limula SA": "CHF",
    "Memo Therapeutics AG": "CHF",
    "Miraex SA": "CHF",
    "aktiia SA": "CHF",
}


# ──────────────────────────────────────────────────────────────
# Parsing
# ──────────────────────────────────────────────────────────────

def parse_amount(s: str) -> float:
    """Parse Verve amount string like "CHF 16'555.92" → 16555.92"""
    if not s or str(s).strip() == '':
        return 0.0
    cleaned = re.sub(r"^[A-Z]{3}\s+", "", str(s).strip())
    cleaned = cleaned.replace("'", "").replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def parse_date(s) -> str | None:
    """Parse Verve date string like '08.06.2021' → '2021-06-08'"""
    if not s:
        return None
    try:
        dt = datetime.strptime(str(s).strip(), "%d.%m.%Y")
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        return str(s)


def parse_shares(s) -> float:
    """Parse share count like "1'014.000" → 1014.0"""
    if not s:
        return 0.0
    cleaned = str(s).replace("'", "").replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def parse_export_txns(filepath: str) -> list[dict]:
    """
    Parse a Verve portfolio export file — returns individual transactions only.
    Skips 'Total' summary rows.
    """
    wb = openpyxl.load_workbook(filepath)
    results = []

    for sheet_name in ['Active Investments', 'Realized Investments']:
        if sheet_name not in wb.sheetnames:
            continue
        ws = wb[sheet_name]
        current_company = None

        for row in ws.iter_rows(min_row=2, values_only=True):
            if row[0] and str(row[0]).strip():
                current_company = str(row[0]).strip()
            txn_desc = row[1]
            if not txn_desc or txn_desc == 'Total':
                continue

            results.append({
                'company_verve': current_company,
                'txn_desc': str(txn_desc).strip(),
                'invested': parse_amount(row[2]),
                'date': parse_date(row[3]),
                'shares': parse_shares(row[4]),
                'price': parse_amount(row[5]) if row[5] else 0,
                'value': parse_amount(row[7]) if len(row) > 7 and row[7] else 0,
                'moic': float(row[9]) if len(row) > 9 and row[9] else None,
                'sheet': sheet_name,
            })

    return results


# ──────────────────────────────────────────────────────────────
# Derivation
# ──────────────────────────────────────────────────────────────

def derive_per_txn_rates(chf_txns, eur_txns, usd_txns, gbp_txns):
    """
    Cross-reference 4 currency exports to derive per-transaction FX rates.

    Returns list of dicts with:
      company_angelos, txn_desc, date, shares,
      orig_currency, orig_amount,
      fx_rate_orig_to_chf, fx_rate_orig_to_usd,
      chf_amount, usd_amount
    """

    def build_map(txns):
        m = {}
        for t in txns:
            key = (t['company_verve'], t['txn_desc'])
            m[key] = t
        return m

    chf_map = build_map(chf_txns)
    eur_map = build_map(eur_txns)
    usd_map = build_map(usd_txns)
    gbp_map = build_map(gbp_txns)
    orig_maps = {'CHF': chf_map, 'EUR': eur_map, 'USD': usd_map, 'GBP': gbp_map}

    results = []

    for key in sorted(chf_map.keys()):
        company_verve = key[0]
        txn_desc = key[1]

        chf_t = chf_map[key]
        usd_t = usd_map.get(key)
        chf_inv = chf_t['invested']
        usd_inv = usd_t['invested'] if usd_t else 0

        # Determine original currency and amount
        orig_ccy = ORIG_CURRENCY.get(company_verve, '???')
        orig_map = orig_maps.get(orig_ccy, chf_map)
        orig_t = orig_map.get(key)
        orig_inv = orig_t['invested'] if orig_t else 0

        # For CHF-denominated companies, original = CHF
        if orig_ccy == 'CHF':
            orig_inv = chf_inv

        # Skip zero-amount transactions (valuation adjustments, anti-dilution)
        if orig_inv == 0 and chf_inv == 0:
            results.append({
                'company_verve': company_verve,
                'company_angelos': VERVE_NAME_MAP.get(company_verve, company_verve),
                'txn_desc': txn_desc,
                'date': chf_t['date'],
                'shares': chf_t['shares'],
                'orig_currency': orig_ccy,
                'orig_amount': 0,
                'chf_amount': 0,
                'usd_amount': 0,
                'fx_rate_orig_to_chf': None,
                'fx_rate_orig_to_usd': None,
                'is_zero': True,
            })
            continue

        # Derive FX rates
        if orig_ccy == 'CHF':
            fx_chf = 1.0
            fx_usd = usd_inv / chf_inv if chf_inv > 0 else 0
        elif orig_inv > 0:
            fx_chf = chf_inv / orig_inv
            fx_usd = usd_inv / orig_inv
        else:
            fx_chf = None
            fx_usd = None

        results.append({
            'company_verve': company_verve,
            'company_angelos': VERVE_NAME_MAP.get(company_verve, company_verve),
            'txn_desc': txn_desc,
            'date': chf_t['date'],
            'shares': chf_t['shares'],
            'orig_currency': orig_ccy,
            'orig_amount': orig_inv,
            'chf_amount': chf_inv,
            'usd_amount': usd_inv,
            'fx_rate_orig_to_chf': fx_chf,
            'fx_rate_orig_to_usd': fx_usd,
            'is_zero': False,
        })

    return results


# ──────────────────────────────────────────────────────────────
# SQL Generation
# ──────────────────────────────────────────────────────────────

def generate_sql(txn_rates: list[dict]) -> list[str]:
    """
    Generate SQL UPDATE statements to set both FX rates per transaction.

    MATCHING STRATEGY (in order of specificity):
      1. company name + shares + date  (most specific)
      2. company name + shares  (if date varies)
      3. company name + date  (if shares is 0/null)

    Updates: fx_rate_orig_to_chf AND fx_rate_orig_to_usd
    """

    lines = [
        "-- ================================================================",
        "-- Per-Transaction Historical FX Rate Update",
        "-- Source: Verve portfolio exports (CHF + EUR + USD + GBP)",
        f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "-- ",
        "-- Each UPDATE targets ONE specific transaction matched by",
        "-- company + shares + date. Both CHF and USD rates are set.",
        "-- ================================================================",
        "",
        "BEGIN;",
        "",
    ]

    prev_company = None
    update_count = 0

    for t in sorted(txn_rates, key=lambda x: (x['company_angelos'], x['date'] or '')):
        if t['is_zero']:
            continue
        if t['fx_rate_orig_to_chf'] is None:
            continue

        company = t['company_angelos']
        if company != prev_company:
            lines.append(f"-- ── {company} ({t['orig_currency']}) ──────────────────────")
            prev_company = company

        # Build match conditions
        conditions = [
            f"t.company_id = (SELECT id FROM companies WHERE name = '{company}')",
        ]

        # Primary match: shares (most reliable across exports)
        if t['shares'] and t['shares'] > 0:
            # Use approximate match (within 0.01) for float precision
            conditions.append(f"ABS(t.shares - {t['shares']:.3f}) < 0.01")

        # Secondary match: date
        if t['date']:
            conditions.append(f"t.date = '{t['date']}'")

        where = " AND ".join(conditions)

        # Format rates
        fx_chf = f"{t['fx_rate_orig_to_chf']:.6f}"
        fx_usd = f"{t['fx_rate_orig_to_usd']:.6f}" if t['fx_rate_orig_to_usd'] else "NULL"

        lines.append(
            f"-- {t['txn_desc']} | {t['date']} | "
            f"{t['orig_currency']} {t['orig_amount']:,.2f} → "
            f"CHF {t['chf_amount']:,.2f} (×{fx_chf}) | "
            f"USD {t['usd_amount']:,.2f} (×{fx_usd})"
        )
        lines.append(
            f"UPDATE transactions t SET "
            f"fx_rate_orig_to_chf = {fx_chf}, "
            f"fx_rate_orig_to_usd = {fx_usd} "
            f"WHERE {where};"
        )
        lines.append("")
        update_count += 1

    lines.append("COMMIT;")
    lines.append("")
    lines.append(f"-- Total updates: {update_count}")

    return lines


# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Import Verve per-transaction historical FX rates")
    parser.add_argument('--dry-run', action='store_true', help='Preview only')
    parser.add_argument('--confirm', action='store_true', help='Generate SQL file')
    parser.add_argument('--chf', default=None, help='CHF export file path')
    parser.add_argument('--eur', default=None, help='EUR export file path')
    parser.add_argument('--usd', default=None, help='USD export file path')
    parser.add_argument('--gbp', default=None, help='GBP export file path')
    parser.add_argument('--output', default=None, help='Output SQL file path')
    args = parser.parse_args()

    # Default file paths
    uploads = Path('/sessions/vigilant-keen-wozniak/mnt/uploads')
    script_dir = Path(__file__).parent

    chf_file = args.chf or str(uploads / 'Portfolio data export - 19.03.2026.xlsx')
    eur_file = args.eur or str(uploads / 'Portfolio data export - 19.03.2026(1).xlsx')
    usd_file = args.usd or str(uploads / 'Portfolio data export - 19.03.2026(2).xlsx')
    gbp_file = args.gbp or str(uploads / 'Portfolio data export - 19.03.2026(3).xlsx')
    output_file = args.output or str(script_dir / 'verve-fx-rates-update.sql')

    # Parse all 4 exports
    print("Parsing Verve exports...")
    chf_txns = parse_export_txns(chf_file)
    eur_txns = parse_export_txns(eur_file)
    usd_txns = parse_export_txns(usd_file)
    gbp_txns = parse_export_txns(gbp_file)
    print(f"  CHF: {len(chf_txns)} txns | EUR: {len(eur_txns)} txns | USD: {len(usd_txns)} txns | GBP: {len(gbp_txns)} txns")

    # Derive per-transaction rates
    print("\nDeriving per-transaction FX rates from cross-currency comparison...")
    txn_rates = derive_per_txn_rates(chf_txns, eur_txns, usd_txns, gbp_txns)

    # Display
    print(f"\n{'Company':<22} {'Transaction':<40} {'Orig':>4} {'Date':>12} {'Orig Amt':>12} {'CHF Amt':>12} {'USD Amt':>12} {'fx→CHF':>10} {'fx→USD':>10}")
    print("─" * 140)

    totals = {'chf': 0, 'usd': 0, 'count': 0}
    by_company = {}

    for t in sorted(txn_rates, key=lambda x: (x['company_angelos'], x['date'] or '')):
        if t['is_zero']:
            marker = "  (ZERO — skip)"
        else:
            marker = ""

        fx_chf_s = f"{t['fx_rate_orig_to_chf']:.6f}" if t['fx_rate_orig_to_chf'] else "—"
        fx_usd_s = f"{t['fx_rate_orig_to_usd']:.6f}" if t['fx_rate_orig_to_usd'] else "—"

        print(
            f"{t['company_angelos']:<22} "
            f"{t['txn_desc']:<40} "
            f"{t['orig_currency']:>4} "
            f"{(t['date'] or '—'):>12} "
            f"{t['orig_amount']:>12,.2f} "
            f"{t['chf_amount']:>12,.2f} "
            f"{t['usd_amount']:>12,.2f} "
            f"{fx_chf_s:>10} "
            f"{fx_usd_s:>10}"
            f"{marker}"
        )

        if not t['is_zero']:
            totals['chf'] += t['chf_amount']
            totals['usd'] += t['usd_amount']
            totals['count'] += 1

            c = t['company_angelos']
            if c not in by_company:
                by_company[c] = {'chf': 0, 'usd': 0, 'txn_count': 0}
            by_company[c]['chf'] += t['chf_amount']
            by_company[c]['usd'] += t['usd_amount']
            by_company[c]['txn_count'] += 1

    print("─" * 140)
    print(f"{'TOTAL':<22} {totals['count']} transactions{' ':>48} {totals['chf']:>12,.2f} {totals['usd']:>12,.2f}")

    # Company summary
    print(f"\n{'─' * 80}")
    print(f"{'Company':<25} {'Txns':>5} {'CHF Invested':>15} {'USD Invested':>15}")
    print(f"{'─' * 80}")
    for c in sorted(by_company.keys()):
        d = by_company[c]
        print(f"{c:<25} {d['txn_count']:>5} {d['chf']:>15,.2f} {d['usd']:>15,.2f}")
    print(f"{'─' * 80}")
    print(f"{'TOTAL':<25} {totals['count']:>5} {totals['chf']:>15,.2f} {totals['usd']:>15,.2f}")

    # Generate SQL
    sql_lines = generate_sql(txn_rates)

    if args.confirm:
        with open(output_file, 'w') as f:
            f.write('\n'.join(sql_lines))
        print(f"\n✅ SQL written to: {output_file}")
        print(f"   {totals['count']} UPDATE statements")
        print(f"   Run in Supabase SQL Editor to update transaction FX rates.")
    elif args.dry_run:
        print(f"\n{'═' * 80}")
        print("DRY RUN — SQL Preview (first 50 lines):")
        print('═' * 80)
        for line in sql_lines[:50]:
            print(line)
        if len(sql_lines) > 50:
            print(f"... ({len(sql_lines) - 50} more lines)")
        print(f"\nRe-run with --confirm to generate the full SQL file.")
    else:
        print("\nUsage: --dry-run to preview, --confirm to generate SQL")


if __name__ == '__main__':
    main()
