'use server'

import { redirect } from 'next/navigation'
import { createServerAuthClient, createAdminClient } from '@/lib/supabase/server'
import { registerSchema, type RegisterForm } from '@/lib/validations/auth'
import { firstZodError } from '@/lib/utils'

export async function signup(formData: RegisterForm) {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) return { error: firstZodError(parsed.error) }

  const { email, password, firstName, lastName, role, city, bio, pricePerDay } = parsed.data

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
    role,
    first_name: firstName,
    last_name: lastName,
    email,
    city: city || null,
    bio: bio || null,
  })

  if (profileError) return { error: profileError.message }

  // 3. Create sitter profile if needed
  if (role === 'SITTER') {
    const { error: sitterError } = await admin.from('sitter_profiles').insert({
      profile_id: userId,
      price_per_day: pricePerDay!,
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