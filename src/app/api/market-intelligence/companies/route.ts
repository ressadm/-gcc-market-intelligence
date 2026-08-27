import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/market-intelligence/companies
 * Fetches GCC ITC companies with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    const countries = searchParams.get('countries')?.split(',')
    const sectors = searchParams.get('sectors')?.split(',')
    const companyTypes = searchParams.get('types')?.split(',')
    const importanceLevels = searchParams.get('importance')?.split(',')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('gcc_itc_companies')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('importance_level', { ascending: true })
      .order('name', { ascending: true })

    if (countries && countries.length > 0) {
      query = query.in('country', countries)
    }

    if (sectors && sectors.length > 0) {
      query = query.in('sector', sectors)
    }

    if (companyTypes && companyTypes.length > 0) {
      query = query.in('company_type', companyTypes)
    }

    if (importanceLevels && importanceLevels.length > 0) {
      query = query.in('importance_level', importanceLevels)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,name_arabic.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch companies', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      companies: data || [],
      total: count,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Error in companies API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/market-intelligence/companies
 * Creates a new company entry
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('gcc_itc_companies')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      return NextResponse.json(
        { error: 'Failed to create company', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ company: data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in company creation:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
