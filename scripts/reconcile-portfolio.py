#!/usr/bin/env python3
"""
Sprint 2 — Full portfolio reconciliation from Excel exports.

Compares Supabase DB against latest Verve + Non-Verve Excel files.
Produces a diff report and optionally applies updates.

Actions:
  1. UPDATE company current_value_chf / current_value_orig / status
  2. INSERT missing transactions (with correct is_cash_event classification)
  3. UPDATE Non-Verve company values
  4. Report any anomalies (Case45, unmatched names, etc.)

Usage:
  python3 scripts/reconcile-portfolio.py --dry-run
  python3 scripts/reconcile-portfolio.py --confirm
"""

import os, sys, json, argparse
from datetime import datetime
from collections import defaultdict

try:
    import openpyxl
except ImportError:
    sys.exit("ERROR: pip install openpyxl")
try:
    import requests
except ImportError:
    sys.exit("ERROR: pip install requests")

# ── Config ──────────────────────────────────────────────────
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL') or os.environ.get('ANGELOS_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('ANGELOS_SUPABASE_KEY')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORTFOLIO_DIR = os.path.join(BASE_DIR, '..', '..', 'Portfolio_Data')

VERVE_SINGLE = os.path.join(PORTFOLIO_DIR, 'Verve_Portfolio_20260314.xlsx')
VERVE_DUAL = os.path.join(PORTFOLIO_DIR, 'Verve_Portfolio_DualCurrency_20260314.xlsx')
NONVERVE = os.path.join(PORTFOLIO_DIR, 'Invest-nonVerve_260315.xlsx')

VERVE_DATE = '2026-03-14'
NONVERVE_DATE = '2026-03-15'

# ── Name mapping: Excel name → DB name ──────────────────────
VERVE_NAME_MAP = {
    'byrd': 'byrd',
    'coachhub': 'coachhub',
    'bob w': 'bob w',
    'fractory': 'fractory',
    'creal': 'creal',
    'orakl oncology': 'orakl oncology',
    'anybotics': 'anybotics',
    'holo one': 'holo one',
    'veesion': 'veesion',
    'miraex': 'miraex',
    'limula': 'limula',
    'memo therapeutics': 'memo therapeutics',
    'cognism': 'cognism',
    'axelera ai': 'axelera ai',
    'lexroom ai': 'lexroom ai',
    'turn2x': 'turn2x',
    'hilo by aktiia': 'hilo by aktiia',
    'orbex': 'orbex',
    '9t labs': '9t labs',
}

NONVERVE_NAME_MAP = {
    'r3i future fund i , sydecar llc': 'r3i future fund i',
    'r3i future fund i, sydecar llc': 'r3i future fund i',
    'indelible ventures fund ii, lp': 'indelible ventures fund ii',
    'indelible ventures fund ii, lp,': 'indelible ventures fund ii',
    'taawoni': 'taawoni',
    'gabster': 'gabster',
    'leaderonomics': 'leaderonomics',
    'stashaway etf fund': 'stashaway etf',
    'stashaway etf fund ': 'stashaway etf',
    'transcelestial spv': 'transcelestial',
    'transcelestial spv ': 'transcelestial',
    'calarrio': 'calarrio',
    'shieldbase': 'shieldbase',
    'aumet': 'aumet',
    'aumet ': 'aumet',
}

# ── Transaction type classification ─────────────────────────
def classify_transaction(tx_name, invested, shares):
    """Classify transaction type and is_cash_event per financial data rules."""
    name = tx_name.lower().strip()
    invested = float(invested or 0)
    shares = float(shares or 0)

    # Anti-dilution / Revaluation / Re-Evaluation → ADJ, not cash
    if any(k in name for k in ['anti-dilution', 'valuation adjustment', 're-eval', 'revaluation']):
        return 'ADJ', False

    # Conversion → not new cash (loan was already counted)
    if 'conversion' in name or '(conversion)' in name:
        return 'CNV', False

    # Recapitalization → check if it has invested amount
    if 'recap' in name:
        if invested > 0:
            return 'RECAP', True  # Has cash component
        return 'RECAP', False

    # Convertible Loan (not yet converted) → cash event
    if 'convertible loan' in name:
        return 'CVL', True

    # Payout / Distribution → not cash deployment
    if 'payout' in name or 'distribution' in name or 'trade sale' in name:
        return 'DIST', False

    # Standard equity (Series X, Seed, etc.)
    if invested > 0:
        if shares == 0:
            return 'CVL', True  # Paid but no shares yet (e.g., aktiia Series B)
        return 'EQT', True

    # Fallback: zero invested, has shares → adjustment
    if invested == 0 and shares > 0:
        return 'ADJ', False

    return 'ADJ', False

