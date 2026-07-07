import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/server'

type HotelSort = 'latest' | 'price_asc' | 'price_desc'

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return parsed
}

function parseSort(value: string | null): HotelSort {
  if (value === 'price_asc' || value === 'price_desc') return value
  return 'latest'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')?.trim() ?? ''
  const sort = parseSort(searchParams.get('sort'))
  const page = parsePositiveInt(searchParams.get('page'), 1)
  const limit = Math.min(parsePositiveInt(searchParams.get('limit'), 10), 50)

  const from = (page - 1) * limit
  const to = from + limit - 1

  const db = createAdminClient()

  function buildInternalHotelsQuery(strict: boolean) {
    let query = db
      .from('sitter_profiles')
      .select(
        `
          id,
          profile_id,
          price_per_day,
          years_of_experience,
          services_offered,
          can_host_at_home,
          created_at,
          profile:profiles ( first_name, last_name, city, bio, image_url )
        `,
        { count: 'exact' }
      )
      .eq('can_host_at_home', true)

    if (strict) {
      query = query.ilike('services_offered', '%pet-hotel%')
    }

    if (city) {
      query = query.ilike('profiles.city', `%${city}%`)
    }

    if (sort === 'price_asc') {
      query = query.order('price_per_day', { ascending: true })
    } else if (sort === 'price_desc') {
      query = query.order('price_per_day', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    return query
  }

  let strictMode = true
  let { data, error, count } = await buildInternalHotelsQuery(true).range(from, to)

  if (!error && (count ?? 0) === 0) {
    strictMode = false
    const fallbackResult = await buildInternalHotelsQuery(false).range(from, to)
    data = fallbackResult.data
    error = fallbackResult.error
    count = fallbackResult.count
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items = (data ?? []).map((row) => {
    const record = row as {
      id: string
      profile_id: string
      price_per_day: number
      years_of_experience: number | null
      services_offered: string | null
      can_host_at_home: boolean
      created_at: string
      profile:
        | { first_name: string; last_name: string; city: string | null; bio: string | null; image_url: string | null }
        | { first_name: string; last_name: string; city: string | null; bio: string | null; image_url: string | null }[]
    }

    return {
      ...record,
      profile: Array.isArray(record.profile) ? record.profile[0] : record.profile,
    }
  })

  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return NextResponse.json({
    items,
    page,
    limit,
    total,
    totalPages,
    sort,
    city,
    strictMode,
  })
}
