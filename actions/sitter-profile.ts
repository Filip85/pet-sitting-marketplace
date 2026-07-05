'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { sitterProfileSchema, type SitterProfileForm } from '@/lib/validations/sitter-profile'
import { serializeServices } from '@/lib/constants/services'
import { firstZodError, type ActionResult } from '@/lib/utils'
import { uploadProfileImage } from '@/lib/supabase/storage'

export async function updateSitterProfile(formData: SitterProfileForm & { imageFile?: File | null }): Promise<ActionResult> {
  const { user } = await requireRole('SITTER')
  const parsed = sitterProfileSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) }

  const { pricePerDay, yearsOfExperience, services, bio, city } = parsed.data
  const db = createAdminClient()

  // Update sitter_profiles
  const { error: sitterError } = await db
    .from('sitter_profiles')
    .update({
      price_per_day: pricePerDay,
      years_of_experience: yearsOfExperience ?? null,
      services_offered: serializeServices(services),
    })
    .eq('profile_id', user.id)

  if (sitterError) return { success: false, error: sitterError.message }

  // Update profile (bio, city)
  const { error: profileError } = await db
    .from('profiles')
    .update({
      bio: bio || null,
      city: city || null,
    })
    .eq('id', user.id)

  if (!profileError && formData.imageFile) {
    const imageUrl = await uploadProfileImage(formData.imageFile, user.id)
    if (imageUrl) {
      await db.from('profiles').update({ image_url: imageUrl }).eq('id', user.id)
    }
  }

  if (profileError) return { success: false, error: profileError.message }

  revalidatePath('/sitter')
  revalidatePath('/sitter/profile')
  revalidatePath('/sitters')

  return { success: true }
}
