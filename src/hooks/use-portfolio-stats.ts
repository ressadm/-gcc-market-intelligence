'use client'

import { useMemo } from 'react'
import { usePortfolio } from './use-portfolio'
import { aggregatePortfolioCHF } from '@/lib/fx'
import type { PortfolioStats, PortfolioCompany } from '@/lib/types'

interface UsePortfolioStatsReturn {
  stats: PortfolioStats
  companies: PortfolioCompany[]
  fxRates: Record<string, number>
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const emptyStats: PortfolioStats = {
  companyCount: 0,
  totalInvestedCHF: 0,
  totalCurrentValueCHF: 0,
  totalDistributionsCHF: 0,
  totalValueCHF: 0,
  portfolioMoic: 0,
  unrealizedPnlCHF: 0,
  fxImpactPct: 0,
  staleCount: 0,
  currencyBreakdown: [],
  sectorBreakdown: [],
  sourceBreakdown: [],
  stageBreakdown: [],
}

export function usePortfolioStats(): UsePortfolioStatsReturn {
  const { companies, fxRates, isLoading, error, refetch } = usePortfolio()

  const stats = useMemo(() => {
    if (companies.length === 0) return emptyStats
    return aggregatePortfolioCHF(companies, fxRates)
  }, [companies, fxRates])

  return { stats, companies, fxRates, isLoading, error, refetch }
}
