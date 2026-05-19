'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/utils'
import type { BookingStatus } from '@/types'

async function updateBookingStatus(
  bookingId: string,
  newStatus: Exclude<BookingStatus, 'PENDING'>
): Promise<ActionResult> {
  const { user } = await requireRole('SITTER')
  const db = createAdminClient()

  // Verify booking belongs to this sitter and is still pending
  const { data: booking } = await db
    .from('bookings')
    .select('id, sitter_id, status')
    .eq('id', bookingId)
    .single()

  if (!booking) return { success: false, error: 'Booking not found.' }
  if (booking.sitter_id !== user.id) return { success: false, error: 'Access denied.' }
  if (booking.status !== 'PENDING') return { success: false, error: 'This booking is no longer pending.' }

  const { error } = await db
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .eq('sitter_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/sitter')
  return { success: true }
}

export async function acceptBookingRequest(bookingId: string) {
  return updateBookingStatus(bookingId, 'ACCEPTED')
}

export async function rejectBookingRequest(bookingId: string) {
  return updateBookingStatus(bookingId, 'REJECTED')
}
