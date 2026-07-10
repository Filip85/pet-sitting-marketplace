'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { BookingStatus } from '@/types'
import { acceptBookingRequest, rejectBookingRequest } from '@/actions/sitter-bookings'

export function BookingRequestActions({
  bookingId,
  status,
}: {
  bookingId: string
  status: BookingStatus
}) {
  const t = useTranslations('Bookings')
  const router = useRouter()
  const [loading, setLoading] = useState<'ACCEPT' | 'REJECT' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canAct = status === 'PENDING'

  const handleAccept = async () => {
    setError(null)
    setLoading('ACCEPT')
    const result = await acceptBookingRequest(bookingId)
    if (!result.success) setError(result.error)
    setLoading(null)
    router.refresh()
  }

  const handleReject = async () => {
    setError(null)
    setLoading('REJECT')
    const result = await rejectBookingRequest(bookingId)
    if (!result.success) setError(result.error)
    setLoading(null)
    router.refresh()
  }

  if (!canAct) return null

  return (
    <div className="flex flex-col items-end gap-2">
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleReject}
          disabled={loading != null}
          className="text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
        >
          {loading === 'REJECT' ? t('rejecting') : t('reject')}
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={loading != null}
          className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
        >
          {loading === 'ACCEPT' ? t('accepting') : t('accept')}
        </button>
      </div>
    </div>
  )
}
