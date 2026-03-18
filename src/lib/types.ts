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
