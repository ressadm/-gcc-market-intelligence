import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/market-intelligence/trends
 * Fetches market trends with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    const countries = searchParams.get('countries')?.split(',')
    const sectors = searchParams.get('sectors')?.split(',')
    const trendTypes = searchParams.get('types')?.split(',')
    const impactLevels = searchParams.get('impact')?.split(',')
    const maturityStages = searchParams.get('maturity')?.split(',')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('market_trends')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('impact_level', { ascending: true })
      .order('identified_date', { ascending: false })

    if (countries && countries.length > 0) {
      query = query.overlaps('countries', countries)
    }

    if (sectors && sectors.length > 0) {
      query = query.overlaps('sectors', sectors)
    }

    if (trendTypes && trendTypes.length > 0) {
      query = query.in('trend_type', trendTypes)
    }

    if (impactLevels && impactLevels.length > 0) {
      query = query.in('impact_level', impactLevels)
    }

    if (maturityStages && maturityStages.length > 0) {
      query = query.in('maturity_stage', maturityStages)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching trends:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trends', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      trends: data || [],
      total: count,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Error in trends API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/market-intelligence/trends
 * Creates a new trend entry
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('market_trends')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating trend:', error)
      return NextResponse.json(
        { error: 'Failed to create trend', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ trend: data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in trend creation:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
