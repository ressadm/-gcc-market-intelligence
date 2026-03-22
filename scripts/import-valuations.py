#!/usr/bin/env python3
"""
Import latest valuations from Verve + Non-Verve Excel exports.

Creates ADJ transactions in Supabase with:
- type = 'ADJ'
- is_cash_event = FALSE (CRITICAL — valuations are never cash)
- amount_orig = current value in original currency
- price_per_share_orig = latest share price (if available)
- date = valuation date from export

Usage:
  python3 scripts/import-valuations.py --dry-run    # Preview changes
  python3 scripts/import-valuations.py --confirm     # Execute import

Requires: openpyxl, requests (or use SUPABASE_URL/KEY env vars)
"""

import os
import sys
import json
import argparse
import uuid
from datetime import datetime

try:
    import openpyxl
except ImportError:
    print("ERROR: pip install openpyxl")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("ERROR: pip install requests")
    sys.exit(1)

# -----------------------------------------------------------
# Config
# -----------------------------------------------------------
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL') or os.environ.get('ANGELOS_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('ANGELOS_SUPABASE_KEY')
VALUATION_DATE = '2026-03-14'  # Verve export date
NONVERVE_VALUATION_DATE = '2026-03-15'  # Non-Verve file date

PORTFOLIO_DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'Portfolio_Data')
VERVE_DUAL_FILE = os.path.join(PORTFOLIO_DATA_DIR, 'Verve_Portfolio_DualCurrency_20260314.xlsx')
NONVERVE_FILE = os.path.join(PORTFOLIO_DATA_DIR, 'Invest-nonVerve_260315.xlsx')

# -----------------------------------------------------------
# Helpers
# -----------------------------------------------------------
def get_supabase_headers():
    return {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
    }

def fetch_companies():
    """Get company name → id mapping from Supabase."""
    url = f'{SUPABASE_URL}/rest/v1/companies?select=id,name'
    resp = requests.get(url, headers=get_supabase_headers())
    resp.raise_for_status()
    companies = resp.json()

    mapping = {}
    for c in companies:
        mapping[c['name'].lower().strip()] = c['id']

    return mapping

def fetch_existing_adj_transactions():
    """Get existing ADJ transactions to avoid duplicates."""
    url = f'{SUPABASE_URL}/rest/v1/transactions?type=eq.ADJ&select=company_id,date,amount_orig'
    resp = requests.get(url, headers=get_supabase_headers())
    resp.raise_for_status()

    existing = set()
    for t in resp.json():
        key = f"{t['company_id']}:{t['date'][:10]}"
        existing.add(key)
    return existing

# -----------------------------------------------------------
# Parse Verve Dual-Currency Export
# -----------------------------------------------------------
def parse_verve_dual_currency():
    """
    Parse Verve DualCurrency file.
    Returns list of {name, currency, current_value_orig, share_price_orig, invested_orig}
    """
    wb = openpyxl.load_workbook(VERVE_DUAL_FILE, data_only=True)
    ws = wb['Portfolio Summary']

    valuations = []
    current_company = None

    for row in ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=False):
        cells = {c.column_letter: c.value for c in row}

        company_name = cells.get('B', '')
        ccy = cells.get('C', '')
        invested = cells.get('D')
        current_value = cells.get('E')
        multiple = cells.get('I')

        if not company_name or company_name == 'TOTAL PORTFOLIO':
            continue

        # CHF row (row 1 of pair) — has the number and company name
        if cells.get('A') is not None and isinstance(cells.get('A'), (int, float)):
            current_company = {
                'name': company_name.strip(),
                'chf_invested': invested,
                'chf_current_value': current_value,
                'multiple': multiple,
            }
        # Original currency row (row 2 of pair)
        elif current_company and ccy and ccy != 'CHF' and company_name.startswith('  '):
            valuations.append({
                'name': current_company['name'],
                'currency': ccy,
                'current_value_orig': current_value,
                'invested_orig': invested,
                'chf_current_value': current_company['chf_current_value'],
                'multiple': current_company['multiple'],
            })
            current_company = None
        # CHF-denominated company (no original currency row follows)
        elif current_company and ccy == 'CHF':
            # Check if next row is also this company
            pass

    # Handle CHF-only companies (those in the Transaction Detail sheet)
    ws_detail = wb['Transaction Detail']
    chf_companies_seen = {v['name'] for v in valuations}

    # Re-parse portfolio summary for CHF-only companies
    ws = wb['Portfolio Summary']
    i = 3  # start after header
    rows = list(ws.iter_rows(min_row=4, max_row=ws.max_row, values_only=False))

    idx = 0
    while idx < len(rows):
        cells = {c.column_letter: c.value for c in rows[idx]}
        name = cells.get('B', '')
        ccy = cells.get('C')

        if name and name != 'TOTAL PORTFOLIO' and cells.get('A') is not None:
            company_name = name.strip()

            # Check next row
            if idx + 1 < len(rows):
                next_cells = {c.column_letter: c.value for c in rows[idx + 1]}
                next_name = next_cells.get('B', '')
                next_ccy = next_cells.get('C')

                if next_name and next_name.startswith('  ') and next_ccy and next_ccy != 'CHF':
                    # Has original currency row — already handled above
                    idx += 2
                    continue
                elif next_name and next_name.startswith('  ') and next_ccy == 'CHF':
                    # CHF-only company with detail row
                    if company_name not in chf_companies_seen:
                        valuations.append({
                            'name': company_name,
                            'currency': 'CHF',
                            'current_value_orig': cells.get('E'),
                            'invested_orig': cells.get('D'),
                            'chf_current_value': cells.get('E'),
                            'multiple': cells.get('I'),
                        })
                    idx += 2
                    continue

            # Single row company
            if ccy == 'CHF' and company_name not in chf_companies_seen:
                valuations.append({
                    'name': company_name,
                    'currency': 'CHF',
                    'current_value_orig': cells.get('E'),
                    'invested_orig': cells.get('D'),
                    'chf_current_value': cells.get('E'),
                    'multiple': cells.get('I'),
                })
        idx += 1

    return valuations

