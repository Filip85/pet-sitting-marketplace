import { getTranslations } from 'next-intl/server'
import type { BookingStatus } from '@/types'

const STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  REJECTED: 'bg-red-50 text-red-700 border-red-100',
}

const STATUS_KEY: Record<BookingStatus, 'statusPending' | 'statusAccepted' | 'statusRejected'> = {
  PENDING: 'statusPending',
  ACCEPTED: 'statusAccepted',
  REJECTED: 'statusRejected',
}

export async function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const t = await getTranslations('Bookings')
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STYLES[status]}`}>
      {t(STATUS_KEY[status])}
    </span>
  )
}
