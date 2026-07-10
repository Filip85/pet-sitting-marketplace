'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/utils'

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  const { user } = await requireRole('OWNER')
  const db = createAdminClient()

  const { data: booking } = await db
    .from('bookings')
    .select('id, owner_id, status')
    .eq('id', bookingId)
    .single()

  if (!booking) return { success: false, error: 'Booking not found.' }
  if (booking.owner_id !== user.id) return { success: false, error: 'Access denied.' }
  if (booking.status !== 'PENDING') return { success: false, error: 'Only pending bookings can be cancelled.' }

  const { error } = await db.from('bookings').delete().eq('id', bookingId).eq('owner_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/owner')
  return { success: true }
}
