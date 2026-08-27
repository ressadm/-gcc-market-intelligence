import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/market-intelligence/reports
 * Fetches intelligence reports
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    const reportTypes = searchParams.get('types')?.split(',')
    const countries = searchParams.get('countries')?.split(',')
    const sectors = searchParams.get('sectors')?.split(',')
    const publishedOnly = searchParams.get('published') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('intelligence_reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (publishedOnly) {
      query = query.eq('is_published', true)
    }

    if (reportTypes && reportTypes.length > 0) {
      query = query.in('report_type', reportTypes)
    }

    if (countries && countries.length > 0) {
      query = query.overlaps('countries', countries)
    }

    if (sectors && sectors.length > 0) {
      query = query.overlaps('sectors', sectors)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reports: data || [],
      total: count,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Error in reports API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/market-intelligence/reports
 * Creates a new intelligence report
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('intelligence_reports')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating report:', error)
      return NextResponse.json(
        { error: 'Failed to create report', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ report: data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in report creation:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
