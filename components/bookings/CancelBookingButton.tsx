'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cancelBooking } from '@/actions/owner-bookings'

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const t = useTranslations('Bookings')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    if (!window.confirm(t('cancelConfirm'))) return
    setError(null)
    setLoading(true)
    const result = await cancelBooking(bookingId)
    if (!result.success) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
      >
        {loading ? t('cancelling') : t('cancel')}
      </button>
    </div>
  )
}
