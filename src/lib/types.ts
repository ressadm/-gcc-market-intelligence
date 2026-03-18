export interface PortfolioCompany {
  company_id: string
  name: string
  status: string
  sector: string | null
  vehicle: string | null
  investment_currency: string | null
  total_invested: number
  total_distributions: number
  latest_valuation: number | null
  latest_valuation_date: string | null
  latest_share_price: number | null
  total_shares: number | null
  first_investment_date: string | null
  original_fx_rate: number | null
  days_since_valuation: number | null
  is_stale: boolean
  moic: number | null
  current_value: number
  total_value: number
}

export interface FxRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  rate_date: string
  source: string
  created_at: string
}

export interface PortfolioStats {
  companyCount: number
  totalInvestedCHF: number
  totalCurrentValueCHF: number
  totalDistributionsCHF: number
  totalValueCHF: number
  portfolioMoic: number
  unrealizedPnlCHF: number
  fxImpactPct: number
  staleCount: number
  currencyBreakdown: CurrencyBreakdown[]
  sectorBreakdown: SectorBreakdown[]
}

export interface Transaction {
  id: string
  company_id: string
  type: string
  amount_orig: number
  orig_currency: string
  fx_rate_orig_to_chf: number | null
  price_per_share_orig: number | null
  shares: number | null
  date: string
  is_cash_event: boolean
  notes: string | null
}

export interface CurrencyBreakdown {
  currency: string
  count: number
  investedCHF: number
  currentValueCHF: number
}

export interface SectorBreakdown {
  sector: string
  count: number
  investedCHF: number
  currentValueCHF: number
}

// Deal Pipeline types

export type DealStage =
  | 'discovered'
  | 'screening'
  | 'evaluating'
  | 'decision'
  | 'committed'
  | 'closed'
  | 'passed'
  | 'expired'
  | 'withdrawn'

export interface DealPipelineSummary {
  deal_id: string
  deal_name: string
  stage: DealStage
  source: string | null
  sector: string | null
  created_at: string
  updated_at: string
  days_in_stage: number
  total_days: number
  is_aging: boolean
  team_rating: number | null
  market_rating: number | null
  product_rating: number | null
  traction_rating: number | null
  ai_score: number | null
  ai_recommendation: string | null
  activity_count: number
  latest_activity: string | null
}

export interface Deal {
  id: string
  company_id: string | null
  deal_name: string
  stage: DealStage
  source_channel: string | null
  one_liner: string | null
  priority: string | null
  tags: string[] | null
  company_sector: string | null
  round_type: string | null
  round_size_usd: number | null
  valuation_pre_usd: number | null
  instrument: string | null
  allocation_target: number | null
  allocation_min: number | null
  allocation_max: number | null
  allocation_currency: string | null
  decision: string | null
  decision_confidence: number | null
  decision_reason: string | null
  decision_date: string | null
  evaluation_data: {
    team_rating?: number
    market_rating?: number
    product_rating?: number
    traction_rating?: number
  } | null
  agent_score_json: {
    overall_score?: number
    recommendation?: string
  } | null
  created_at: string
  updated_at: string
}

export interface DealActivity {
  id: string
  deal_id: string
  activity_type: string
  title: string
  content: string | null
  created_at: string
}