# ── Supabase helpers ────────────────────────────────────────
def headers():
    return {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
    }

def fetch_all(table, select='*', filters=''):
    url = f'{SUPABASE_URL}/rest/v1/{table}?select={select}{filters}&limit=1000'
    r = requests.get(url, headers=headers())
    r.raise_for_status()
    return r.json()

def patch_record(table, id_val, data):
    url = f'{SUPABASE_URL}/rest/v1/{table}?id=eq.{id_val}'
    r = requests.patch(url, headers=headers(), json=data)
    r.raise_for_status()
    return r.json()

def insert_records(table, records):
    url = f'{SUPABASE_URL}/rest/v1/{table}'
    r = requests.post(url, headers=headers(), json=records)
    r.raise_for_status()
    return r.json()

# ── Parse Verve Transaction Detail (Single Currency) ────────
def parse_verve_transactions():
    """Parse all transactions from Verve Single Currency file."""
    wb = openpyxl.load_workbook(VERVE_SINGLE, data_only=True)
    ws = wb['Transaction Detail']

    transactions = []
    current_company = None

    for row in ws.iter_rows(min_row=5, max_row=ws.max_row, values_only=True):
        company, tx_name, invested_chf, date, shares, price_chf, latest_price, current_val, gain_loss, multiple, tx_type = row

        if company and str(company).strip():
            current_company = str(company).strip()

        if not tx_name or not current_company:
            continue

        transactions.append({
            'company': current_company,
            'transaction_name': str(tx_name).strip(),
            'invested_chf': float(invested_chf) if invested_chf else 0,
            'date': str(date).strip() if date else '',
            'shares': float(shares) if shares else 0,
            'price_per_share_chf': float(price_chf) if price_chf else 0,
            'latest_price_chf': float(latest_price) if latest_price else 0,
            'current_value_chf': float(current_val) if current_val else 0,
            'type_label': str(tx_type).strip() if tx_type else '',
        })

    return transactions

# ── Parse Verve Dual Currency for original amounts ──────────
def parse_verve_dual_transactions():
    """Parse dual-currency transaction detail to get original currency amounts."""
    wb = openpyxl.load_workbook(VERVE_DUAL, data_only=True)
    ws = wb['Transaction Detail']

    # Build lookup: (company, tx_name) → {orig_currency, amount_orig, price_orig}
    lookup = {}
    current_company = None
    last_chf_key = None

    for row in ws.iter_rows(min_row=5, max_row=ws.max_row, values_only=True):
        row = list(row)[:12]  # Only first 12 columns matter
        company, tx_name, ccy, invested, date, shares, price, latest_price, current_val, gain_loss, multiple, tx_type = row

        if company and str(company).strip():
            current_company = str(company).strip()

        if not current_company:
            continue

        ccy = str(ccy).strip() if ccy else ''

        # CHF row — primary record
        if tx_name and ccy == 'CHF':
            key = (current_company.lower(), str(tx_name).strip().lower())
            last_chf_key = key
            lookup[key] = {
                'orig_currency': 'CHF',
                'amount_orig': float(invested) if invested else 0,
                'price_per_share_orig': float(price) if price else 0,
            }
        # Original currency row (follows CHF row)
        elif not tx_name and ccy and ccy != 'CHF' and last_chf_key:
            lookup[last_chf_key]['orig_currency'] = ccy
            lookup[last_chf_key]['amount_orig'] = float(invested) if invested else 0
            lookup[last_chf_key]['price_per_share_orig'] = float(price) if price else 0

    return lookup

