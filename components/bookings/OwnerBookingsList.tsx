import Link from 'next/link'
import type { Booking, BookingStatus, Pet, Profile } from '@/types'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'

export type OwnerBookingListItem = Pick<Booking, 'id' | 'start_date' | 'end_date' | 'total_price' | 'status' | 'created_at'> & {
  sitter?: Pick<Profile, 'first_name' | 'last_name' | 'city'>
  pet?: Pick<Pet, 'name' | 'type'>
}

const TYPE_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  other: '🐾',
}

function formatDate(date: string) {
  // date is stored as YYYY-MM-DD
  const d = new Date(`${date}T00:00:00.000Z`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function OwnerBookingsList({
  bookings,
  showCta = true,
}: {
  bookings: OwnerBookingListItem[]
  showCta?: boolean
}) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-3xl mb-3">📅</p>
        <h3 className="text-gray-900 font-semibold">No bookings yet</h3>
        <p className="text-sm text-gray-400 mt-1">Browse sitters and send your first request.</p>
        {showCta ? (
          <Link
            href="/sitters"
            className="inline-flex items-center justify-center mt-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Browse sitters
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b) => {
        const sitterName = b.sitter ? `${b.sitter.first_name} ${b.sitter.last_name}` : 'Sitter'
        const petLabel = b.pet ? `${TYPE_EMOJI[b.pet.type] ?? '🐾'} ${b.pet.name}` : 'Pet'

        return (
          <li
            key={b.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-gray-400">{petLabel} · {sitterName}</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {formatDate(b.start_date)} — {formatDate(b.end_date)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Total: <span className="font-semibold text-gray-900">{formatMoney(Number(b.total_price))}</span>
                  {b.sitter?.city ? <span className="text-gray-400"> · {b.sitter.city}</span> : null}
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <BookingStatusBadge status={b.status as BookingStatus} />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
