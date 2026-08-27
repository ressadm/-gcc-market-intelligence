// Market Intelligence Types for GCC/Saudi ITC Tracking

export type GCCCountry = 'saudi_arabia' | 'uae' | 'qatar' | 'kuwait' | 'bahrain' | 'oman'

export type ITCCategory =
  | 'telecom'
  | 'fintech'
  | 'ai'
  | 'cloud'
  | 'cybersecurity'
  | 'e-commerce'
  | 'healthtech'
  | 'edutech'
  | 'gov_tech'
  | 'smart_city'
  | 'iot'
  | 'blockchain'
  | 'digital_services'
  | 'transportation'
  | 'payment'
  | 'banking'
  | 'other'

export type Sentiment = 'positive' | 'negative' | 'neutral'
export type ImpactLevel = 'transformative' | 'high' | 'medium' | 'low'
export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low'
export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type MaturityStage = 'emerging' | 'growing' | 'mature' | 'declining'
export type MarketSentiment = 'bullish' | 'neutral' | 'bearish'
export type ActivityLevel = 'high' | 'medium' | 'low'

// News Article
export interface MarketIntelligenceNews {
  id: string
  title: string
  summary: string | null
  full_content: string | null
  source: string
  source_url: string | null
  published_date: string
  collected_date: string
  
  countries: GCCCountry[]
  primary_country: GCCCountry
  
  category: ITCCategory
  sub_category: string | null
  tags: string[] | null
  
  sentiment: Sentiment | null
  impact_level: ImpactLevel | null
  
  companies_mentioned: string[] | null
  government_entities: string[] | null
  key_figures: string[] | null
  
  is_processed: boolean
  is_relevant: boolean
  ai_summary: string | null
  ai_sentiment_score: number | null
  ai_relevance_score: number | null
  
  created_at: string
  updated_at: string
}

// GCC ITC Company
export interface GCCITCCompany {
  id: string
  name: string
  name_arabic: string | null
  company_type: 'startup' | 'enterprise' | 'government' | 'telecom_provider' | 'other'
  
  country: GCCCountry
  city: string | null
  headquarters: string | null
  
  sector: ITCCategory
  sub_sector: string | null
  description: string | null
  founded_year: number | null
  employee_count: string | null
  
  website: string | null
  linkedin_url: string | null
  twitter_handle: string | null
  
  total_funding_usd: number | null
  latest_valuation_usd: number | null
  latest_round_type: string | null
  latest_round_date: string | null
  
  key_investors: string[] | null
  strategic_partners: string[] | null
  
  is_active: boolean
  importance_level: ImportanceLevel | null
  tracking_reason: string | null
  
  ai_company_summary: string | null
  competitive_position: string | null
  
  created_at: string
  updated_at: string
}

// Market Trend
export interface MarketTrend {
  id: string
  trend_name: string
  trend_type: 'technology' | 'regulatory' | 'investment' | 'market_shift' | 'consumer_behavior' | 'other'
  
  countries: GCCCountry[]
  sectors: ITCCategory[]
  
  description: string
  key_indicators: string[] | null
  supporting_evidence: string[] | null
  
  identified_date: string
  start_date: string | null
  projected_impact_date: string | null
  
  impact_level: ImpactLevel | null
  confidence_level: ConfidenceLevel | null
  maturity_stage: MaturityStage | null
  
  companies_affected: string[] | null
  related_news_ids: string[] | null
  
  momentum_score: number | null
  market_size_estimate_usd: number | null
  growth_rate_pct: number | null
  
  ai_trend_analysis: string | null
  opportunity_score: number | null
  
  is_active: boolean
  created_at: string
  updated_at: string
}

// Regulatory Change
export interface RegulatoryChange {
  id: string
  title: string
  description: string
  
  issuing_authority: string
  country: GCCCountry
  
  policy_type: 'license' | 'regulation' | 'guideline' | 'framework' | 'incentive' | 'other'
  sectors_affected: ITCCategory[]
  
  announcement_date: string
  effective_date: string | null
  compliance_deadline: string | null
  
  impact_level: ImpactLevel | null
  companies_affected: string[] | null
  estimated_market_impact_usd: number | null
  
