'use server'

import { revalidatePath } from 'next/cache'
import { createServerAuthClient } from '@/lib/supabase/server'
import { loginSchema, LoginForm } from '@/lib/validations/auth'

export async function login(formData: LoginForm) {
  const supabase = await createServerAuthClient()

  // Validate the form data
  const result = loginSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { email, password } = result.data

  // Sign in the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Login failed' }
  }

  // Get user profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Failed to get user profile' }
  }

  revalidatePath('/', 'layout')

  const destination = profile.role === 'OWNER' ? '/owner' : profile.role === 'SITTER' ? '/sitter' : '/sitters'
  return { destination }
}