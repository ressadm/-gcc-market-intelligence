'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PortfolioCompany, FxRate, Transaction } from '@/lib/types'

interface UseCompanyDetailReturn {
  company: PortfolioCompany | null
  transactions: Transaction[]
  fxRates: Record<string, number>
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useCompanyDetail(companyId: string): UseCompanyDetailReturn {
  const [company, setCompany] = useState<PortfolioCompany | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [fxRates, setFxRates] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  const refetch = useCallback(() => setFetchKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const [companyRes, txnRes, fxRes] = await Promise.all([
          supabase
            .from('portfolio_summary')
            .select('*')
            .eq('company_id', companyId)
            .single(),
          supabase
            .from('transactions')
            .select('*')
            .eq('company_id', companyId)
            .order('date', { ascending: true }),
          supabase
            .from('fx_rate_snapshots')
            .select('*')
            .eq('to_currency', 'CHF')
            .order('rate_date', { ascending: false }),
        ])

        if (cancelled) return

        if (companyRes.error) {
          if (companyRes.error.code === 'PGRST116') {
            setError('Company not found')
          } else {
            throw new Error(companyRes.error.message)
          }
          return
        }

        if (txnRes.error) throw new Error(txnRes.error.message)
        if (fxRes.error) throw new Error(fxRes.error.message)

        setCompany(companyRes.data as PortfolioCompany)
        setTransactions(txnRes.data as Transaction[])

        const rateMap: Record<string, number> = { CHF: 1 }
        for (const rate of fxRes.data as FxRate[]) {
          if (!rateMap[rate.from_currency]) {
            rateMap[rate.from_currency] = rate.rate
          }
        }
        setFxRates(rateMap)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch company data')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [companyId, fetchKey])

  return { company, transactions, fxRates, isLoading, error, refetch }
}
