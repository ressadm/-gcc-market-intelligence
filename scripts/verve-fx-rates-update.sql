-- ================================================================
-- Per-Transaction Historical FX Rate Update
-- Source: Verve portfolio exports (CHF + EUR + USD + GBP)
-- Generated: 2026-03-20 00:01
-- 
-- Each UPDATE targets ONE specific transaction matched by
-- company + shares + date. Both CHF and USD rates are set.
-- ================================================================

BEGIN;

-- ── 9T Labs (CHF) ──────────────────────
-- Convertible Loan 2024 (Conversion) | 2025-01-30 | CHF 13,999.65 → CHF 13,999.65 (×1.000000) | USD 15,445.81 (×1.103300)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.103300 WHERE t.company_id = (SELECT id FROM companies WHERE name = '9T Labs') AND ABS(t.shares - 1999.950) < 0.01 AND t.date = '2025-01-30';

-- Series A (Preferred > Common) | 2025-01-30 | CHF 15,029.38 → CHF 15,029.38 (×1.000000) | USD 16,581.91 (×1.103300)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.103300 WHERE t.company_id = (SELECT id FROM companies WHERE name = '9T Labs') AND ABS(t.shares - 77.000) < 0.01 AND t.date = '2025-01-30';

-- ── ANYbotics (CHF) ──────────────────────
-- Convertible Loan 2022 (Conversion) | 2023-05-07 | CHF 14,999.84 → CHF 14,999.84 (×1.000000) | USD 16,715.07 (×1.114350)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.114350 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'ANYbotics') AND ABS(t.shares - 469.552) < 0.01 AND t.date = '2023-05-07';

-- Series B Extension | 2024-12-20 | CHF 20,016.23 → CHF 20,016.23 (×1.000000) | USD 22,264.05 (×1.112300)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.112300 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'ANYbotics') AND ABS(t.shares - 399.000) < 0.01 AND t.date = '2024-12-20';

-- ── Axelera AI (EUR) ──────────────────────
-- Series A2 | 2023-03-22 | EUR 25,000.29 → CHF 24,700.29 (×0.988000) | USD 26,781.06 (×1.071230)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.988000, fx_rate_orig_to_usd = 1.071230 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Axelera AI') AND ABS(t.shares - 17007.000) < 0.01 AND t.date = '2023-03-22';

-- Convertible Loan 2023 (Conversion) | 2024-06-17 | EUR 2,900.00 → CHF 2,796.18 (×0.964200) | USD 3,108.07 (×1.071748)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.964200, fx_rate_orig_to_usd = 1.071748 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Axelera AI') AND ABS(t.shares - 1839.266) < 0.01 AND t.date = '2024-06-17';

-- Convertible Loan 2025 (Conversion) | 2025-12-22 | EUR 15,000.00 → CHF 14,019.00 (×0.934600) | USD 17,566.50 (×1.171100)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.934600, fx_rate_orig_to_usd = 1.171100 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Axelera AI') AND ABS(t.shares - 9795.488) < 0.01 AND t.date = '2025-12-22';

-- ── Bob W (EUR) ──────────────────────
-- Series A | 2022-07-11 | EUR 9,999.45 → CHF 10,349.43 (×1.035000) | USD 10,186.24 (×1.018680)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.035000, fx_rate_orig_to_usd = 1.018680 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Bob W') AND ABS(t.shares - 4115.000) < 0.01 AND t.date = '2022-07-11';

-- Convertible Loan 2023 (2nd Closing) (Conversion) | 2023-10-31 | EUR 10,000.00 → CHF 9,950.00 (×0.995000) | USD 10,561.68 (×1.056168)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.995000, fx_rate_orig_to_usd = 1.056168 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Bob W') AND ABS(t.shares - 12545.138) < 0.01 AND t.date = '2023-10-31';

