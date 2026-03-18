'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PortfolioCompany, FxRate } from '@/lib/types'

interface UsePortfolioReturn {
  companies: PortfolioCompany[]
  fxRates: Record<string, number>
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function usePortfolio(): UsePortfolioReturn {
  const [companies, setCompanies] = useState<PortfolioCompany[]>([])
  const [fxRates, setFxRates] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const [portfolioRes, fxRes] = await Promise.all([
          supabase.from('portfolio_summary').select('*'),
          supabase
            .from('fx_rate_snapshots')
            .select('*')
            .eq('to_currency', 'CHF')
            .order('rate_date', { ascending: false }),
        ])

        if (portfolioRes.error) throw new Error(portfolioRes.error.message)
        if (fxRes.error) throw new Error(fxRes.error.message)

        if (cancelled) return

        setCompanies(portfolioRes.data as PortfolioCompany[])

        // Build FX rate map: latest rate per currency → CHF
        const rateMap: Record<string, number> = { CHF: 1 }
        for (const rate of fxRes.data as FxRate[]) {
          if (!rateMap[rate.from_currency]) {
            rateMap[rate.from_currency] = rate.rate
          }
        }
        setFxRates(rateMap)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [fetchKey])

  return {
    companies,
    fxRates,
    isLoading,
    error,
    refetch: () => setFetchKey(k => k + 1),
  }
}
