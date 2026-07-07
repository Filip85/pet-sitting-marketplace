import { NextRequest, NextResponse } from 'next/server'

import { fetchExternalPetHotelsByCityDetailed } from '@/lib/hotels/external'

function parseLimit(value: string | null): number {
  if (!value) return 30
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return 30
  return Math.min(parsed, 50)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')?.trim() ?? ''
  const limit = parseLimit(searchParams.get('limit'))

  if (!city) {
    return NextResponse.json({ error: 'Query parameter city is required.' }, { status: 400 })
  }

  try {
    const result = await fetchExternalPetHotelsByCityDetailed(city, limit)
    return NextResponse.json({ city, limit, total: result.items.length, items: result.items, debug: result.debug })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch external hotels.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
