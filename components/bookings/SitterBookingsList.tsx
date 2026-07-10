import { getLocale, getTranslations } from 'next-intl/server'
import type { Booking, BookingStatus, Pet, Profile } from '@/types'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'
import { BookingRequestActions } from '@/components/bookings/BookingRequestActions'

export type SitterBookingListItem = Pick<Booking, 'id' | 'start_date' | 'end_date' | 'total_price' | 'status' | 'created_at'> & {
  owner?: Pick<Profile, 'first_name' | 'last_name' | 'city' | 'email'>
  pet?: Pick<Pet, 'name' | 'type' | 'breed' | 'age'>
}

const TYPE_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  other: '🐾',
}

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  hr: 'hr-HR',
}

export async function SitterBookingsList({ bookings }: { bookings: SitterBookingListItem[] }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('Bookings')])
  const intlLocale = LOCALE_MAP[locale] ?? locale

  function formatDate(date: string) {
    const d = new Date(`${date}T00:00:00.000Z`)
    return new Intl.DateTimeFormat(intlLocale, { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-3xl mb-3">📥</p>
        <h3 className="text-gray-900 font-semibold">{t('noSitterTitle')}</h3>
        <p className="text-sm text-gray-400 mt-1">{t('noSitterDesc')}</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b) => {
        const ownerName = b.owner ? `${b.owner.first_name} ${b.owner.last_name}` : 'Owner'
        const petTitle = b.pet ? `${TYPE_EMOJI[b.pet.type] ?? '🐾'} ${b.pet.name}` : '🐾 Pet'
        const petMeta = b.pet
          ? [b.pet.breed, b.pet.age != null ? `${b.pet.age} yr${b.pet.age === 1 ? '' : 's'}` : null]
              .filter(Boolean)
              .join(' · ')
          : null

        return (
          <li key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-gray-400">
                  {petTitle}
                  <span className="text-gray-300"> · </span>
                  {ownerName}
                  {b.owner?.city ? <span className="text-gray-300"> · </span> : null}
                  {b.owner?.city ? <span>{b.owner.city}</span> : null}
                </p>

                {petMeta ? <p className="text-xs text-gray-400 mt-1">{petMeta}</p> : null}

                <p className="font-semibold text-gray-900 mt-2">
                  {formatDate(b.start_date)} — {formatDate(b.end_date)}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {t('total')}: <span className="font-semibold text-gray-900">{formatMoney(Number(b.total_price))}</span>
                  {b.owner?.email ? <span className="text-gray-400"> · {b.owner.email}</span> : null}
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <BookingStatusBadge status={b.status as BookingStatus} />
                <BookingRequestActions bookingId={b.id} status={b.status as BookingStatus} />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