# ── Parse Verve company summary (Dual Currency) ─────────────
def parse_verve_company_summary():
    """Parse company-level current values from Dual Currency Portfolio Summary."""
    wb = openpyxl.load_workbook(VERVE_DUAL, data_only=True)
    ws = wb['Portfolio Summary']

    companies = {}
    rows = list(ws.iter_rows(min_row=5, max_row=ws.max_row, values_only=True))

    idx = 0
    while idx < len(rows):
        row = list(rows[idx])[:11]
        num, name, ccy, invested, current_val, gl_chf, gl_orig, fx_gap, multiple, ownership, status = row

        if name and name.strip() == 'TOTAL PORTFOLIO':
            break

        # CHF row (has number)
        if num is not None and isinstance(num, (int, float)) and name:
            company = {
                'name': name.strip(),
                'chf_invested': float(invested) if invested else 0,
                'chf_current_value': float(current_val) if current_val else 0,
                'multiple': float(multiple) if multiple else 0,
                'ownership': str(ownership).strip() if ownership else '',
                'status': str(status).strip() if status else 'Active',
                'orig_currency': 'CHF',
                'orig_invested': float(invested) if invested else 0,
                'orig_current_value': float(current_val) if current_val else 0,
            }

            # Check next row for original currency
            if idx + 1 < len(rows):
                next_row = list(rows[idx + 1])[:11]
                _, next_name, next_ccy, next_invested, next_val = next_row[:5]
                if next_name and str(next_name).strip().startswith('(') and next_ccy:
                    next_ccy = str(next_ccy).strip()
                    if next_ccy != 'CHF':
                        company['orig_currency'] = next_ccy
                        company['orig_invested'] = float(next_invested) if next_invested else 0
                        company['orig_current_value'] = float(next_val) if next_val else 0
                    idx += 1  # Skip orig row

            companies[company['name'].lower()] = company

        idx += 1

    return companies

# ── Parse Verve realized exits ──────────────────────────────
def parse_verve_exits():
    """Parse realized exit from Verve Single Currency file."""
    wb = openpyxl.load_workbook(VERVE_SINGLE, data_only=True)
    ws = wb['Realized Exits']

    exits = []
    for row in ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=True):
        company, tx_name, exit_type, date, shares, payout, net_pl = row
        if not company:
            continue
        exits.append({
            'company': str(company).strip(),
            'transaction_name': str(tx_name).strip(),
            'exit_type': str(exit_type).strip(),
            'date': str(date).strip(),
            'shares': float(shares) if shares else 0,
            'payout_chf': float(payout) if payout else 0,
            'net_pl_chf': float(net_pl) if net_pl else 0,
        })
    return exits

# ── Parse Non-Verve ─────────────────────────────────────────
def parse_nonverve_transactions():
    """Parse non-Verve file into individual transaction rows."""
    wb = openpyxl.load_workbook(NONVERVE, data_only=True)
    ws = wb.active

    transactions = []
    for row in ws.iter_rows(min_row=3, max_row=ws.max_row, values_only=True):
        row = list(row)[:16]
        name, aggregator, via, round_type, instrument, currency, committed, invested, date, shares, price, latest_price, current_val, pre_money, post_money, discount = row

        if not name or not isinstance(name, str):
            continue

        name = name.strip().rstrip(',')
        currency = str(currency).strip() if currency else 'USD'
        if currency == 'Euro':
            currency = 'EUR'

        transactions.append({
            'company': name,
            'aggregator': str(aggregator).strip() if aggregator else '',
            'via': str(via).strip() if via else '',
            'round_type': str(round_type).strip() if round_type else '',
            'instrument': str(instrument).strip() if instrument else '',
            'currency': currency,
            'committed': float(committed) if committed else 0,
            'invested': float(invested) if invested else 0,
            'date': date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else str(date)[:10] if date else '',
            'shares': float(shares) if shares else 0,
            'price': float(price) if price else 0,
            'current_value': float(current_val) if current_val is not None else None,
            'current_value_raw': current_val,  # Preserve original (None vs 0)
            'pre_money_cap': float(pre_money) if pre_money else 0,
            'post_money_cap': float(post_money) if post_money else 0,
            'safe_discount': float(discount) if discount else 0,
        })

    return transactions