-- Series B | 2023-10-31 | EUR 15,000.32 → CHF 14,439.31 (×0.962600) | USD 15,842.86 (×1.056168)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.962600, fx_rate_orig_to_usd = 1.056168 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Bob W') AND ABS(t.shares - 14075.007) < 0.01 AND t.date = '2023-10-31';

-- ── CREAL (CHF) ──────────────────────
-- Convertible Loan 2022 (Conversion) | 2024-04-26 | CHF 19,999.78 → CHF 19,999.78 (×1.000000) | USD 21,870.66 (×1.093545)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.093545 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'CREAL') AND ABS(t.shares - 1949.296) < 0.01 AND t.date = '2024-04-26';

-- Series A2 | 2024-04-26 | CHF 892.62 → CHF 892.62 (×1.000000) | USD 976.12 (×1.093545)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.093545 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'CREAL') AND ABS(t.shares - 87.000) < 0.01 AND t.date = '2024-04-26';

-- Series B | 2024-09-26 | CHF 8,991.84 → CHF 8,991.84 (×1.000000) | USD 10,685.00 (×1.188300)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.188300 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'CREAL') AND ABS(t.shares - 572.000) < 0.01 AND t.date = '2024-09-26';

-- ── CoachHub (EUR) ──────────────────────
-- Series C | 2022-10-26 | EUR 26,772.55 → CHF 26,111.27 (×0.975300) | USD 26,447.80 (×0.987870)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.975300, fx_rate_orig_to_usd = 0.987870 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'CoachHub') AND ABS(t.shares - 5.000) < 0.01 AND t.date = '2022-10-26';

-- ── Cognism (USD) ──────────────────────
-- Series B4 | 2021-02-12 | USD 9,302.10 → CHF 8,237.94 (×0.885600) | USD 9,302.10 (×1.000000)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.885600, fx_rate_orig_to_usd = 1.000000 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Cognism') AND ABS(t.shares - 489.000) < 0.01 AND t.date = '2021-02-12';

-- Series D-1 | 2023-06-06 | USD 9,992.35 → CHF 9,285.89 (×0.929300) | USD 9,992.35 (×1.000000)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.929300, fx_rate_orig_to_usd = 1.000000 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Cognism') AND ABS(t.shares - 204.435) < 0.01 AND t.date = '2023-06-06';

-- Convertible Loan 2025 | 2025-11-24 | USD 1,300.00 → CHF 1,043.12 (×0.802400) | USD 1,300.00 (×1.000000)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.802400, fx_rate_orig_to_usd = 1.000000 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Cognism') AND t.date = '2025-11-24';

-- ── Fractory (EUR) ──────────────────────
-- Series A | 2021-10-14 | EUR 14,818.91 → CHF 16,136.31 (×1.088900) | USD 17,119.55 (×1.155250)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.088900, fx_rate_orig_to_usd = 1.155250 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Fractory') AND ABS(t.shares - 3400.000) < 0.01 AND t.date = '2021-10-14';

-- ── Holo One (USD) ──────────────────────
-- Series A | 2022-02-14 | USD 14,999.77 → CHF 13,853.79 (×0.923600) | USD 14,999.77 (×1.000000)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.923600, fx_rate_orig_to_usd = 1.000000 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Holo One') AND ABS(t.shares - 9606.000) < 0.01 AND t.date = '2022-02-14';

-- Convertible Loan 2024/2025 | 2025-03-25 | USD 10,000.00 → CHF 9,000.00 (×0.900000) | USD 10,000.00 (×1.000000)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.900000, fx_rate_orig_to_usd = 1.000000 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Holo One') AND t.date = '2025-03-25';

-- ── Lexroom AI (EUR) ──────────────────────
-- Seed Round | 2025-03-03 | EUR 9,894.17 → CHF 9,362.85 (×0.946300) | USD 10,301.81 (×1.041200)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.946300, fx_rate_orig_to_usd = 1.041200 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Lexroom AI') AND ABS(t.shares - 1700.000) < 0.01 AND t.date = '2025-03-03';

