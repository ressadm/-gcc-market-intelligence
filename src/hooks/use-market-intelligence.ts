import { useState, useEffect } from 'react'
import {
  MarketIntelligenceStats,
  MarketIntelligenceNews,
  GCCITCCompany,
  MarketTrend,
  IntelligenceReport,
  MarketIntelligenceFilters
} from '@/lib/market-intelligence-types'

/**
 * Hook for fetching market intelligence statistics
 */
export function useMarketIntelligenceStats() {
  const [stats, setStats] = useState<MarketIntelligenceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/market-intelligence/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, isLoading, error, refetch: fetchStats }
}

/**
 * Hook for fetching news with filters
 */
export function useMarketNews(filters?: MarketIntelligenceFilters, limit: number = 50) {
  const [news, setNews] = useState<MarketIntelligenceNews[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.countries) params.set('countries', filters.countries.join(','))
      if (filters?.categories) params.set('categories', filters.categories.join(','))
      if (filters?.date_from) params.set('date_from', filters.date_from)
      if (filters?.date_to) params.set('date_to', filters.date_to)
      if (filters?.sentiment) params.set('sentiment', filters.sentiment)
      if (filters?.impact_level) params.set('impact_level', filters.impact_level)
      if (filters?.sources) params.set('sources', filters.sources.join(','))
      if (filters?.search_query) params.set('search', filters.search_query)
      params.set('limit', limit.toString())

      const response = await fetch(`/api/market-intelligence/news?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      
      const data = await response.json()
      setNews(data.news)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching news:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [JSON.stringify(filters), limit])

  return { news, total, isLoading, error, refetch: fetchNews }
}

/**
 * Hook for fetching GCC ITC companies
 */
export function useGCCCompanies(filters?: {
  countries?: string[]
  sectors?: string[]
  types?: string[]
  importance?: string[]
  search?: string
}, limit: number = 100) {
  const [companies, setCompanies] = useState<GCCITCCompany[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.countries) params.set('countries', filters.countries.join(','))
      if (filters?.sectors) params.set('sectors', filters.sectors.join(','))
      if (filters?.types) params.set('types', filters.types.join(','))
      if (filters?.importance) params.set('importance', filters.importance.join(','))
      if (filters?.search) params.set('search', filters.search)
      params.set('limit', limit.toString())

      const response = await fetch(`/api/market-intelligence/companies?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }
      
      const data = await response.json()
      setCompanies(data.companies)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching companies:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [JSON.stringify(filters), limit])

  return { companies, total, isLoading, error, refetch: fetchCompanies }
}

/**
 * Hook for fetching market trends
 */
export function useMarketTrends(filters?: {
  countries?: string[]
  sectors?: string[]
  types?: string[]
  impact?: string[]
  maturity?: string[]
}, limit: number = 50) {
  const [trends, setTrends] = useState<MarketTrend[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrends = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.countries) params.set('countries', filters.countries.join(','))
      if (filters?.sectors) params.set('sectors', filters.sectors.join(','))
      if (filters?.types) params.set('types', filters.types.join(','))
      if (filters?.impact) params.set('impact', filters.impact.join(','))
      if (filters?.maturity) params.set('maturity', filters.maturity.join(','))
      params.set('limit', limit.toString())

      const response = await fetch(`/api/market-intelligence/trends?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch trends')
      }
      
      const data = await response.json()
      setTrends(data.trends)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching trends:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends()
  }, [JSON.stringify(filters), limit])

  return { trends, total, isLoading, error, refetch: fetchTrends }
}

/**
 * Hook for fetching intelligence reports
 */
export function useIntelligenceReports(filters?: {
  types?: string[]
  countries?: string[]
  sectors?: string[]
  published?: boolean
}, limit: number = 20) {
  const [reports, setReports] = useState<IntelligenceReport[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.types) params.set('types', filters.types.join(','))
      if (filters?.countries) params.set('countries', filters.countries.join(','))
      if (filters?.sectors) params.set('sectors', filters.sectors.join(','))
      if (filters?.published !== undefined) params.set('published', filters.published.toString())
      params.set('limit', limit.toString())

      const response = await fetch(`/api/market-intelligence/reports?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      
      const data = await response.json()
      setReports(data.reports)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching reports:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [JSON.stringify(filters), limit])

  return { reports, total, isLoading, error, refetch: fetchReports }
}
