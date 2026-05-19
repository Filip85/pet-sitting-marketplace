'use server'

import { redirect } from 'next/navigation'
import { createServerAuthClient, createAdminClient } from '@/lib/supabase/server'
import { loginSchema, type LoginForm } from '@/lib/validations/auth'
import { firstZodError } from '@/lib/utils'

export async function login(formData: LoginForm) {
  const parsed = loginSchema.safeParse(formData)
  if (!parsed.success) return { error: firstZodError(parsed.error) }

  const supabase = await createServerAuthClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: error.message }
  if (!data.user) return { error: 'Login failed' }

  // Fetch role to decide where to redirect
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const destination =
    profile?.role === 'SITTER' ? '/sitter' : '/owner'

  redirect(destination)
}