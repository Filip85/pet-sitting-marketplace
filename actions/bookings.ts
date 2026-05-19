'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { bookingSchema, type BookingForm } from '@/lib/validations/bookings'
import { calculateTotalPrice } from '@/lib/bookings/pricing'
import { firstZodError, type ActionResult } from '@/lib/utils'

export async function createBooking(
  sitterId: string,
  formData: BookingForm
): Promise<ActionResult<{ bookingId: string }>> {
  const { user } = await requireRole('OWNER')

  const parsed = bookingSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) }

  const { petId, startDate, endDate } = parsed.data
  const db = createAdminClient()

  // Verify pet belongs to owner
  const { data: pet } = await db
    .from('pets')
    .select('id, owner_id')
    .eq('id', petId)
    .single()

  if (!pet || pet.owner_id !== user.id) {
    return { success: false, error: 'Pet not found or access denied.' }
  }

  // Get authoritative sitter price
  const { data: sitter } = await db
    .from('sitter_profiles')
    .select('profile_id, price_per_day')
    .eq('profile_id', sitterId)
    .single()

  if (!sitter) return { success: false, error: 'Sitter not found.' }

  const totalPrice = calculateTotalPrice({
    pricePerDay: sitter.price_per_day,
    startDate,
    endDate,
  })

  if (totalPrice <= 0) {
    return { success: false, error: 'Please select a valid date range.' }
  }

  const { data: inserted, error } = await db
    .from('bookings')
    .insert({
      owner_id: user.id,
      sitter_id: sitter.profile_id,
      pet_id: petId,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      status: 'PENDING',
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/owner')
  revalidatePath('/sitter')

  return { success: true, data: { bookingId: inserted.id } }
}
