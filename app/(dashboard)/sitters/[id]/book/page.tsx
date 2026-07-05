import { notFound } from 'next/navigation'
import Link from 'next/link'

import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { createBooking } from '@/actions/bookings'
import { PageContainer } from '@/components/layout/PageContainer'
import { BookingForm } from '@/components/bookings/BookingForm'
import type { Pet } from '@/types'

export const dynamic = 'force-dynamic'

type SitterForBooking = {
  profile_id: string
  price_per_day: number
  profile: { first_name: string; last_name: string; image_url: string | null }
}

export default async function BookSitterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: sitterId } = await params
  const { user } = await requireRole('OWNER')
  const db = createAdminClient()

  // Fetch sitter + owner's pets in parallel
  const [{ data: sitterRow }, { data: pets }] = await Promise.all([
    db
      .from('sitter_profiles')
      .select('profile_id, price_per_day, profile:profiles ( first_name, last_name, image_url )')
      .eq('profile_id', sitterId)
      .single(),
    db
      .from('pets')
      .select('id, name, type')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  if (!sitterRow) notFound()

  const raw = sitterRow as SitterForBooking & {
    profile: SitterForBooking['profile'] | SitterForBooking['profile'][]
  }

  const sitter: SitterForBooking = {
    ...raw,
    price_per_day: Number(raw.price_per_day),
    profile: Array.isArray(raw.profile) ? raw.profile[0] : raw.profile,
  }

  const sitterName = `${sitter.profile.first_name} ${sitter.profile.last_name}`
  const initials = `${sitter.profile.first_name[0]}${sitter.profile.last_name[0]}`.toUpperCase()
  const action = createBooking.bind(null, sitterId)

  return (
    <PageContainer className="py-10 sm:py-12">
      <Link
        href={`/sitters/${sitterId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <span aria-hidden>←</span>
        Back to sitter
      </Link>

      <div className="max-w-xl">
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-blue-400" />

          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-4">
              {sitter.profile.image_url ? (
                <img src={sitter.profile.image_url} alt={`${sitterName} avatar`} className="h-12 w-12 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Request booking</h1>
                <p className="text-sm text-gray-400 mt-1">Send a request for {sitterName}. Status defaults to PENDING.</p>
              </div>
            </div>

            <div className="border-t border-gray-100 my-6" />

            <BookingForm
              sitterId={sitterId}
              sitterName={sitterName}
              pricePerDay={sitter.price_per_day}
              pets={(pets as Pick<Pet, 'id' | 'name' | 'type'>[]) ?? []}
              action={action}
            />

            {(pets?.length ?? 0) === 0 && (
              <div className="mt-6 text-sm">
                <Link
                  href="/owner/pets/new"
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                >
                  Add a pet
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
