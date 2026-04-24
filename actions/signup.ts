'use server'

import { revalidatePath } from 'next/cache'
import { createServerAuthClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { registerSchema, RegisterForm } from '@/lib/validations/auth'

export async function signup(formData: RegisterForm) {
  const authSupabase = await createServerAuthClient()
  const adminSupabase = createServerSupabaseClient()

  // Validate the form data
  const result = registerSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { email, password, firstName, lastName, role, city, bio, pricePerDay } = result.data

  // Use admin client to create the user with email already confirmed,
  // so the auth.users row is fully committed and the profiles FK insert works.
  const { data: adminAuthData, error: adminAuthError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  console.log("result", result.data, adminAuthData)

  if (adminAuthError) {
    return { error: adminAuthError.message }
  }

  if (!adminAuthData.user) {
    return { error: 'Failed to create user' }
  }

  const userId = adminAuthData.user.id

  // Sign the user in immediately after creation
  const { error: signInError } = await authSupabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: signInError.message }
  }

  // Insert into profiles table
  const { error: profileError } = await adminSupabase.from('profiles').insert({
    id: userId,
    role,
    first_name: firstName,
    last_name: lastName,
    email,
    city: city || null,
    bio: bio || null,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  // If role is SITTER, insert into sitter_profiles
  if (role === 'SITTER') {
    const { error: sitterError } = await adminSupabase.from('sitter_profiles').insert({
      profile_id: userId,
      price_per_day: pricePerDay!,
    })

    if (sitterError) {
      return { error: sitterError.message }
    }
  }

  revalidatePath('/', 'layout')
  return { destination: role === 'OWNER' ? '/owner' : '/sitter' }
}