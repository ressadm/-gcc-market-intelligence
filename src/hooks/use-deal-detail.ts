'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Deal, DealActivity } from '@/lib/types'

interface UseDealDetailReturn {
  deal: Deal | null
  activities: DealActivity[]
  isLoading: boolean
  error: string | null
}

export function useDealDetail(dealId: string): UseDealDetailReturn {
  const [deal, setDeal] = useState<Deal | null>(null)
  const [activities, setActivities] = useState<DealActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const [dealRes, activityRes] = await Promise.all([
          supabase
            .from('deals')
            .select('*')
            .eq('id', dealId)
            .single(),
          supabase
            .from('deal_activities')
            .select('*')
            .eq('deal_id', dealId)
            .order('created_at', { ascending: false }),
        ])

        if (cancelled) return

        if (dealRes.error) {
          if (dealRes.error.code === 'PGRST116') {
            setError('Deal not found')
          } else {
            throw new Error(dealRes.error.message)
          }
          return
        }

        if (activityRes.error) throw new Error(activityRes.error.message)

        setDeal(dealRes.data as Deal)
        setActivities(activityRes.data as DealActivity[])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch deal data')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [dealId])

  return { deal, activities, isLoading, error }
}
