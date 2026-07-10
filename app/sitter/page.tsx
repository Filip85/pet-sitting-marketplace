import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { parseServices, SITTER_SERVICES } from '@/lib/constants/services'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { SitterBookingsList, type SitterBookingListItem } from '@/components/bookings/SitterBookingsList'
import type { Pet, Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function SitterPage() {
  const [{ user }, t, tSvc] = await Promise.all([requireRole('SITTER'), getTranslations('Sitter.dashboard'), getTranslations('ServiceLabels')])
  const db = createAdminClient()

  // Fetch sitter profile + bookings in parallel
  const [{ data: sitterProfile }, { data: bookings }] = await Promise.all([
    db.from('sitter_profiles').select('services_offered, price_per_day').eq('profile_id', user.id).single(),
    db
    .from('bookings')
    .select('id, owner_id, pet_id, start_date, end_date, total_price, status, created_at')
    .eq('sitter_id', user.id)
    .order('created_at', { ascending: false }),
  ])

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
          title={t('title')}
          subtitle={t('pending', { count: pendingCount })}
          right={
            <Link
              href="/sitter/profile"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 transition-colors"
            >
              {t('editProfile')}
            </Link>
          }
        />
      </div>

      {/* Services quick glance */}
      <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('myServices')}</h2>
            <p className="text-sm text-gray-400">{t('servicesSubtitle')}</p>
          </div>
          <Link href="/sitter/profile" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            {t('editServices')}
          </Link>
        </div>
        {(() => {
          const ids = parseServices(sitterProfile?.services_offered)
          const serviceMap = new Map<string, { label: string; icon: string }>(SITTER_SERVICES.map((s) => [s.id, s]))
          if (ids.length === 0) {
            return (
              <p className="text-sm text-gray-400">
                {t('noServices')}{' '}
                <Link href="/sitter/profile" className="text-blue-600 hover:underline">{t('addServices')}</Link>
              </p>
            )
          }
          return (
            <div className="flex flex-wrap gap-2">
              {ids.map((id) => {
                const s = serviceMap.get(id)
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg"
                  >
                    {s?.icon ?? '•'} {tSvc(id as Parameters<typeof tSvc>[0])}
                  </span>
                )
              })}
            </div>
          )
        })()}
      </section>

      <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{t('incomingRequests')}</h2>
          <p className="text-sm text-gray-400">{t('incomingSubtitle')}</p>
        </div>
        <SitterBookingsList bookings={bookingItems} />
      </section>
    </PageContainer>
  )
}