  official_document_url: string | null
  related_news_ids: string[] | null
  
  opportunities: string[] | null
  challenges: string[] | null
  ai_impact_analysis: string | null
  
  created_at: string
  updated_at: string
}

// Intelligence Report
export interface IntelligenceReport {
  id: string
  report_type: 'daily_brief' | 'weekly_summary' | 'sector_analysis' | 'company_spotlight' | 'trend_report' | 'regulatory_update'
  title: string
  
  countries: GCCCountry[] | null
  sectors: ITCCategory[] | null
  date_range_start: string | null
  date_range_end: string | null
  
  executive_summary: string
  key_highlights: string[] | null
  detailed_analysis: string | null
  
  news_items_analyzed: number | null
  companies_covered: number | null
  trends_identified: number | null
  
  opportunities: string[] | null
  risks: string[] | null
  recommendations: string[] | null
  
  market_sentiment: MarketSentiment | null
  activity_level: ActivityLevel | null
  
  source_news_ids: string[] | null
  featured_company_ids: string[] | null
  featured_trend_ids: string[] | null
  
  is_published: boolean
  published_at: string | null
  
  created_at: string
  updated_at: string
}

// Market Event
export interface MarketEvent {
  id: string
  event_name: string
  event_type: 'conference' | 'product_launch' | 'partnership' | 'funding_round' | 'government_initiative' | 'other'
  
  description: string | null
  organizer: string | null
  venue: string | null
  country: GCCCountry
  city: string | null
  
  event_date: string
  end_date: string | null
  registration_deadline: string | null
  
  key_speakers: string[] | null
  participating_companies: string[] | null
  expected_attendees: string | null
  
  sectors: ITCCategory[] | null
  importance_level: ImportanceLevel | null
  
  event_url: string | null
  registration_url: string | null
  related_news_ids: string[] | null
  
  is_attended: boolean
  attendance_notes: string | null
  
  created_at: string
  updated_at: string
}

// Data Collection Job
export interface DataCollectionJob {
  id: string
  job_type: 'news_scraper' | 'company_updater' | 'trend_analyzer' | 'report_generator'
  source: string
  
  status: 'scheduled' | 'running' | 'completed' | 'failed'
  started_at: string | null
  completed_at: string | null
  
  items_collected: number
  items_processed: number
  items_failed: number
  error_message: string | null
  
  config: Record<string, any> | null
  
  is_recurring: boolean
  schedule_cron: string | null
  last_successful_run: string | null
  next_scheduled_run: string | null
  
  created_at: string
  updated_at: string
}

// Dashboard Statistics
export interface MarketIntelligenceStats {
  total_news_items: number
  news_last_24h: number
  news_last_7d: number
  
  tracked_companies: number
  active_trends: number
  upcoming_events: number
  
  sentiment_breakdown: {
    positive: number
    negative: number
    neutral: number
  }
  
  category_breakdown: {
    category: ITCCategory
    count: number
    trend: 'up' | 'down' | 'stable'
  }[]
  
  country_breakdown: {
    country: GCCCountry
    news_count: number
    company_count: number
  }[]
  
  top_sources: {
    source: string
    count: number
  }[]
  
  recent_updates: MarketIntelligenceNews[]
}

// Filters for querying
export interface MarketIntelligenceFilters {
  countries?: GCCCountry[]
  categories?: ITCCategory[]
  date_from?: string
  date_to?: string
  sentiment?: Sentiment
  impact_level?: ImpactLevel
  sources?: string[]
  search_query?: string
}

// Trend Analysis Result
export interface TrendAnalysis {
  trend_id: string
  trend_name: string
  momentum: 'accelerating' | 'stable' | 'declining'
  recent_news_count: number
  key_developments: string[]
  affected_companies: string[]
  investment_activity: {
    total_funding: number
    deal_count: number
  }
  market_signals: {
    signal: string
    strength: 'strong' | 'moderate' | 'weak'
  }[]
}

// News Feed Item (enriched for display)
export interface NewsFeedItem extends MarketIntelligenceNews {
  company_details?: GCCITCCompany[]
  related_trends?: MarketTrend[]
  similar_news?: MarketIntelligenceNews[]
}
