-- Market Intelligence System for GCC/Saudi ITC Tracking
-- Tables for tracking technology developments, companies, news, and insights

-- ITC News & Developments table
CREATE TABLE IF NOT EXISTS market_intelligence_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  full_content TEXT,
  source TEXT NOT NULL, -- e.g., 'Arab News', 'Gulf News', 'CITC', 'STC', etc.
  source_url TEXT,
  published_date TIMESTAMP WITH TIME ZONE NOT NULL,
  collected_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- GCC Country focus
  countries TEXT[] DEFAULT ARRAY['saudi_arabia']::TEXT[], -- saudi_arabia, uae, qatar, kuwait, bahrain, oman
  primary_country TEXT DEFAULT 'saudi_arabia',
  
  -- Category classification
  category TEXT NOT NULL, -- telecom, fintech, ai, cloud, cybersecurity, e-commerce, healthtech, etc.
  sub_category TEXT,
  tags TEXT[],
  
  -- Sentiment & Impact
  sentiment TEXT, -- positive, negative, neutral
  impact_level TEXT, -- high, medium, low
  
  -- Key entities mentioned
  companies_mentioned TEXT[],
  government_entities TEXT[],
  key_figures TEXT[],
  
  -- Processing metadata
  is_processed BOOLEAN DEFAULT FALSE,
  is_relevant BOOLEAN DEFAULT TRUE,
  ai_summary TEXT,
  ai_sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  ai_relevance_score DECIMAL(3,2), -- 0.0 to 1.0
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GCC ITC Companies Tracker
CREATE TABLE IF NOT EXISTS gcc_itc_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_arabic TEXT,
  company_type TEXT, -- startup, enterprise, government, telecom_provider, etc.
  
  -- Location
  country TEXT NOT NULL,
  city TEXT,
  headquarters TEXT,
  
  -- Business info
  sector TEXT NOT NULL, -- telecom, fintech, ai, cloud, etc.
  sub_sector TEXT,
  description TEXT,
  founded_year INTEGER,
  employee_count TEXT, -- 1-10, 11-50, 51-200, 201-500, 500+
  
  -- Digital presence
  website TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  
  -- Funding & Valuation
  total_funding_usd DECIMAL(15,2),
  latest_valuation_usd DECIMAL(15,2),
  latest_round_type TEXT,
  latest_round_date DATE,
  
  -- Investors & Partners
  key_investors TEXT[],
  strategic_partners TEXT[],
  
  -- Tracking metadata
  is_active BOOLEAN DEFAULT TRUE,
  importance_level TEXT, -- critical, high, medium, low
  tracking_reason TEXT,
  
  -- AI-generated insights
  ai_company_summary TEXT,
  competitive_position TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Trends & Insights
CREATE TABLE IF NOT EXISTS market_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_name TEXT NOT NULL,
  trend_type TEXT NOT NULL, -- technology, regulatory, investment, market_shift, etc.
  
  -- Scope
  countries TEXT[] NOT NULL,
  sectors TEXT[] NOT NULL,
  
  -- Trend details
  description TEXT NOT NULL,
  key_indicators TEXT[],
  supporting_evidence TEXT[],
  
  -- Timeline
  identified_date DATE NOT NULL,
  start_date DATE,
  projected_impact_date DATE,
  
  -- Significance
  impact_level TEXT, -- transformative, high, medium, low
  confidence_level TEXT, -- high, medium, low
  maturity_stage TEXT, -- emerging, growing, mature, declining
  
  -- Related entities
  companies_affected TEXT[],
  related_news_ids UUID[],
  
  -- Metrics
  momentum_score DECIMAL(3,2), -- 0.0 to 1.0, how fast it's growing
  market_size_estimate_usd DECIMAL(15,2),
  growth_rate_pct DECIMAL(5,2),
  
  -- AI analysis
  ai_trend_analysis TEXT,
  opportunity_score DECIMAL(3,2),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Regulatory & Policy Changes
