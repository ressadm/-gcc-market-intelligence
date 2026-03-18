'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { DealPipelineSummary } from '@/lib/types'

interface UsePipelineReturn {
  deals: DealPipelineSummary[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function usePipeline(): UsePipelineReturn {
  const [deals, setDeals] = useState<DealPipelineSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error: queryError } = await supabase
          .from('deal_pipeline_summary')
          .select('*')
          .order('updated_at', { ascending: false })

        if (queryError) throw new Error(queryError.message)
        if (cancelled) return

        setDeals(data as DealPipelineSummary[])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch pipeline data')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [fetchKey])

  return {
    deals,
    isLoading,
    error,
    refetch: () => setFetchKey(k => k + 1),
  }
}