# ── Reconciliation ──────────────────────────────────────────
def reconcile(dry_run=True):
    print("=" * 70)
    print("ANgelOS Sprint 2 — Portfolio Reconciliation")
    print(f"Mode: {'DRY RUN' if dry_run else 'CONFIRM (will write to DB)'}")
    print(f"Date: {datetime.now().isoformat()}")
    print("=" * 70)

    # ── Fetch DB state ──────────────────────────────────
    db_companies = fetch_all('companies', 'id,name,orig_currency,total_invested_chf,total_invested_orig,current_value_chf,current_value_orig,status,source,vehicle,committed_amount,committed_currency')
    db_txs = fetch_all('transactions', 'id,company_id,transaction_name,type,is_cash_event,amount_chf,amount_orig,orig_currency,fx_rate_orig_to_chf,date,shares,price_per_share_chf,price_per_share_orig,notes')

    company_by_name = {c['name'].lower(): c for c in db_companies}
    company_by_id = {c['id']: c for c in db_companies}
    txs_by_company = defaultdict(list)
    for tx in db_txs:
        txs_by_company[tx['company_id']].append(tx)

    print(f"\nDB State: {len(db_companies)} companies, {len(db_txs)} transactions")

    # ── Parse Excel files ───────────────────────────────
    verve_txs = parse_verve_transactions()
    dual_lookup = parse_verve_dual_transactions()
    verve_summary = parse_verve_company_summary()
    verve_exits = parse_verve_exits()
    nonverve_txs = parse_nonverve_transactions()

    print(f"Verve Single: {len(verve_txs)} transactions across {len(set(t['company'] for t in verve_txs))} companies")
    print(f"Verve Dual: {len(dual_lookup)} transaction pairs")
    print(f"Verve Exits: {len(verve_exits)}")
    print(f"Non-Verve: {len(nonverve_txs)} rows")

    # ── Collect all changes ─────────────────────────────
    company_updates = []     # (id, name, patch_data, reason)
    tx_inserts = []          # (company_name, tx_record)
    tx_updates = []          # (id, tx_name, patch_data, reason)
    warnings = []

    # ═══════════════════════════════════════════════════
    # SECTION 1: Verve Company Value Updates
    # ═══════════════════════════════════════════════════
    print("\n" + "─" * 70)
    print("SECTION 1: Verve Company Current Value Updates")
    print("─" * 70)

    for excel_name_lower, summary in verve_summary.items():
        db_name = VERVE_NAME_MAP.get(excel_name_lower, excel_name_lower)
        db_company = company_by_name.get(db_name)

        if not db_company:
            warnings.append(f"Verve company '{summary['name']}' → no DB match for '{db_name}'")
            continue

        patch = {}
        reasons = []

        # Current value CHF
        new_cv_chf = summary['chf_current_value']
        old_cv_chf = db_company.get('current_value_chf') or 0
        if abs(new_cv_chf - old_cv_chf) > 0.50:
            patch['current_value_chf'] = new_cv_chf
            reasons.append(f"current_value_chf: {old_cv_chf:,.2f} → {new_cv_chf:,.2f}")

        # Current value orig
        new_cv_orig = summary['orig_current_value']
        old_cv_orig = db_company.get('current_value_orig') or 0
        if abs(new_cv_orig - old_cv_orig) > 0.50:
            patch['current_value_orig'] = new_cv_orig
            reasons.append(f"current_value_orig: {old_cv_orig:,.2f} → {new_cv_orig:,.2f}")

        # Total invested CHF (should match — verify)
        new_inv_chf = summary['chf_invested']
        old_inv_chf = db_company.get('total_invested_chf') or 0
        if abs(new_inv_chf - old_inv_chf) > 0.50:
            patch['total_invested_chf'] = new_inv_chf
            reasons.append(f"total_invested_chf: {old_inv_chf:,.2f} → {new_inv_chf:,.2f}")

        # Total invested orig
        new_inv_orig = summary['orig_invested']
        old_inv_orig = db_company.get('total_invested_orig') or 0
        if abs(new_inv_orig - old_inv_orig) > 0.50:
            patch['total_invested_orig'] = new_inv_orig
            reasons.append(f"total_invested_orig: {old_inv_orig:,.2f} → {new_inv_orig:,.2f}")

        # Status
        new_status = summary['status']
        old_status = db_company.get('status', '')
        if new_status and new_status != old_status:
            patch['status'] = new_status
            reasons.append(f"status: '{old_status}' → '{new_status}'")

        # Orig currency (verify)
        new_ccy = summary['orig_currency']
        old_ccy = db_company.get('orig_currency', '')
        if new_ccy and new_ccy != old_ccy:
            patch['orig_currency'] = new_ccy
            reasons.append(f"orig_currency: '{old_ccy}' → '{new_ccy}'")

        if patch:
            patch['updated_at'] = datetime.utcnow().isoformat() + 'Z'
            company_updates.append((db_company['id'], db_company['name'], patch, '; '.join(reasons)))
            print(f"  UPDATE {db_company['name']:25s} → {'; '.join(reasons)}")
        else:
            print(f"  OK     {db_company['name']:25s} (no changes)")

    # ═══════════════════════════════════════════════════
    # SECTION 2: Verve Transaction Reconciliation
    # ═══════════════════════════════════════════════════
    print("\n" + "─" * 70)
    print("SECTION 2: Verve Transaction Reconciliation")
    print("─" * 70)

    for vtx in verve_txs:
        excel_company = vtx['company']
        db_name = VERVE_NAME_MAP.get(excel_company.lower().split('(')[0].strip().lower(),
                                      excel_company.lower().strip())

        # Special name mappings for full legal names
        legal_to_short = {
            'byrd technologies gmbh': 'byrd',
            'orbital express launch limited': 'orbex',
            'coachhub gmbh': 'coachhub',
            'not a hotel venture limited': 'bob w',
            'fractory solutions oü': 'fractory',
            'creal sa': 'creal',
            'orakl oncology sas': 'orakl oncology',
            'anybotics ag': 'anybotics',
            '9t labs ag': '9t labs',
            'sphere technology holdings, inc.': 'holo one',
            'veesion sas': 'veesion',
            'miraex sa': 'miraex',
            'limula sa': 'limula',
            'memo therapeutics ag': 'memo therapeutics',
            'cognism limited': 'cognism',
            'axelera ai b.v.': 'axelera ai',
            'lexroom s.r.l': 'lexroom ai',
            'turn2x gmbh': 'turn2x',
            'aktiia sa': 'hilo by aktiia',
        }
        db_name = legal_to_short.get(db_name, db_name)

        db_company = company_by_name.get(db_name)
        if not db_company:
            warnings.append(f"Verve tx '{vtx['transaction_name']}' for '{excel_company}' → no DB company '{db_name}'")
            continue

        # Find matching transaction in DB
        company_txs = txs_by_company.get(db_company['id'], [])
        tx_name_normalized = vtx['transaction_name'].lower().strip()

        matched = None
        for db_tx in company_txs:
            db_tx_name = (db_tx['transaction_name'] or '').lower().strip()
            # Exact match or close match
            if db_tx_name == tx_name_normalized:
                matched = db_tx
                break
            # Partial match (handle abbreviations)
            if (tx_name_normalized in db_tx_name or db_tx_name in tx_name_normalized):
                matched = db_tx
                break

        if matched:
            # Check if amounts match
            db_amt = matched.get('amount_chf') or 0
            file_amt = vtx['invested_chf']
            if abs(db_amt - file_amt) > 1.0:
                tx_updates.append((matched['id'], vtx['transaction_name'],
                    {'amount_chf': file_amt},
                    f"amount_chf: {db_amt:,.2f} → {file_amt:,.2f}"))
        else:
            # Missing transaction — need to INSERT
            tx_type, is_cash = classify_transaction(
                vtx['transaction_name'], vtx['invested_chf'], vtx['shares'])

            # Get original currency data from dual file
            dual_key = (excel_company.lower().split('(')[0].strip().lower(),
                       vtx['transaction_name'].lower().strip())
            # Try various key formats for dual lookup
            dual_data = dual_lookup.get(dual_key)
            if not dual_data:
                # Try with short name
                for dkey, dval in dual_lookup.items():
                    if dkey[1] == vtx['transaction_name'].lower().strip():
                        if db_name in dkey[0] or dkey[0] in db_name:
                            dual_data = dval
                            break

            orig_currency = dual_data['orig_currency'] if dual_data else db_company.get('orig_currency', 'CHF')
            amount_orig = dual_data['amount_orig'] if dual_data else vtx['invested_chf']
            price_orig = dual_data['price_per_share_orig'] if dual_data else vtx['price_per_share_chf']

            # Compute FX rate
            fx_rate = vtx['invested_chf'] / amount_orig if amount_orig and amount_orig != 0 else 1.0

            # Parse date
            date_str = vtx['date']
            if '.' in date_str:
                parts = date_str.split('.')
                date_iso = f"{parts[2]}-{parts[1]}-{parts[0]}T00:00:00+00:00"
            else:
                date_iso = date_str + 'T00:00:00+00:00' if 'T' not in date_str else date_str

            new_tx = {
                'company_id': db_company['id'],
                'transaction_name': vtx['transaction_name'],
                'type': tx_type,
                'is_cash_event': is_cash,
                'amount_chf': vtx['invested_chf'],
                'amount_orig': amount_orig,
                'orig_currency': orig_currency,
                'fx_rate_orig_to_chf': round(fx_rate, 6),
                'date': date_iso,
                'shares': vtx['shares'],
                'price_per_share_chf': vtx['price_per_share_chf'],
                'price_per_share_orig': price_orig,
                'notes': f"Source: Verve export {VERVE_DATE}",
            }

            tx_inserts.append((db_company['name'], vtx['transaction_name'], new_tx))
            print(f"  INSERT {db_company['name']:25s} | {vtx['transaction_name']:45s} | {tx_type:4s} | cash={str(is_cash):5s} | CHF {vtx['invested_chf']:>10,.2f} | {orig_currency} {amount_orig:>10,.2f}")

    if not tx_inserts:
        print("  ✅ All Verve transactions already in DB")

    if tx_updates:
        print(f"\n  Transaction amount corrections ({len(tx_updates)}):")
        for tid, tname, patch, reason in tx_updates:
            print(f"    {tname:45s} → {reason}")

    # Count existing transactions for validation
    verve_companies_in_db = [c for c in db_companies if c.get('source') == 'verve']
    verve_tx_count = sum(len(txs_by_company.get(c['id'], [])) for c in verve_companies_in_db)
    print(f"\n  DB Verve transactions: {verve_tx_count}")
    print(f"  File Verve transactions: {len(verve_txs)}")
    print(f"  Missing (to insert): {len(tx_inserts)}")

    # ═══════════════════════════════════════════════════
    # SECTION 3: Non-Verve Updates
    # ═══════════════════════════════════════════════════
    print("\n" + "─" * 70)
    print("SECTION 3: Non-Verve Company Updates")
    print("─" * 70)

    # Aggregate non-verve by company
    nv_companies = defaultdict(lambda: {'invested': 0, 'current_value': 0, 'currency': '', 'committed': 0, 'transactions': []})
    for nv in nonverve_txs:
        key = nv['company'].lower().strip().rstrip(',')
        nv_companies[key]['invested'] += nv['invested']
        cv = nv['current_value']
        nv_companies[key]['current_value'] += float(cv) if cv is not None else 0
        nv_companies[key]['currency'] = nv['currency']
        nv_companies[key]['committed'] += nv['committed']
        nv_companies[key]['transactions'].append(nv)

    for nv_name in sorted(nv_companies.keys()):
        nv_data = nv_companies[nv_name]
        db_name = NONVERVE_NAME_MAP.get(nv_name, nv_name)
        db_company = company_by_name.get(db_name)

        if not db_company:
            warnings.append(f"Non-Verve company '{nv_name}' → no DB match for '{db_name}'")
            continue

        patch = {}
        reasons = []

        # Update current value in orig currency (skip if file value is 0 from empty cell — could be missing data)
        old_cv_orig = db_company.get('current_value_orig') or 0
        new_cv_orig = nv_data['current_value']
        # Only update if: file explicitly has 0 AND old had value (intentional zero), OR file has a real new value
        has_explicit_zero = any(t.get('current_value') == 0 and t.get('invested', 0) > 0 for t in nv_data['transactions'])
        has_none_value = any(t.get('current_value') is None or t.get('current_value') == 0 for t in nv_data['transactions'])
        skip_cv_update = (new_cv_orig == 0 and old_cv_orig > 0 and not has_explicit_zero)
        if abs(new_cv_orig - old_cv_orig) > 0.50 and not skip_cv_update:
            patch['current_value_orig'] = new_cv_orig
            reasons.append(f"current_value_orig: {old_cv_orig:,.2f} → {new_cv_orig:,.2f}")
        elif skip_cv_update:
            print(f"  SKIP   {db_company['name']:35s} (current_value empty in file, keeping DB value {old_cv_orig:,.2f})")

        # Update invested in orig currency
        old_inv_orig = db_company.get('total_invested_orig') or 0
        new_inv_orig = nv_data['invested']
        if abs(new_inv_orig - old_inv_orig) > 0.50:
            patch['total_invested_orig'] = new_inv_orig
            reasons.append(f"total_invested_orig: {old_inv_orig:,.2f} → {new_inv_orig:,.2f}")

        # Committed amount
        if nv_data['committed'] > 0:
            old_committed = db_company.get('committed_amount') or 0
            if abs(nv_data['committed'] - old_committed) > 0.50:
                patch['committed_amount'] = nv_data['committed']
                patch['committed_currency'] = nv_data['currency']
                reasons.append(f"committed: {old_committed:,.2f} → {nv_data['committed']:,.2f} {nv_data['currency']}")

        if patch:
            patch['updated_at'] = datetime.utcnow().isoformat() + 'Z'
            company_updates.append((db_company['id'], db_company['name'], patch, '; '.join(reasons)))
            print(f"  UPDATE {db_company['name']:35s} → {'; '.join(reasons)}")
        else:
            print(f"  OK     {db_company['name']:35s} (no changes)")

    # ═══════════════════════════════════════════════════
    # SECTION 4: Summary & Validation
    # ═══════════════════════════════════════════════════
    print("\n" + "=" * 70)
    print("RECONCILIATION SUMMARY")
    print("=" * 70)
    print(f"  Company updates:       {len(company_updates)}")
    print(f"  Transaction inserts:   {len(tx_inserts)}")
    print(f"  Transaction updates:   {len(tx_updates)}")
    print(f"  Warnings:              {len(warnings)}")

    if warnings:
        print(f"\n⚠️  WARNINGS:")
        for w in warnings:
            print(f"    • {w}")

    # Validate financial rules
    print(f"\n📊 Financial Validation:")
    cash_inserts = [t for _, _, t in tx_inserts if t['is_cash_event']]
    non_cash_inserts = [t for _, _, t in tx_inserts if not t['is_cash_event']]
    print(f"  Cash event inserts:     {len(cash_inserts)}")
    print(f"  Non-cash event inserts: {len(non_cash_inserts)}")

    # Total invested from file (Verve only, cash events)
    total_from_file = sum(t['invested_chf'] for t in verve_txs
                         if classify_transaction(t['transaction_name'], t['invested_chf'], t['shares'])[1])
    print(f"  Verve Total Invested (cash only, from file): CHF {total_from_file:,.2f}")

    if not dry_run and (company_updates or tx_inserts or tx_updates):
        print(f"\n🔧 EXECUTING CHANGES...")

        # Apply company updates
        for cid, cname, patch, reason in company_updates:
            result = patch_record('companies', cid, patch)
            print(f"  ✅ Updated {cname}")

        # Insert missing transactions
        if tx_inserts:
            records = [tx for _, _, tx in tx_inserts]
            result = insert_records('transactions', records)
            print(f"  ✅ Inserted {len(result)} transactions")

        # Apply transaction updates
        for tid, tname, patch, reason in tx_updates:
            result = patch_record('transactions', tid, patch)
            print(f"  ✅ Updated tx '{tname}': {reason}")

        print(f"\n✅ All changes applied successfully.")

    elif dry_run:
        print(f"\n[DRY RUN] No changes made. Use --confirm to execute.")

    else:
        print(f"\n✅ Database is already in sync. Nothing to do.")

    return company_updates, tx_inserts, tx_updates, warnings

# ── Main ────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Reconcile portfolio data from Excel exports')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--dry-run', action='store_true')
    group.add_argument('--confirm', action='store_true')
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        sys.exit("ERROR: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars")

    reconcile(dry_run=args.dry_run)

if __name__ == '__main__':
    main()