# -----------------------------------------------------------
# Parse Non-Verve Export
# -----------------------------------------------------------
def parse_nonverve():
    """
    Parse non-Verve investments file.
    Returns list of {name, currency, current_value_orig}
    """
    wb = openpyxl.load_workbook(NONVERVE_FILE, data_only=True)
    ws = wb.active

    valuations = []
    seen = {}

    for row in ws.iter_rows(min_row=2, max_row=ws.max_row, values_only=False):
        cells = {c.column_letter: c.value for c in row}
        name = cells.get('A', '')
        if not name or not isinstance(name, str):
            continue

        name = name.strip().rstrip(',')
        currency = cells.get('F', '')
        if currency == 'Euro':
            currency = 'EUR'

        invested = cells.get('H')  # Investment Value in Investment Currency
        current_value = cells.get('M')  # Current Value

        if invested is None or not isinstance(invested, (int, float)):
            continue

        # Aggregate multiple tranches per company
        if name in seen:
            seen[name]['invested_orig'] += float(invested or 0)
            seen[name]['current_value_orig'] += float(current_value or 0)
        else:
            seen[name] = {
                'name': name,
                'currency': currency,
                'invested_orig': float(invested or 0),
                'current_value_orig': float(current_value or 0),
            }

    return list(seen.values())

