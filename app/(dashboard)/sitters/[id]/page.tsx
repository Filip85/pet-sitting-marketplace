import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '../../../../lib/supabase/server'

export const dynamic = 'force-dynamic'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SitterDetail {
  id: string
  profile_id: string
  price_per_day: number
  years_of_experience: number | null
  services_offered: string | null
  can_host_at_home: boolean
  profile: {
    first_name: string
    last_name: string
    city: string | null
    bio: string | null
  }
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchSitter(id: string): Promise<SitterDetail | null> {
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
        profile:profiles (
          first_name,
          last_name,
          city,
          bio
        )
      `)
      .eq('profile_id', id)
      .single()

    if (error || !data) return null

    const raw = data as SitterDetail & {
      profile: SitterDetail['profile'] | SitterDetail['profile'][]
    }

    return {
      ...raw,
      profile: Array.isArray(raw.profile) ? raw.profile[0] : raw.profile,
    }
  } catch {
    return null
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const sitter = await fetchSitter(id)
  if (!sitter) return { title: 'Sitter not found | PetCare' }
  const { first_name, last_name } = sitter.profile
  return {
    title: `${first_name} ${last_name} | PetCare`,
    description: sitter.profile.bio ?? `Book ${first_name} for pet sitting.`,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SitterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sitter = await fetchSitter(id)

  if (!sitter) notFound()

  const { first_name, last_name, city, bio } = sitter.profile
  const fullName = `${first_name} ${last_name}`
  const initials = `${first_name[0]}${last_name[0]}`.toUpperCase()

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(sitter.price_per_day)

  const services = sitter.services_offered
    ? sitter.services_offered.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Back link */}
      <Link
        href="/sitters"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
        </svg>
        Back to sitters
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-blue-400" />

        <div className="p-8">

          {/* Header row */}
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="shrink-0 w-20 h-20 rounded-full bg-blue-100 text-blue-600 font-bold text-2xl flex items-center justify-center select-none">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>

              {city && (
                <p className="flex items-center gap-1.5 text-gray-400 text-sm mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                    <path fillRule="evenodd" d="M8 1a4 4 0 0 0-4 4c0 2.25 1.7 4.367 3.056 5.682A16.3 16.3 0 0 0 8 11.8a16.3 16.3 0 0 0 .944-.118C10.3 10.367 12 8.25 12 5a4 4 0 0 0-4-4Zm0 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
                  </svg>
                  {city}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {sitter.years_of_experience != null && sitter.years_of_experience > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                    {sitter.years_of_experience} {sitter.years_of_experience === 1 ? 'yr' : 'yrs'} experience
                  </span>
                )}
                {sitter.can_host_at_home && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1.5a.5.5 0 0 0 .5-.5v-3h2v3a.5.5 0 0 0 .5.5H11a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
                    </svg>
                    Hosts at home
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="shrink-0 text-right">
              <p className="text-3xl font-bold text-blue-600 leading-none">{formattedPrice}</p>
              <p className="text-sm text-gray-400 mt-1">per day</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {/* Bio */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">
              {bio?.trim() || 'This sitter hasn\'t added a bio yet.'}
            </p>
          </div>

          {/* Services */}
          {services.length > 0 && (
            <>
              <div className="border-t border-gray-100 mb-6" />
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Services</h2>
                <ul className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <li
                      key={service}
                      className="text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {/* Book CTA */}
          <button
            disabled
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl opacity-60 cursor-not-allowed text-sm"
            title="Booking coming soon"
          >
            Book {first_name} — {formattedPrice} / day
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">Booking functionality coming soon</p>

        </div>
      </div>
    </div>
  )
}
