import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { MarketIntelligenceNews, MarketIntelligenceFilters } from '@/lib/market-intelligence-types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/market-intelligence/news
 * Fetches market intelligence news with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    // Parse filters from query parameters
    const countries = searchParams.get('countries')?.split(',')
    const categories = searchParams.get('categories')?.split(',')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const sentiment = searchParams.get('sentiment')
    const impactLevel = searchParams.get('impact_level')
    const sources = searchParams.get('sources')?.split(',')
    const searchQuery = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('market_intelligence_news')
      .select('*')
      .eq('is_relevant', true)
      .order('published_date', { ascending: false })

    // Apply filters
    if (countries && countries.length > 0) {
      query = query.in('primary_country', countries)
    }

    if (categories && categories.length > 0) {
      query = query.in('category', categories)
    }

    if (dateFrom) {
      query = query.gte('published_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('published_date', dateTo)
    }

    if (sentiment) {
      query = query.eq('sentiment', sentiment)
    }

    if (impactLevel) {
      query = query.eq('impact_level', impactLevel)
    }

    if (sources && sources.length > 0) {
      query = query.in('source', sources)
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%,full_content.ilike.%${searchQuery}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching news:', error)
      return NextResponse.json(
        { error: 'Failed to fetch news', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      news: data || [],
      total: count,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Error in news API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/market-intelligence/news
 * Creates a new news item (for manual entry or integration)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('market_intelligence_news')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating news:', error)
      return NextResponse.json(
        { error: 'Failed to create news', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ news: data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in news creation:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