CREATE TABLE IF NOT EXISTS regulatory_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Regulatory body
  issuing_authority TEXT NOT NULL, -- CITC, CMA, SAMA, NTRA, etc.
  country TEXT NOT NULL,
  
  -- Policy details
  policy_type TEXT, -- license, regulation, guideline, framework, incentive
  sectors_affected TEXT[],
  
  -- Dates
  announcement_date DATE NOT NULL,
  effective_date DATE,
  compliance_deadline DATE,
  
  -- Impact assessment
  impact_level TEXT,
  companies_affected TEXT[],
  estimated_market_impact_usd DECIMAL(15,2),
  
  -- Documents
  official_document_url TEXT,
  related_news_ids UUID[],
  
  -- Analysis
  opportunities TEXT[],
  challenges TEXT[],
  ai_impact_analysis TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intelligence Reports (AI-generated summaries and insights)
CREATE TABLE IF NOT EXISTS intelligence_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL, -- daily_brief, weekly_summary, sector_analysis, company_spotlight, trend_report
  title TEXT NOT NULL,
  
  -- Scope
  countries TEXT[],
  sectors TEXT[],
  date_range_start DATE,
  date_range_end DATE,
  
  -- Content
  executive_summary TEXT NOT NULL,
  key_highlights TEXT[],
  detailed_analysis TEXT,
  
  -- Data sources
  news_items_analyzed INTEGER,
  companies_covered INTEGER,
  trends_identified INTEGER,
  
  -- Insights
  opportunities TEXT[],
  risks TEXT[],
  recommendations TEXT[],
  
  -- Metrics
  market_sentiment TEXT, -- bullish, neutral, bearish
  activity_level TEXT, -- high, medium, low
  
  -- Related entities
  source_news_ids UUID[],
  featured_company_ids UUID[],
  featured_trend_ids UUID[],
  
  -- Publishing
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Events (conferences, launches, announcements)
CREATE TABLE IF NOT EXISTS market_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- conference, product_launch, partnership, funding_round, government_initiative
  
  -- Details
  description TEXT,
  organizer TEXT,
  venue TEXT,
  country TEXT NOT NULL,
  city TEXT,
  
  -- Dates
  event_date DATE NOT NULL,
  end_date DATE,
  registration_deadline DATE,
  
  -- Participants
  key_speakers TEXT[],
  participating_companies TEXT[],
  expected_attendees TEXT,
  
  -- Relevance
  sectors TEXT[],
  importance_level TEXT,
  
  -- Links
  event_url TEXT,
  registration_url TEXT,
  related_news_ids UUID[],
  
  -- Tracking
  is_attended BOOLEAN DEFAULT FALSE,
  attendance_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Collection Jobs (tracking automation)
CREATE TABLE IF NOT EXISTS data_collection_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL, -- news_scraper, company_updater, trend_analyzer, report_generator
  source TEXT NOT NULL,
  
  -- Execution details
  status TEXT NOT NULL, -- scheduled, running, completed, failed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Results
  items_collected INTEGER DEFAULT 0,
  items_processed INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Configuration
  config JSONB,
  
  -- Scheduling
  is_recurring BOOLEAN DEFAULT FALSE,
  schedule_cron TEXT, -- e.g., '0 8 * * *' for daily at 8am
  last_successful_run TIMESTAMP WITH TIME ZONE,
  next_scheduled_run TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_news_published_date ON market_intelligence_news(published_date DESC);
CREATE INDEX idx_news_primary_country ON market_intelligence_news(primary_country);
CREATE INDEX idx_news_category ON market_intelligence_news(category);
CREATE INDEX idx_news_relevance ON market_intelligence_news(ai_relevance_score DESC) WHERE is_relevant = TRUE;