-- Series A | 2025-12-31 | EUR 11,032.20 → CHF 10,282.01 (×0.932000) | USD 12,992.62 (×1.177700)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.932000, fx_rate_orig_to_usd = 1.177700 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Lexroom AI') AND ABS(t.shares - 267.000) < 0.01 AND t.date = '2025-12-31';

-- ── Limula (CHF) ──────────────────────
-- Seed Round | 2024-04-25 | CHF 15,000.08 → CHF 15,000.08 (×1.000000) | USD 16,452.21 (×1.096808)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.096808 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Limula') AND ABS(t.shares - 15464.000) < 0.01 AND t.date = '2024-04-25';

-- Convertible Loan 2025 | 2025-08-29 | CHF 4,500.00 → CHF 4,500.00 (×1.000000) | USD 5,614.20 (×1.247600)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.247600 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Limula') AND t.date = '2025-08-29';

-- ── Memo Therapeutics (CHF) ──────────────────────
-- Series B2 | 2021-12-06 | CHF 14,980.00 → CHF 14,980.00 (×1.000000) | USD 16,326.10 (×1.089860)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.089860 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Memo Therapeutics') AND ABS(t.shares - 214.000) < 0.01 AND t.date = '2021-12-06';

-- Series C (2nd Closing) | 2023-12-04 | CHF 6,720.00 → CHF 6,720.00 (×1.000000) | USD 7,723.53 (×1.149335)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.149335 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Memo Therapeutics') AND ABS(t.shares - 96.000) < 0.01 AND t.date = '2023-12-04';

-- Series C Extension | 2024-05-06 | CHF 5,325.00 → CHF 5,325.00 (×1.000000) | USD 5,883.95 (×1.104967)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.104967 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Memo Therapeutics') AND ABS(t.shares - 71.000) < 0.01 AND t.date = '2024-05-06';

-- Convertible Loan 2025 | 2025-09-03 | CHF 15,000.00 → CHF 15,000.00 (×1.000000) | USD 18,718.50 (×1.247900)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.247900 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Memo Therapeutics') AND t.date = '2025-09-03';

-- ── Miraex (CHF) ──────────────────────
-- Series A2 (2nd Closing) | 2022-01-14 | CHF 9,994.95 → CHF 9,994.95 (×1.000000) | USD 10,928.58 (×1.093410)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.093410 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Miraex') AND ABS(t.shares - 976.906) < 0.01 AND t.date = '2022-01-14';

-- Recapitalization Round 2024 (Conversion) | 2024-05-08 | CHF 592.90 → CHF 592.90 (×1.000000) | USD 653.61 (×1.102395)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.102395 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Miraex') AND ABS(t.shares - 5929.000) < 0.01 AND t.date = '2024-05-08';

-- Convertible Loan 2025 | 2025-07-23 | CHF 800.00 → CHF 800.00 (×1.000000) | USD 1,002.72 (×1.253400)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.253400 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Miraex') AND t.date = '2025-07-23';

-- ── Orakl Oncology (EUR) ──────────────────────
-- Convertible Loan 2023 (Conversion) | 2024-11-19 | EUR 14,989.21 → CHF 14,173.80 (×0.945600) | USD 15,881.07 (×1.059500)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.945600, fx_rate_orig_to_usd = 1.059500 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Orakl Oncology') AND ABS(t.shares - 97.282) < 0.01 AND t.date = '2024-11-19';

-- Seed Round | 2024-11-19 | EUR 19,976.09 → CHF 18,689.63 (×0.935600) | USD 21,164.67 (×1.059500)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.935600, fx_rate_orig_to_usd = 1.059500 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Orakl Oncology') AND ABS(t.shares - 103.718) < 0.01 AND t.date = '2024-11-19';

-- ── Orbex (GBP) ──────────────────────
-- Series C | 2022-11-15 | GBP 15,007.20 → CHF 16,461.40 (×1.096900) | USD 17,656.72 (×1.176550)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.096900, fx_rate_orig_to_usd = 1.176550 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Orbex') AND ABS(t.shares - 1014.000) < 0.01 AND t.date = '2022-11-15';

