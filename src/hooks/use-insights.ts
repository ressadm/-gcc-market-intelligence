'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AgentInsight } from '@/lib/types'

interface UseInsightsReturn {
  insights: AgentInsight[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  refetch: () => void
  markRead: (id: string) => Promise<void>
  dismiss: (id: string) => Promise<void>
}

export function useInsights(): UseInsightsReturn {
  const [insights, setInsights] = useState<AgentInsight[]>([])
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
          .from('agent_insights')
          .select('*')
          .eq('is_dismissed', false)
          .order('created_at', { ascending: false })
          .limit(50)

        if (queryError) throw new Error(queryError.message)
        if (cancelled) return

        setInsights(data as AgentInsight[])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch insights')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [fetchKey])

  const markRead = useCallback(async (id: string) => {
    await supabase.from('agent_insights').update({ is_read: true }).eq('id', id)
    setInsights(prev => prev.map(i => i.id === id ? { ...i, is_read: true } : i))
  }, [])

  const dismiss = useCallback(async (id: string) => {
    await supabase.from('agent_insights').update({ is_dismissed: true }).eq('id', id)
    setInsights(prev => prev.filter(i => i.id !== id))
  }, [])

  const unreadCount = insights.filter(i => !i.is_read).length

  return {
    insights,
    unreadCount,
    isLoading,
    error,
    refetch: () => setFetchKey(k => k + 1),
    markRead,
    dismiss,
  }
}
