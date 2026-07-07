import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/layout/PageContainer'

import { SitterGrid } from '@/components/sitters/SitterGrid'
import { SitterFilters } from '@/components/sitters/SitterFilters'
import type { SitterWithProfile } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Browse Sitters | PetCare',
  description: 'Find trusted pet sitters near you.',
}

interface RawSitterRow {
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

function normaliseSitters(rows: RawSitterRow[]): SitterWithProfile[] {
  const mapped: Array<SitterWithProfile | null> = rows
    .map((row) => {
      const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile
      if (!profile) return null
      return {
        ...row,
        years_of_experience: row.years_of_experience ?? undefined,
        services_offered: row.services_offered ?? undefined,
        profile,
      }
    })

  return mapped.filter((row): row is SitterWithProfile => row !== null)
}

function parseNumber(value: unknown): number | null {
  if (typeof value !== 'string') return null
  if (!value.trim()) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function parseServicesParam(value: unknown): string[] {
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseBooleanParam(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return value === '1' || value.toLowerCase() === 'true'
}

export default async function DashboardSittersPage({
  searchParams,
}: {
  searchParams?: Promise<{ city?: string; min?: string; max?: string; services?: string; hotel?: string }>
}) {
  const db = createAdminClient()

  const params = await searchParams
  const city = params?.city?.trim() ?? ''
  const min = parseNumber(params?.min)
  const max = parseNumber(params?.max)
  const services = parseServicesParam(params?.services)
  const hotelOnly = parseBooleanParam(params?.hotel)

  let query = db
    .from('sitter_profiles')
    .select(
      `
        id, profile_id, price_per_day, years_of_experience,
        services_offered, can_host_at_home, created_at,
        profile:profiles ( first_name, last_name, city, bio, image_url )
      `
    )

  if (min != null) query = query.gte('price_per_day', min)
  if (max != null) query = query.lte('price_per_day', max)

  if (city) {
    // Filter by city on joined profiles table
    query = query.ilike('profiles.city', `%${city}%`)
  }

  if (services.length) {
    // Match any selected service id in the comma-separated DB string
    const orExpr = services.map((s) => `services_offered.ilike.%${s}%`).join(',')
    query = query.or(orExpr)
  }

  if (hotelOnly) {
    query = query.eq('can_host_at_home', true)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  const sitters = normaliseSitters((data as RawSitterRow[]) ?? [])
  const count = sitters.length

  return (
    <PageContainer className="py-10 sm:py-12">
      <div className="rounded-3xl bg-gradient-to-br from-violet-50 via-indigo-50 to-white border border-indigo-100 p-8 sm:p-10 mb-10 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Browse sitters</h1>
        <p className="text-sm text-gray-500 mt-2">
          {count === 0 ? 'No sitters available yet' : `${count} ${count === 1 ? 'sitter' : 'sitters'} available`}
        </p>
      </div>

      <div className="flex gap-8 lg:gap-10">
        {/* Aside - Filters */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-20">
            <SitterFilters
              initial={{
                city,
                minPrice: params?.min ?? '',
                maxPrice: params?.max ?? '',
                services,
                hotelOnly,
              }}
              totalCount={count}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile filters */}
          <div className="lg:hidden mb-6">
            <SitterFilters
              initial={{
                city,
                minPrice: params?.min ?? '',
                maxPrice: params?.max ?? '',
                services,
                hotelOnly,
              }}
              totalCount={count}
            />
          </div>

          {error ? (
            <div className="rounded-3xl bg-red-50 border border-red-100 px-6 py-10 text-center">
              <p className="text-red-700 font-semibold mb-1">Failed to load sitters.</p>
              <p className="text-red-500 text-sm">Please try refreshing the page.</p>
            </div>
          ) : (
            <SitterGrid sitters={sitters} />
          )}
        </main>
      </div>
    </PageContainer>
  )
}
