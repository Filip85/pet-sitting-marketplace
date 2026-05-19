'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { bookingSchema, type BookingForm as BookingFormType } from '@/lib/validations/bookings'
import { calculateTotalPrice, calculateBookingDays } from '@/lib/bookings/pricing'
import type { ActionResult } from '@/lib/utils'
import type { Pet } from '@/types'

type BookingFormProps = {
  sitterId: string
  sitterName: string
  pricePerDay: number
  pets: Pick<Pet, 'id' | 'name' | 'type'>[]
  action: (data: BookingFormType) => Promise<ActionResult<{ bookingId: string }>>
}

export function BookingForm({ sitterId, sitterName, pricePerDay, pets, action }: BookingFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormType>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      petId: pets[0]?.id ?? '',
      startDate: '',
      endDate: '',
    },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const { days, totalPrice } = useMemo(() => {
    const days = calculateBookingDays(startDate, endDate)
    const totalPrice = calculateTotalPrice({ pricePerDay, startDate, endDate })
    return { days, totalPrice }
  }, [pricePerDay, startDate, endDate])

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(totalPrice)
  }, [totalPrice])

  const onSubmit = async (data: BookingFormType) => {
    setServerError(null)

    const result = await action(data)
    if (!result.success) {
      setServerError(result.error)
      return
    }

    router.replace('/owner')
    router.refresh()
  }

  const canSubmit = pets.length > 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-sm text-blue-900">
          Requesting booking with <span className="font-semibold">{sitterName}</span> at{' '}
          <span className="font-semibold">${pricePerDay}</span>/day.
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Total is calculated automatically from dates.
        </p>
      </div>

      {/* Pet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Pet <span className="text-red-500">*</span>
        </label>
        <select
          {...register('petId')}
          disabled={pets.length === 0}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          {pets.length === 0 ? (
            <option value="">No pets found</option>
          ) : (
            pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.type})
              </option>
            ))
          )}
        </select>
        {errors.petId && <p className="mt-1.5 text-xs text-red-600">{errors.petId.message}</p>}
        {pets.length === 0 && (
          <p className="mt-1.5 text-xs text-gray-500">
            You need to create a pet before you can request a booking.
          </p>
        )}
      </div>

      {/* Start date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Start date <span className="text-red-500">*</span>
        </label>
        <input
          {...register('startDate')}
          type="date"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {errors.startDate && (
          <p className="mt-1.5 text-xs text-red-600">{errors.startDate.message}</p>
        )}
      </div>

      {/* End date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          End date <span className="text-red-500">*</span>
        </label>
        <input
          {...register('endDate')}
          type="date"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {errors.endDate && (
          <p className="mt-1.5 text-xs text-red-600">{errors.endDate.message}</p>
        )}
      </div>

      {/* Total */}
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-lg font-semibold text-gray-900">{formattedPrice}</p>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}` : 'Select dates to calculate total'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push(`/sitters/${sitterId}`)}
          className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          {isSubmitting ? 'Requesting...' : 'Request booking'}
        </button>
      </div>
    </form>
  )
}
