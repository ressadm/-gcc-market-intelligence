-- ============================================================
-- ANgelOS C2 Migration: Tables, Views, Schema Modifications
-- Sprint 0 — Phase 2
-- Date: 2026-03-18
-- Status: EXECUTED SUCCESSFULLY
-- ============================================================
-- DATA GOVERNANCE: Creates NEW tables/views only. No existing data modified.
-- Actual column mappings verified against live schema:
--   transactions: amount_orig, orig_currency, price_per_share_orig, fx_rate_orig_to_chf
--   companies: vehicle (not investment_type), sector
--   deals: source_channel, company_sector, evaluation_data (not evaluation_json)
--   deal_activities: title (not description)
--   Transaction types: EQT, SAFE, CVL, RECAP, DIST, ADJ
-- ============================================================

-- ============================================================
-- 1. C2 TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  agent_id TEXT NOT NULL DEFAULT 'orchestrator',
  trigger_source TEXT NOT NULL CHECK (trigger_source IN ('api', 'cron', 'chat', 'auto', 'webhook')),
  request_id TEXT,
  input_json JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'complete', 'error', 'timeout')),
  output_json JSONB,
  error_message TEXT,
  duration_ms INTEGER,
  tokens_used INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks (status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_skill ON agent_tasks (skill_name);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created ON agent_tasks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_request ON agent_tasks (request_id) WHERE request_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS agent_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'stale_valuation', 'fx_impact', 'deal_alert', 'portfolio_change',
    'follow_on_signal', 'aging_alert', 'market_news', 'performance_alert',
    'daily_summary', 'weekly_digest'
  )),
  entity_type TEXT CHECK (entity_type IN ('company', 'deal', 'portfolio')),
  entity_id UUID,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'info' CHECK (priority IN ('critical', 'warning', 'info')),
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  source_task_id UUID REFERENCES agent_tasks(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_unread ON agent_insights (is_read, is_dismissed) WHERE NOT is_read AND NOT is_dismissed;
CREATE INDEX IF NOT EXISTS idx_insights_type ON agent_insights (insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_entity ON agent_insights (entity_type, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insights_priority ON agent_insights (priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_created ON agent_insights (created_at DESC);

CREATE TABLE IF NOT EXISTS agent_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id),
  company_id UUID REFERENCES companies(id),
  decision_type TEXT NOT NULL CHECK (decision_type IN (
    'score', 'go', 'pass', 'follow_on', 'valuation_update', 'close'
  )),
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  reasoning TEXT NOT NULL,
  agent_recommendation TEXT,
  user_action TEXT,
  outcome_moic NUMERIC,
  outcome_notes TEXT,
  task_id UUID REFERENCES agent_tasks(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_deal ON agent_decisions (deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_decisions_type ON agent_decisions (decision_type);
CREATE INDEX IF NOT EXISTS idx_decisions_created ON agent_decisions (created_at DESC);

-- ============================================================
-- 2. SCHEMA MODIFICATIONS TO EXISTING TABLES
-- ============================================================
-- Note: evaluation_data already exists on deals, so we skip evaluation_json

ALTER TABLE deals ADD COLUMN IF NOT EXISTS agent_score_json JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS parsed_deck_json JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS founder_profile_json JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS enrichment_json JSONB;

-- ============================================================
-- 3. SQL VIEWS (using actual column names from live schema)
-- ============================================================

CREATE OR REPLACE VIEW portfolio_summary AS
WITH company_transactions AS (
  SELECT
    c.id AS company_id, c.name, c.status, c.sector, c.vehicle,
    t.type AS tx_type, t.amount_orig AS amount, t.orig_currency AS currency,
    t.date AS tx_date, t.is_cash_event,
    t.price_per_share_orig AS share_price, t.shares,
    t.fx_rate_orig_to_chf AS fx_rate_at_transaction
  FROM companies c
  LEFT JOIN transactions t ON t.company_id = c.id
),
company_metrics AS (
  SELECT
    company_id, name, status, sector, vehicle,
    COALESCE(SUM(CASE WHEN is_cash_event AND tx_type IN ('EQT', 'SAFE', 'CVL', 'RECAP') THEN amount ELSE 0 END), 0) AS total_invested,
    COALESCE(SUM(CASE WHEN tx_type = 'DIST' THEN amount ELSE 0 END), 0) AS total_distributions,
    (SELECT orig_currency FROM transactions t2 WHERE t2.company_id = company_transactions.company_id AND t2.is_cash_event = TRUE ORDER BY t2.date ASC LIMIT 1) AS investment_currency,
    (SELECT amount_orig FROM transactions t3 WHERE t3.company_id = company_transactions.company_id AND t3.type = 'ADJ' ORDER BY t3.date DESC LIMIT 1) AS latest_valuation,
    (SELECT date FROM transactions t4 WHERE t4.company_id = company_transactions.company_id AND t4.type = 'ADJ' ORDER BY t4.date DESC LIMIT 1) AS latest_valuation_date,
    (SELECT price_per_share_orig FROM transactions t5 WHERE t5.company_id = company_transactions.company_id AND t5.price_per_share_orig IS NOT NULL ORDER BY t5.date DESC LIMIT 1) AS latest_share_price,
    (SELECT SUM(shares) FROM transactions t6 WHERE t6.company_id = company_transactions.company_id AND t6.is_cash_event = TRUE) AS total_shares,
    MIN(CASE WHEN is_cash_event THEN tx_date END) AS first_investment_date,
    (SELECT fx_rate_orig_to_chf FROM transactions t7 WHERE t7.company_id = company_transactions.company_id AND t7.is_cash_event = TRUE ORDER BY t7.date ASC LIMIT 1) AS original_fx_rate
  FROM company_transactions
  GROUP BY company_id, name, status, sector, vehicle
)
SELECT
  company_id, name, status, sector, vehicle,
  investment_currency, total_invested, total_distributions,
  latest_valuation, latest_valuation_date, latest_share_price,
  total_shares, first_investment_date, original_fx_rate,
  EXTRACT(DAY FROM NOW() - latest_valuation_date)::INTEGER AS days_since_valuation,
  CASE WHEN latest_valuation_date IS NULL OR EXTRACT(DAY FROM NOW() - latest_valuation_date) > 90 THEN TRUE ELSE FALSE END AS is_stale,
  CASE WHEN total_invested > 0 THEN ROUND((COALESCE(latest_valuation, total_invested) + total_distributions) / total_invested, 4) ELSE NULL END AS moic,
  COALESCE(latest_valuation, total_invested) AS current_value,
  COALESCE(latest_valuation, total_invested) + total_distributions AS total_value
FROM company_metrics
WHERE total_invested > 0;

CREATE OR REPLACE VIEW deal_pipeline_summary AS
SELECT
  d.id AS deal_id, d.deal_name, d.stage, d.source_channel AS source,
  d.company_sector AS sector, d.created_at, d.updated_at,
  EXTRACT(DAY FROM NOW() - d.updated_at)::INTEGER AS days_in_stage,
  EXTRACT(DAY FROM NOW() - d.created_at)::INTEGER AS total_days,
  CASE WHEN EXTRACT(DAY FROM NOW() - d.updated_at) > 30 THEN TRUE ELSE FALSE END AS is_aging,
  (d.evaluation_data->>'team_rating')::INTEGER AS team_rating,
  (d.evaluation_data->>'market_rating')::INTEGER AS market_rating,
  (d.evaluation_data->>'product_rating')::INTEGER AS product_rating,
  (d.evaluation_data->>'traction_rating')::INTEGER AS traction_rating,
  (d.agent_score_json->>'overall_score')::INTEGER AS ai_score,
  (d.agent_score_json->>'recommendation') AS ai_recommendation,
  (SELECT COUNT(*) FROM deal_activities da WHERE da.deal_id = d.id) AS activity_count,
  (SELECT da.title FROM deal_activities da WHERE da.deal_id = d.id ORDER BY da.created_at DESC LIMIT 1) AS latest_activity
FROM deals d
WHERE d.stage != 'closed' AND d.stage != 'pass';

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on tasks" ON agent_tasks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on insights" ON agent_insights FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on decisions" ON agent_decisions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anon read tasks" ON agent_tasks FOR SELECT USING (true);
CREATE POLICY "Anon read insights" ON agent_insights FOR SELECT USING (true);
CREATE POLICY "Anon read decisions" ON agent_decisions FOR SELECT USING (true);

CREATE POLICY "Anon insert tasks" ON agent_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update insight status" ON agent_insights FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================
-- ROLLBACK (uncomment to reverse)
-- ============================================================
-- DROP VIEW IF EXISTS deal_pipeline_summary;
-- DROP VIEW IF EXISTS portfolio_summary;
-- DROP TABLE IF EXISTS agent_decisions;
-- DROP TABLE IF EXISTS agent_insights;
-- DROP TABLE IF EXISTS agent_tasks;
-- ALTER TABLE deals DROP COLUMN IF EXISTS agent_score_json;
-- ALTER TABLE deals DROP COLUMN IF EXISTS parsed_deck_json;
-- ALTER TABLE deals DROP COLUMN IF EXISTS founder_profile_json;
-- ALTER TABLE deals DROP COLUMN IF EXISTS enrichment_json;