CREATE INDEX idx_companies_country ON gcc_itc_companies(country);
CREATE INDEX idx_companies_sector ON gcc_itc_companies(sector);
CREATE INDEX idx_companies_active ON gcc_itc_companies(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_trends_active ON market_trends(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_trends_impact ON market_trends(impact_level, confidence_level);
CREATE INDEX idx_trends_identified ON market_trends(identified_date DESC);

CREATE INDEX idx_regulatory_country ON regulatory_changes(country);
CREATE INDEX idx_regulatory_effective ON regulatory_changes(effective_date);
CREATE INDEX idx_regulatory_authority ON regulatory_changes(issuing_authority);

CREATE INDEX idx_reports_type ON intelligence_reports(report_type);
CREATE INDEX idx_reports_published ON intelligence_reports(published_at DESC) WHERE is_published = TRUE;

CREATE INDEX idx_events_date ON market_events(event_date);
CREATE INDEX idx_events_country ON market_events(country);

CREATE INDEX idx_jobs_status ON data_collection_jobs(status);
CREATE INDEX idx_jobs_next_run ON data_collection_jobs(next_scheduled_run) WHERE is_recurring = TRUE;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_market_intelligence_news_updated_at BEFORE UPDATE ON market_intelligence_news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gcc_itc_companies_updated_at BEFORE UPDATE ON gcc_itc_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_trends_updated_at BEFORE UPDATE ON market_trends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regulatory_changes_updated_at BEFORE UPDATE ON regulatory_changes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_intelligence_reports_updated_at BEFORE UPDATE ON intelligence_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_events_updated_at BEFORE UPDATE ON market_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_collection_jobs_updated_at BEFORE UPDATE ON data_collection_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for GCC ITC tracking

-- Major Saudi Telecom & Tech Companies
INSERT INTO gcc_itc_companies (name, name_arabic, company_type, country, city, sector, description, founded_year, importance_level) VALUES
('Saudi Telecom Company (STC)', 'شركة الاتصالات السعودية', 'enterprise', 'saudi_arabia', 'Riyadh', 'telecom', 'Leading telecom provider in Saudi Arabia and major digital transformation player', 1998, 'critical'),
('Mobily', 'موبايلي', 'enterprise', 'saudi_arabia', 'Riyadh', 'telecom', 'Second largest mobile telecom operator in Saudi Arabia', 2004, 'high'),
('Zain KSA', 'زين السعودية', 'enterprise', 'saudi_arabia', 'Riyadh', 'telecom', 'Third mobile operator in Saudi Arabia', 2008, 'high'),
('Saudi Aramco Digital', NULL, 'enterprise', 'saudi_arabia', 'Dhahran', 'digital_services', 'Digital transformation arm of Saudi Aramco focusing on AI, IoT, and cloud', 2020, 'critical'),
('NEOM Tech & Digital Company', NULL, 'government', 'saudi_arabia', 'NEOM', 'smart_city', 'Technology backbone for NEOM smart city development', 2019, 'critical'),
('Elm', 'علم', 'enterprise', 'saudi_arabia', 'Riyadh', 'gov_tech', 'Leading Saudi digital government solutions provider', 2004, 'high'),
('Lucidya', NULL, 'startup', 'saudi_arabia', 'Riyadh', 'ai', 'AI-powered social media analytics and customer intelligence platform', 2018, 'medium'),
('Lean Technologies', NULL, 'startup', 'saudi_arabia', 'Riyadh', 'fintech', 'Open banking and payment infrastructure provider', 2019, 'high'),
('Tamara', 'تمارا', 'startup', 'saudi_arabia', 'Riyadh', 'fintech', 'Buy now pay later platform serving Saudi and GCC markets', 2020, 'high');

-- UAE Companies
INSERT INTO gcc_itc_companies (name, company_type, country, city, sector, description, founded_year, importance_level) VALUES
('du (Emirates Integrated Telecommunications)', 'enterprise', 'uae', 'Dubai', 'telecom', 'Major UAE telecom operator', 2006, 'high'),
('e&', 'enterprise', 'uae', 'Abu Dhabi', 'telecom', 'Leading telecom and tech conglomerate (formerly Etisalat)', 1976, 'critical'),
('Careem', 'startup', 'uae', 'Dubai', 'transportation', 'Super app for ride-hailing and delivery (acquired by Uber)', 2012, 'high'),
('Tabby', 'startup', 'uae', 'Dubai', 'fintech', 'Leading BNPL platform in MENA region', 2019, 'high');

-- Regulatory bodies and key data sources
INSERT INTO gcc_itc_companies (name, company_type, country, sector, description, importance_level) VALUES
('CITC - Communications and Information Technology Commission', 'government', 'saudi_arabia', 'regulatory', 'Saudi telecom and IT regulator', 'critical'),
('SAMA - Saudi Central Bank', 'government', 'saudi_arabia', 'regulatory', 'Fintech and payment systems regulator', 'critical'),
('SDAIA - Saudi Data & AI Authority', 'government', 'saudi_arabia', 'regulatory', 'National authority for data and AI development', 'critical'),
('MCIT - Ministry of Communications and Information Technology', 'government', 'saudi_arabia', 'regulatory', 'Government ministry overseeing digital transformation', 'critical');

-- Sample trends for Saudi market
INSERT INTO market_trends (trend_name, trend_type, countries, sectors, description, identified_date, impact_level, confidence_level, maturity_stage) VALUES
('Open Banking Adoption in Saudi Arabia', 'regulatory', ARRAY['saudi_arabia'], ARRAY['fintech', 'banking'], 'SAMA is pushing open banking framework enabling fintech innovation and competition', '2024-01-15', 'high', 'high', 'growing'),
('5G Network Expansion', 'technology', ARRAY['saudi_arabia', 'uae', 'qatar'], ARRAY['telecom', 'iot'], 'Massive 5G infrastructure rollout across GCC enabling IoT and smart city applications', '2023-06-01', 'transformative', 'high', 'growing'),
('AI Adoption in Government Services', 'technology', ARRAY['saudi_arabia', 'uae'], ARRAY['ai', 'gov_tech'], 'Government entities rapidly adopting AI for citizen services, efficiency, and decision-making', '2024-03-01', 'high', 'high', 'growing'),
('Cloud-First Government Policy', 'regulatory', ARRAY['saudi_arabia'], ARRAY['cloud', 'gov_tech'], 'Saudi government mandating cloud adoption for government entities', '2023-09-01', 'high', 'high', 'mature'),
('BNPL Market Explosion', 'market_shift', ARRAY['saudi_arabia', 'uae', 'kuwait'], ARRAY['fintech', 'e-commerce'], 'Buy Now Pay Later services seeing rapid adoption among young consumers', '2023-11-01', 'high', 'high', 'growing');

-- Sample regulatory changes
INSERT INTO regulatory_changes (title, description, issuing_authority, country, policy_type, sectors_affected, announcement_date, impact_level) VALUES
('Saudi Cloud First Policy', 'Government mandate requiring all government entities to adopt cloud solutions for new IT projects', 'NCA', 'saudi_arabia', 'regulation', ARRAY['cloud', 'gov_tech'], '2023-09-15', 'high'),
('SAMA Open Banking Framework', 'Framework enabling secure data sharing between banks and licensed third-party providers', 'SAMA', 'saudi_arabia', 'framework', ARRAY['fintech', 'banking'], '2024-02-01', 'high'),
('Instant Payment System (SARIE)', 'Real-time payment infrastructure upgrade enabling instant transfers 24/7', 'SAMA', 'saudi_arabia', 'framework', ARRAY['fintech', 'payment'], '2023-07-01', 'transformative');

-- Sample news sources configuration for data collection
INSERT INTO data_collection_jobs (job_type, source, status, is_recurring, schedule_cron) VALUES
('news_scraper', 'Arab News Technology', 'scheduled', true, '0 */6 * * *'),
('news_scraper', 'CITC Official Announcements', 'scheduled', true, '0 8 * * *'),
('news_scraper', 'SAMA Press Releases', 'scheduled', true, '0 9 * * *'),
('news_scraper', 'Gulf News Technology', 'scheduled', true, '0 */6 * * *'),
('news_scraper', 'The National (UAE) Technology', 'scheduled', true, '0 */6 * * *'),
('company_updater', 'GCC Funding Tracker', 'scheduled', true, '0 10 * * 1'),
('trend_analyzer', 'Weekly Trend Analysis', 'scheduled', true, '0 7 * * 1'),
('report_generator', 'Daily Intelligence Brief', 'scheduled', true, '0 6 * * *');

COMMENT ON TABLE market_intelligence_news IS 'Tracks ITC news and developments from various sources across GCC';
COMMENT ON TABLE gcc_itc_companies IS 'Database of ITC companies operating in GCC region for tracking and analysis';
COMMENT ON TABLE market_trends IS 'Identified trends in GCC ITC market with AI-powered analysis';
COMMENT ON TABLE regulatory_changes IS 'Tracks regulatory and policy changes affecting ITC sector';
COMMENT ON TABLE intelligence_reports IS 'AI-generated intelligence reports and summaries';
COMMENT ON TABLE market_events IS 'Upcoming and past events relevant to GCC ITC market';
COMMENT ON TABLE data_collection_jobs IS 'Automated data collection and processing jobs tracking';