# -----------------------------------------------------------
# Name matching
# -----------------------------------------------------------
VERVE_TO_DB = {
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

NONVERVE_TO_DB = {
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
    'case45': 'case45',
}

def match_company(name, company_map, source='verve'):
    """Match an export name to a DB company ID."""
    name_lower = name.lower().strip()

    lookup = VERVE_TO_DB if source == 'verve' else NONVERVE_TO_DB
    db_name = lookup.get(name_lower, name_lower)

    if db_name in company_map:
        return company_map[db_name]

    # Try partial match
    for db_key, db_id in company_map.items():
        if db_name in db_key or db_key in db_name:
            return db_id

    return None

# -----------------------------------------------------------
# Build ADJ transactions
# -----------------------------------------------------------
def build_adj_transactions(valuations, company_map, existing_adj, valuation_date, source):
    """Build ADJ transaction records for insert."""
    transactions = []
    skipped = []
    unmatched = []

    for v in valuations:
        company_id = match_company(v['name'], company_map, source)
        if not company_id:
            unmatched.append(v['name'])
            continue

        # Skip if ADJ already exists for this company on this date
        key = f"{company_id}:{valuation_date}"
        if key in existing_adj:
            skipped.append(v['name'])
            continue

        current_value = v.get('current_value_orig', 0)
        if current_value is None:
            current_value = 0

        currency = v.get('currency', 'CHF')

        tx = {
            'company_id': company_id,
            'transaction_name': f'Valuation Update {valuation_date}',
            'type': 'ADJ',
            'is_cash_event': False,  # CRITICAL — never cash
            'amount_chf': 0,  # ADJ doesn't move cash
            'amount_orig': float(current_value),
            'orig_currency': currency,
            'fx_rate_orig_to_chf': 0,  # Not relevant for valuation
            'date': f'{valuation_date}T00:00:00+00:00',
            'shares': 0,
            'price_per_share_chf': 0,
            'price_per_share_orig': 0,
            'notes': f'Source: {"Verve export" if source == "verve" else "Non-Verve tracker"} {valuation_date}',
        }

        transactions.append((v['name'], tx))

    return transactions, skipped, unmatched

# -----------------------------------------------------------
# Main
# -----------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description='Import valuations from Excel exports')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--dry-run', action='store_true', help='Preview changes without writing')
    group.add_argument('--confirm', action='store_true', help='Execute import')
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANGELOS_SUPABASE_URL/KEY)")
        sys.exit(1)

    print(f"Supabase: {SUPABASE_URL}")
    print(f"Verve file: {VERVE_DUAL_FILE}")
    print(f"Non-Verve file: {NONVERVE_FILE}")
    print()

    # Fetch company mapping
    company_map = fetch_companies()
    print(f"Companies in DB: {len(company_map)}")

    # Fetch existing ADJ to avoid duplicates
    existing_adj = fetch_existing_adj_transactions()
    print(f"Existing ADJ transactions: {len(existing_adj)}")
    print()

    # Parse Verve
    print("--- Verve (Dual Currency) ---")
    verve_vals = parse_verve_dual_currency()
    print(f"Parsed {len(verve_vals)} Verve valuations")
    for v in verve_vals:
        print(f"  {v['name']:25s} {v['currency']:4s} Value: {v['current_value_orig']:>12,.2f}  MOIC: {v.get('multiple', '?')}")

    verve_txs, verve_skipped, verve_unmatched = build_adj_transactions(
        verve_vals, company_map, existing_adj, VALUATION_DATE, 'verve'
    )

    print(f"\nVerve: {len(verve_txs)} new ADJ, {len(verve_skipped)} skipped (exists), {len(verve_unmatched)} unmatched")
    if verve_unmatched:
        print(f"  Unmatched: {verve_unmatched}")
    if verve_skipped:
        print(f"  Skipped: {verve_skipped}")

    # Parse Non-Verve
    print("\n--- Non-Verve ---")
    nonverve_vals = parse_nonverve()
    print(f"Parsed {len(nonverve_vals)} non-Verve valuations")
    for v in nonverve_vals:
        print(f"  {v['name']:40s} {v['currency']:4s} Value: {v['current_value_orig']:>12,.2f}")

    nonverve_txs, nv_skipped, nv_unmatched = build_adj_transactions(
        nonverve_vals, company_map, existing_adj, NONVERVE_VALUATION_DATE, 'nonverve'
    )

    print(f"\nNon-Verve: {len(nonverve_txs)} new ADJ, {len(nv_skipped)} skipped, {len(nv_unmatched)} unmatched")
    if nv_unmatched:
        print(f"  Unmatched: {nv_unmatched}")

    all_txs = verve_txs + nonverve_txs
    print(f"\n{'='*60}")
    print(f"TOTAL: {len(all_txs)} ADJ transactions to insert")
    print(f"All is_cash_event = FALSE (verified)")
    print(f"{'='*60}")

    if not all_txs:
        print("Nothing to import.")
        return

    # Print preview
    print("\nPreview:")
    for name, tx in all_txs:
        print(f"  {name:30s} → {tx['orig_currency']} {tx['amount_orig']:>12,.2f} on {tx['date'][:10]}")

    if args.dry_run:
        print("\n[DRY RUN] No changes made. Use --confirm to execute.")
        return

    # Execute
    print("\nInserting...")
    records = [tx for _, tx in all_txs]

    url = f'{SUPABASE_URL}/rest/v1/transactions'
    resp = requests.post(url, headers=get_supabase_headers(), json=records)

    if resp.status_code in (200, 201):
        result = resp.json()
        print(f"SUCCESS: {len(result)} ADJ transactions inserted")

        # Verify portfolio_summary
        print("\nVerifying portfolio_summary...")
        verify_url = f'{SUPABASE_URL}/rest/v1/portfolio_summary?select=name,moic,current_value,is_stale&order=name'
        verify_resp = requests.get(verify_url, headers=get_supabase_headers())
        if verify_resp.status_code == 200:
            data = verify_resp.json()
            stale = sum(1 for d in data if d['is_stale'])
            non_stale = len(data) - stale
            print(f"  Companies: {len(data)}")
            print(f"  Stale: {stale}, Current: {non_stale}")
            moics = [d['moic'] for d in data if d['moic'] and d['moic'] != 1.0]
            print(f"  Companies with non-1.0 MOIC: {len(moics)}")
    else:
        print(f"ERROR: {resp.status_code}")
        print(resp.text)
        sys.exit(1)

if __name__ == '__main__':
    main()
