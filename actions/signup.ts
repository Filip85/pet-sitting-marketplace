'use server'

import { redirect } from 'next/navigation'
import { createServerAuthClient, createAdminClient } from '@/lib/supabase/server'
import { registerSchema, type RegisterForm } from '@/lib/validations/auth'
import { firstZodError } from '@/lib/utils'
import { uploadProfileImage } from '@/lib/supabase/storage'
import { requireRole } from '@/lib/supabase/protected'

export async function signup(formData: RegisterForm & { imageFile?: File | null }) {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) return { error: firstZodError(parsed.error) }

  const { email, password, firstName, lastName, role, city, bio, pricePerDay, canHostAtHome } = parsed.data
  const profileRole = role === 'HOTEL' ? 'SITTER' : role

  const admin = createAdminClient()

  // 1. Create user (admin, so email is auto-confirmed)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: 'Failed to create user' }

  const userId = authData.user.id

  // 2. Create profile
  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    role: profileRole,
    first_name: firstName,
    last_name: lastName,
    email,
    city: city || null,
    bio: bio || null,
  })

  if (!profileError && formData.imageFile) {
    const imageUrl = await uploadProfileImage(formData.imageFile, userId)
    if (imageUrl) {
      await admin.from('profiles').update({ image_url: imageUrl }).eq('id', userId)
    }
  }

  if (profileError) return { error: profileError.message }

  // 3. Create sitter profile if needed
  if (role !== 'OWNER') {
    const { error: sitterError } = await admin.from('sitter_profiles').insert({
      profile_id: userId,
      price_per_day: pricePerDay!,
      can_host_at_home: role === 'HOTEL' ? true : (canHostAtHome ?? false),
      services_offered: role === 'HOTEL' ? 'pet-hotel' : null,
    })
    if (sitterError) return { error: sitterError.message }
  }

  // 4. Sign the user in (sets cookies for subsequent requests)
  const supabase = await createServerAuthClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) return { error: signInError.message }

  redirect(role === 'OWNER' ? '/owner' : '/sitter')
}

export async function updateOwnerProfile(formData: {
  firstName: string
  lastName: string
  city?: string
  bio?: string
  imageFile?: File | null
}) {
  const { user } = await requireRole('OWNER')
  const db = createAdminClient()

  const { error } = await db
    .from('profiles')
    .update({
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      city: formData.city?.trim() || null,
      bio: formData.bio?.trim() || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  if (formData.imageFile) {
    const imageUrl = await uploadProfileImage(formData.imageFile, user.id)
    if (imageUrl) {
      await db.from('profiles').update({ image_url: imageUrl }).eq('id', user.id)
    }
  }

  return { success: true }
}