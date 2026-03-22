-- Fix FX rate updates that failed due to company name mismatches
-- "byrd" → DB has "Byrd", "aktiia" → DB has "Hilo by Aktiia"

BEGIN;

-- ── Byrd (was 'byrd' in original SQL) ──────────────────────
-- Series B | 2021-06-08 | EUR 14,982.73 → CHF 16,555.92 (×1.105000) | USD 18,231.14 (×1.216810)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.105000, fx_rate_orig_to_usd = 1.216810
WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Byrd')
AND ABS(t.shares - 24.140) < 0.01 AND t.date = '2021-06-08';

-- ── Hilo by Aktiia (was 'aktiia' in original SQL) ──────────────────────
-- Convertible Loan 2022 (Conversion) | 2023-11-23 | CHF 15,000.00 → CHF 15,000.00 (×1.000000) | USD 16,982.42 (×1.132161)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.132161
WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Hilo by Aktiia')
AND ABS(t.shares - 20109.277) < 0.01 AND t.date = '2023-11-23';

-- Series B | 2025-04-18 | CHF 2,982.24 → CHF 2,982.24 (×1.000000) | USD 3,652.65 (×1.224801)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.224801
WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Hilo by Aktiia')
AND t.date = '2025-04-18';

-- Series B (First Tranche) | 2025-04-18 | CHF 5,964.48 → CHF 5,964.48 (×1.000000) | USD 7,305.30 (×1.224801)
-- (Same date as above, same rate — both matched by date-only filter above)

-- Series B Extension | 2026-03-13 | CHF 4,301.70 → CHF 4,301.70 (×1.000000) | USD 5,442.94 (×1.265300)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.265300
WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Hilo by Aktiia')
AND t.date = '2026-03-13';

COMMIT;
