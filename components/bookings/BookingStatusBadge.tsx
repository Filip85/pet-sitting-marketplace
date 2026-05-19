import type { BookingStatus } from '@/types'

const STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  REJECTED: 'bg-red-50 text-red-700 border-red-100',
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STYLES[status]}`}
    >
      {status}
    </span>
  )
}
