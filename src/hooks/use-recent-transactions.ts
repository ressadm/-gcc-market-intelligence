'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface RecentTransaction {
  id: string
  company_id: string
  company_name: string
  type: string
  amount_orig: number
  orig_currency: string
  date: string
  is_cash_event: boolean
}

interface UseRecentTransactionsReturn {
  transactions: RecentTransaction[]
  isLoading: boolean
  error: string | null
}

export function useRecentTransactions(limit: number = 5): UseRecentTransactionsReturn {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
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
          .select('id, company_id, type, amount_orig, orig_currency, date, is_cash_event, companies!inner(name)')
          .order('date', { ascending: false })
          .limit(limit)

        if (queryError) throw new Error(queryError.message)
        if (cancelled) return

        const mapped = (data || []).map((t: Record<string, unknown>) => ({
          id: t.id as string,
          company_id: t.company_id as string,
          company_name: (t.companies as { name: string })?.name || 'Unknown',
          type: t.type as string,
          amount_orig: t.amount_orig as number,
          orig_currency: t.orig_currency as string,
          date: t.date as string,
          is_cash_event: t.is_cash_event as boolean,
        }))

        setTransactions(mapped)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [limit])

  return { transactions, isLoading, error }
}
