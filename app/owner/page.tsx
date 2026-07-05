import Link from 'next/link'

import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PetList } from '@/components/pets/PetList'
import { OwnerBookingsList, type OwnerBookingListItem } from '@/components/bookings/OwnerBookingsList'
import type { Pet, Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function OwnerPage() {
  const { user } = await requireRole('OWNER')
  const db = createAdminClient()

  // Fetch pets + bookings in parallel
  const [{ data: pets }, { data: bookings }] = await Promise.all([
    db.from('pets').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    db.from('bookings').select('id, sitter_id, pet_id, start_date, end_date, total_price, status, created_at').eq('owner_id', user.id).order('created_at', { ascending: false }),
  ])

  const petList = (pets as Pet[]) ?? []
  const bookingRows = bookings ?? []

  // Fetch related sitter profiles
  const sitterIds = [...new Set(bookingRows.map((b) => b.sitter_id))]
  const { data: sitters } = sitterIds.length
    ? await db.from('profiles').select('id, first_name, last_name, city').in('id', sitterIds)
    : { data: [] as Pick<Profile, 'id' | 'first_name' | 'last_name' | 'city'>[] }

  const petsById = new Map(petList.map((p) => [p.id, p]))
  const sittersById = new Map(((sitters ?? []) as Pick<Profile, 'id' | 'first_name' | 'last_name' | 'city'>[]).map((s) => [s.id, s]))

  const bookingItems: OwnerBookingListItem[] = bookingRows.map((b) => {
    const pet = petsById.get(b.pet_id)
    const sitter = sittersById.get(b.sitter_id)
    return {
      id: b.id,
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: Number(b.total_price),
      status: b.status,
      created_at: b.created_at,
      pet: pet ? { name: pet.name, type: pet.type } : undefined,
      sitter: sitter ? { first_name: sitter.first_name, last_name: sitter.last_name, city: sitter.city } : undefined,
    }
  })

  return (
    <PageContainer className="py-10 sm:py-12">
      <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-indigo-50 to-white border border-indigo-100 p-8 sm:p-10 mb-10 shadow-sm">
        <PageHeader title="Owner Dashboard" subtitle="Pets and bookings in one place." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My pets</h2>
              <p className="text-sm text-gray-400">{petList.length} total</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/owner/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Edit profile
              </Link>
              <Link href="/owner/pets" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                View all
              </Link>
            </div>
          </div>
          <PetList pets={petList} showCta={false} />
        </section>

        <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My bookings</h2>
              <p className="text-sm text-gray-400">{bookingItems.length} total</p>
            </div>
    </div>
          <OwnerBookingsList bookings={bookingItems} showCta={false} />
        </section>
      </div>
    </PageContainer>
  )
}