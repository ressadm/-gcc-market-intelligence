'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface RealizedTransaction {
  id: string
  company_id: string
  company_name: string
  type: string
  date: string
  amount_orig: number
  orig_currency: string
  amount_chf: number
  shares: number | null
  notes: string | null
}

interface UseRealizedTransactionsReturn {
  transactions: RealizedTransaction[]
  isLoading: boolean
  error: string | null
}

export function useRealizedTransactions(): UseRealizedTransactionsReturn {
  const [transactions, setTransactions] = useState<RealizedTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error: queryError } = await supabase
          .from('transactions')
          .select('id, company_id, type, date, amount_orig, orig_currency, fx_rate_orig_to_chf, shares, notes, companies!inner(name)')
          .in('type', ['EXIT', 'DIST'])
          .order('date', { ascending: false })

        if (queryError) throw new Error(queryError.message)
        if (cancelled) return

        const mapped = (data || []).map((t: Record<string, unknown>) => ({
          id: t.id as string,
          company_id: t.company_id as string,
          company_name: (t.companies as { name: string })?.name || 'Unknown',
          type: t.type as string,
          date: t.date as string,
          amount_orig: t.amount_orig as number,
          orig_currency: t.orig_currency as string,
          amount_chf: (t.amount_orig as number) * ((t.fx_rate_orig_to_chf as number) || 1),
          shares: t.shares as number | null,
          notes: t.notes as string | null,
        }))

        setTransactions(mapped)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch realized transactions')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  return { transactions, isLoading, error }
}