-- ── TURN2X (EUR) ──────────────────────
-- Seed Round | 2023-05-22 | EUR 10,074.57 → CHF 9,892.22 (×0.981900) | USD 10,898.17 (×1.081750)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.981900, fx_rate_orig_to_usd = 1.081750 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'TURN2X') AND ABS(t.shares - 21.171) < 0.01 AND t.date = '2023-05-22';

-- Convertible Loan 2025 | 2025-10-07 | EUR 3,100.00 → CHF 2,920.51 (×0.942100) | USD 3,633.20 (×1.172000)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.942100, fx_rate_orig_to_usd = 1.172000 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'TURN2X') AND t.date = '2025-10-07';

-- Convertible Loan 2026 | 2026-02-06 | EUR 3,100.00 → CHF 2,859.75 (×0.922500) | USD 3,654.28 (×1.178800)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.922500, fx_rate_orig_to_usd = 1.178800 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'TURN2X') AND t.date = '2026-02-06';

-- ── Veesion (EUR) ──────────────────────
-- Series A | 2022-01-05 | EUR 14,949.12 → CHF 15,578.48 (×1.042100) | USD 16,893.70 (×1.130080)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.042100, fx_rate_orig_to_usd = 1.130080 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Veesion') AND ABS(t.shares - 102.000) < 0.01 AND t.date = '2022-01-05';

-- Series A Extension (2nd Closing) | 2023-07-21 | EUR 2,800.75 → CHF 2,794.03 (×0.997601) | USD 3,142.81 (×1.122132)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.997601, fx_rate_orig_to_usd = 1.122132 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Veesion') AND ABS(t.shares - 17.000) < 0.01 AND t.date = '2023-07-21';

-- Series B | 2025-03-28 | EUR 14,113.37 → CHF 13,231.28 (×0.937500) | USD 15,190.22 (×1.076300)
UPDATE transactions t SET fx_rate_orig_to_chf = 0.937500, fx_rate_orig_to_usd = 1.076300 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'Veesion') AND ABS(t.shares - 50.960) < 0.01 AND t.date = '2025-03-28';

-- ── aktiia (CHF) ──────────────────────
-- Convertible Loan 2022 (Conversion) | 2023-11-23 | CHF 15,000.00 → CHF 15,000.00 (×1.000000) | USD 16,982.42 (×1.132161)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.132161 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'aktiia') AND ABS(t.shares - 20109.277) < 0.01 AND t.date = '2023-11-23';

-- Series B | 2025-04-18 | CHF 2,982.24 → CHF 2,982.24 (×1.000000) | USD 3,652.65 (×1.224801)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.224801 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'aktiia') AND t.date = '2025-04-18';

-- Series B (First Tranche) | 2025-04-18 | CHF 5,964.48 → CHF 5,964.48 (×1.000000) | USD 7,305.30 (×1.224801)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.224801 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'aktiia') AND ABS(t.shares - 5232.002) < 0.01 AND t.date = '2025-04-18';

-- Series B Extension | 2026-03-13 | CHF 4,301.70 → CHF 4,301.70 (×1.000000) | USD 5,442.94 (×1.265300)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.000000, fx_rate_orig_to_usd = 1.265300 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'aktiia') AND t.date = '2026-03-13';

-- ── byrd (EUR) ──────────────────────
-- Series B | 2021-06-08 | EUR 14,982.73 → CHF 16,555.92 (×1.105000) | USD 18,231.14 (×1.216810)
UPDATE transactions t SET fx_rate_orig_to_chf = 1.105000, fx_rate_orig_to_usd = 1.216810 WHERE t.company_id = (SELECT id FROM companies WHERE name = 'byrd') AND ABS(t.shares - 24.140) < 0.01 AND t.date = '2021-06-08';

COMMIT;

-- Total updates: 45