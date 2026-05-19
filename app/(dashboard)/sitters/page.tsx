import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/layout/PageContainer'

import { SitterGrid } from '@/components/sitters/SitterGrid'
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
    | { first_name: string; last_name: string; city: string | null; bio: string | null }
    | { first_name: string; last_name: string; city: string | null; bio: string | null }[]
}

function normaliseSitters(rows: RawSitterRow[]): SitterWithProfile[] {
  return rows.map((row) => ({
    ...row,
    years_of_experience: row.years_of_experience ?? undefined,
    services_offered: row.services_offered ?? undefined,
    profile: Array.isArray(row.profile) ? row.profile[0] : row.profile,
  }))
}

export default async function DashboardSittersPage() {
  const db = createAdminClient()

  const { data, error } = await db
    .from('sitter_profiles')
    .select(`
      id, profile_id, price_per_day, years_of_experience,
      services_offered, can_host_at_home, created_at,
      profile:profiles ( first_name, last_name, city, bio )
    `)
    .order('created_at', { ascending: false })

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

      {error ? (
        <div className="rounded-3xl bg-red-50 border border-red-100 px-6 py-10 text-center">
          <p className="text-red-700 font-semibold mb-1">Failed to load sitters.</p>
          <p className="text-red-500 text-sm">Please try refreshing the page.</p>
        </div>
      ) : (
        <SitterGrid sitters={sitters} />
      )}
    </PageContainer>
  )
}
