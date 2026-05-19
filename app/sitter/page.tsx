import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { SitterBookingsList, type SitterBookingListItem } from '@/components/bookings/SitterBookingsList'
import type { Pet, Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function SitterPage() {
  const { user } = await requireRole('SITTER')
  const db = createAdminClient()

  const { data: bookings } = await db
    .from('bookings')
    .select('id, owner_id, pet_id, start_date, end_date, total_price, status, created_at')
    .eq('sitter_id', user.id)
    .order('created_at', { ascending: false })

  const bookingRows = bookings ?? []

  // Fetch owners + pets in parallel
  const ownerIds = [...new Set(bookingRows.map((b) => b.owner_id))]
  const petIds = [...new Set(bookingRows.map((b) => b.pet_id))]

  const [{ data: owners }, { data: pets }] = await Promise.all([
    ownerIds.length
      ? db.from('profiles').select('id, first_name, last_name, city, email').in('id', ownerIds)
      : Promise.resolve({ data: [] as Pick<Profile, 'id' | 'first_name' | 'last_name' | 'city' | 'email'>[] }),
    petIds.length
      ? db.from('pets').select('id, name, type, breed, age').in('id', petIds)
      : Promise.resolve({ data: [] as Pick<Pet, 'id' | 'name' | 'type' | 'breed' | 'age'>[] }),
  ])

  const ownersById = new Map(((owners ?? []) as Pick<Profile, 'id' | 'first_name' | 'last_name' | 'city' | 'email'>[]).map((o) => [o.id, o]))
  const petsById = new Map(((pets ?? []) as Pick<Pet, 'id' | 'name' | 'type' | 'breed' | 'age'>[]).map((p) => [p.id, p]))

  const bookingItems: SitterBookingListItem[] = bookingRows.map((b) => {
    const owner = ownersById.get(b.owner_id)
    const pet = petsById.get(b.pet_id)
    return {
      id: b.id,
      start_date: b.start_date,
      end_date: b.end_date,
      total_price: Number(b.total_price),
      status: b.status,
      created_at: b.created_at,
      owner: owner ? { first_name: owner.first_name, last_name: owner.last_name, city: owner.city, email: owner.email } : undefined,
      pet: pet ? { name: pet.name, type: pet.type, breed: pet.breed, age: pet.age } : undefined,
    }
  })

  const pendingCount = bookingItems.filter((b) => b.status === 'PENDING').length

  return (
    <PageContainer className="py-10 sm:py-12">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-100 p-8 sm:p-10 mb-10 shadow-sm">
        <PageHeader
          title="Sitter Dashboard"
          subtitle={`${pendingCount} pending ${pendingCount === 1 ? 'request' : 'requests'}`}
        />
      </div>

      <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Incoming booking requests</h2>
          <p className="text-sm text-gray-400">Accept or reject pending requests.</p>
        </div>
        <SitterBookingsList bookings={bookingItems} />
      </section>
    </PageContainer>
  )
}