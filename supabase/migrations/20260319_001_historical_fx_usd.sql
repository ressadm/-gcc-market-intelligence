-- ============================================================
-- Migration: Historical FX USD Rates + Correct Invested Amounts
-- Sprint: 11 — Multi-Currency P&L Fix
-- Date: 2026-03-19
--
-- PROBLEM: Portfolio invested amounts in USD are computed by
--   converting CHF→USD at today's live rate. This is WRONG.
--   Invested must use the historical FX rate at investment date.
--
-- FIX: Store fx_rate_orig_to_usd per transaction (like we
--   already store fx_rate_orig_to_chf), then compute invested
--   amounts in the view using per-transaction historical rates.
-- ============================================================

-- 1. Add historical USD FX rate column to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fx_rate_orig_to_usd NUMERIC;

COMMENT ON COLUMN transactions.fx_rate_orig_to_usd IS
  'Historical FX rate: original currency → USD at transaction date. '
  'For USD-denominated transactions this is 1. '
  'Populated by reconciliation script from Verve multi-currency exports.';

-- 2. For existing USD-denominated transactions, set rate = 1
UPDATE transactions
SET fx_rate_orig_to_usd = 1
WHERE orig_currency = 'USD' AND fx_rate_orig_to_usd IS NULL;

-- 3. Drop and recreate portfolio_summary view with CHF and USD invested columns
--    (CREATE OR REPLACE cannot reorder columns, so DROP first)
DROP VIEW IF EXISTS portfolio_summary;
CREATE VIEW portfolio_summary AS
WITH company_transactions AS (
  SELECT
    c.id AS company_id, c.name, c.status, c.sector, c.vehicle,
    t.type AS tx_type, t.amount_orig AS amount, t.orig_currency AS currency,
    t.date AS tx_date, t.is_cash_event,
    t.price_per_share_orig AS share_price, t.shares,
    t.fx_rate_orig_to_chf AS fx_rate_at_transaction,
    t.fx_rate_orig_to_usd AS fx_rate_usd_at_transaction
  FROM companies c
  LEFT JOIN transactions t ON t.company_id = c.id
),
company_metrics AS (
  SELECT
    company_id, name, status, sector, vehicle,
    -- Original currency invested (unchanged)
    COALESCE(SUM(CASE WHEN is_cash_event AND tx_type IN ('EQT', 'SAFE', 'CVL', 'RECAP') THEN amount ELSE 0 END), 0) AS total_invested,
    -- CHF invested: SUM of each txn × its historical orig→CHF rate
    COALESCE(SUM(CASE WHEN is_cash_event AND tx_type IN ('EQT', 'SAFE', 'CVL', 'RECAP')
      THEN amount * COALESCE(fx_rate_at_transaction, 1) ELSE 0 END), 0) AS total_invested_chf,
    -- USD invested: SUM of each txn × its historical orig→USD rate
    COALESCE(SUM(CASE WHEN is_cash_event AND tx_type IN ('EQT', 'SAFE', 'CVL', 'RECAP')
      THEN amount * COALESCE(fx_rate_usd_at_transaction, 0) ELSE 0 END), 0) AS total_invested_usd,
    -- Distributions (original currency)
    COALESCE(SUM(CASE WHEN tx_type = 'DIST' THEN amount ELSE 0 END), 0) AS total_distributions,
    -- Investment currency (from first cash transaction)
    (SELECT orig_currency FROM transactions t2 WHERE t2.company_id = company_transactions.company_id AND t2.is_cash_event = TRUE ORDER BY t2.date ASC LIMIT 1) AS investment_currency,
    -- Latest valuation (original currency, from most recent ADJ)
    (SELECT amount_orig FROM transactions t3 WHERE t3.company_id = company_transactions.company_id AND t3.type = 'ADJ' ORDER BY t3.date DESC LIMIT 1) AS latest_valuation,
    (SELECT date FROM transactions t4 WHERE t4.company_id = company_transactions.company_id AND t4.type = 'ADJ' ORDER BY t4.date DESC LIMIT 1) AS latest_valuation_date,
    -- Latest share price (original currency)
    (SELECT price_per_share_orig FROM transactions t5 WHERE t5.company_id = company_transactions.company_id AND t5.price_per_share_orig IS NOT NULL ORDER BY t5.date DESC LIMIT 1) AS latest_share_price,
    -- Total shares
    (SELECT SUM(shares) FROM transactions t6 WHERE t6.company_id = company_transactions.company_id AND t6.is_cash_event = TRUE) AS total_shares,
    -- First investment date
    MIN(CASE WHEN is_cash_event THEN tx_date END) AS first_investment_date,
    -- Original FX rate (first cash transaction, for backward compat)
    (SELECT fx_rate_orig_to_chf FROM transactions t7 WHERE t7.company_id = company_transactions.company_id AND t7.is_cash_event = TRUE ORDER BY t7.date ASC LIMIT 1) AS original_fx_rate
  FROM company_transactions
  GROUP BY company_id, name, status, sector, vehicle
)
SELECT
  company_id, name, status, sector, vehicle,
  investment_currency, total_invested, total_distributions,
  total_invested_chf, total_invested_usd,
  latest_valuation, latest_valuation_date, latest_share_price,
  total_shares, first_investment_date, original_fx_rate,
  EXTRACT(DAY FROM NOW() - latest_valuation_date)::INTEGER AS days_since_valuation,
  CASE WHEN latest_valuation_date IS NULL OR EXTRACT(DAY FROM NOW() - latest_valuation_date) > 90 THEN TRUE ELSE FALSE END AS is_stale,
  CASE WHEN total_invested > 0 THEN ROUND((COALESCE(latest_valuation, total_invested) + total_distributions) / total_invested, 4) ELSE NULL END AS moic,
  COALESCE(latest_valuation, total_invested) AS current_value,
  COALESCE(latest_valuation, total_invested) + total_distributions AS total_value
FROM company_metrics
WHERE total_invested > 0;

-- ============================================================
-- ROLLBACK (uncomment to reverse)
-- ============================================================
-- CREATE OR REPLACE VIEW portfolio_summary AS ... (original definition from 20260318)
-- ALTER TABLE transactions DROP COLUMN IF EXISTS fx_rate_orig_to_usd;
