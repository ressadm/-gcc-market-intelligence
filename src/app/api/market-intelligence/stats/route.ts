import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { MarketIntelligenceStats } from '@/lib/market-intelligence-types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/market-intelligence/stats
 * Fetches market intelligence dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Total news items
    const { count: totalNews } = await supabase
      .from('market_intelligence_news')
      .select('*', { count: 'exact', head: true })
      .eq('is_relevant', true)

    // News last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const { count: news24h } = await supabase
      .from('market_intelligence_news')
      .select('*', { count: 'exact', head: true })
      .eq('is_relevant', true)
      .gte('published_date', yesterday.toISOString())

    // News last 7 days
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    const { count: news7d } = await supabase
      .from('market_intelligence_news')
      .select('*', { count: 'exact', head: true })
      .eq('is_relevant', true)
      .gte('published_date', lastWeek.toISOString())

    // Tracked companies
    const { count: companiesCount } = await supabase
      .from('gcc_itc_companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Active trends
    const { count: trendsCount } = await supabase
      .from('market_trends')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Upcoming events (next 30 days)
    const today = new Date()
    const next30Days = new Date()
    next30Days.setDate(next30Days.getDate() + 30)
    const { count: eventsCount } = await supabase
      .from('market_events')
      .select('*', { count: 'exact', head: true })
      .gte('event_date', today.toISOString().split('T')[0])
      .lte('event_date', next30Days.toISOString().split('T')[0])

    // Sentiment breakdown (last 30 days)
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    const { data: sentimentData } = await supabase
      .from('market_intelligence_news')
      .select('sentiment')
      .eq('is_relevant', true)
      .gte('published_date', last30Days.toISOString())
      .not('sentiment', 'is', null)

    const sentimentBreakdown = {
      positive: sentimentData?.filter(n => n.sentiment === 'positive').length || 0,
      negative: sentimentData?.filter(n => n.sentiment === 'negative').length || 0,
      neutral: sentimentData?.filter(n => n.sentiment === 'neutral').length || 0
    }

    // Category breakdown (last 30 days)
    const { data: categoryData } = await supabase
      .from('market_intelligence_news')
      .select('category')
      .eq('is_relevant', true)
      .gte('published_date', last30Days.toISOString())

    const categoryCounts: Record<string, number> = {}
    categoryData?.forEach(n => {
      categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1
    })

    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category: category as any,
        count,
        trend: 'stable' as const // TODO: Calculate actual trend
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Country breakdown
    const { data: countryNewsData } = await supabase
      .from('market_intelligence_news')
      .select('primary_country')
      .eq('is_relevant', true)
      .gte('published_date', last30Days.toISOString())

    const countryNewsCounts: Record<string, number> = {}
    countryNewsData?.forEach(n => {
      countryNewsCounts[n.primary_country] = (countryNewsCounts[n.primary_country] || 0) + 1
    })

    const { data: countryCompaniesData } = await supabase
      .from('gcc_itc_companies')
      .select('country')
      .eq('is_active', true)

    const countryCompaniesCounts: Record<string, number> = {}
    countryCompaniesData?.forEach(c => {
      countryCompaniesCounts[c.country] = (countryCompaniesCounts[c.country] || 0) + 1
    })

    const countries = Array.from(new Set([
      ...Object.keys(countryNewsCounts),
      ...Object.keys(countryCompaniesCounts)
    ]))

    const countryBreakdown = countries.map(country => ({
      country: country as any,
      news_count: countryNewsCounts[country] || 0,
      company_count: countryCompaniesCounts[country] || 0
    }))

    // Top sources (last 30 days)
    const { data: sourcesData } = await supabase
      .from('market_intelligence_news')
      .select('source')
      .eq('is_relevant', true)
      .gte('published_date', last30Days.toISOString())

    const sourceCounts: Record<string, number> = {}
    sourcesData?.forEach(n => {
      sourceCounts[n.source] = (sourceCounts[n.source] || 0) + 1
    })

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Recent updates (last 10 news items)
    const { data: recentNews } = await supabase
      .from('market_intelligence_news')
      .select('*')
      .eq('is_relevant', true)
      .order('published_date', { ascending: false })
      .limit(10)

    const stats: MarketIntelligenceStats = {
      total_news_items: totalNews || 0,
      news_last_24h: news24h || 0,
      news_last_7d: news7d || 0,
      tracked_companies: companiesCount || 0,
      active_trends: trendsCount || 0,
      upcoming_events: eventsCount || 0,
      sentiment_breakdown: sentimentBreakdown,
      category_breakdown: categoryBreakdown,
      country_breakdown: countryBreakdown,
      top_sources: topSources,
      recent_updates: recentNews || []
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching market intelligence stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    )
  }
}
