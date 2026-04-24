import type { Metadata } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabase/server'

export const dynamic = 'force-dynamic'
import { SitterGrid } from '../../../components/sitters/SitterGrid'
import type { SitterWithProfile } from '../../../types'

export const metadata: Metadata = {
  title: 'Browse Sitters | PetCare',
  description: 'Find trusted pet sitters near you.',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
// Without generated DB types, Supabase infers joined relations as arrays.
// At runtime the FK is many-to-one so it is always a single object —
// we normalise defensively so the code never breaks either way.

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

async function fetchSitters(): Promise<{ sitters: SitterWithProfile[]; error: string | null }> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('sitter_profiles')
      .select(`
        id,
        profile_id,
        price_per_day,
        years_of_experience,
        services_offered,
        can_host_at_home,
        created_at,
        profile:profiles (
          first_name,
          last_name,
          city,
          bio
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Dashboard/SittersPage] Supabase error:', error.message)
      return { sitters: [], error: error.message }
    }

    return { sitters: normaliseSitters((data as RawSitterRow[]) ?? []), error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Dashboard/SittersPage] Unexpected error:', message)
    return { sitters: [], error: message }
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardSittersPage() {
  const { sitters, error } = await fetchSitters()
  const count = sitters.length

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Browse Sitters</h1>
        <p className="text-gray-400 text-sm">
          {count === 0 ? 'No sitters available yet' : `${count} ${count === 1 ? 'sitter' : 'sitters'} available`}
        </p>
      </div>

      {/* Error state */}
      {error ? (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-6 py-10 text-center">
          <p className="text-red-700 font-semibold mb-1">Failed to load sitters.</p>
          <p className="text-red-400 text-sm">Please try refreshing the page.</p>
        </div>
      ) : (
        <SitterGrid sitters={sitters} />
      )}
    </div>
  )
}
