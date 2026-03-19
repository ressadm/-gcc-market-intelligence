'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface AppSettings {
  investment_budget_chf: number
  portfolio_compact_view: boolean
}

const DEFAULTS: AppSettings = {
  investment_budget_chf: 1_000_000,
  portfolio_compact_view: false,
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('app_settings')
      .select('key, value')

    if (err) {
      // Table might not exist yet — use defaults
      setSettings(DEFAULTS)
      setIsLoading(false)
      return
    }

    const merged = { ...DEFAULTS }
    for (const row of data || []) {
      if (row.key === 'investment_budget_chf') {
        merged.investment_budget_chf = Number(row.value) || DEFAULTS.investment_budget_chf
      }
      if (row.key === 'portfolio_compact_view') {
        merged.portfolio_compact_view = row.value === 'true'
      }
    }
    setSettings(merged)
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const updateSetting = useCallback(async (key: string, value: string | number) => {
    const stringVal = String(value)
    // Upsert: try update first, then insert if not found
    const { data: existing } = await supabase
      .from('app_settings')
      .select('key')
      .eq('key', key)
      .single()

    let err
    if (existing) {
      const result = await supabase
        .from('app_settings')
        .update({ value: stringVal, updated_at: new Date().toISOString() })
        .eq('key', key)
      err = result.error
    } else {
      const result = await supabase
        .from('app_settings')
        .insert({ key, value: stringVal })
      err = result.error
    }

    if (err) {
      setError(err.message)
      return false
    }

    await fetchSettings()
    return true
  }, [fetchSettings])

  return { settings, isLoading, error, updateSetting, refetch: fetchSettings }
}
