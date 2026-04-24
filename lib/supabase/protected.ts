import { redirect } from 'next/navigation'
import { createServerAuthClient } from './server'
import { Role } from './types'

export async function requireAuth() {
  const supabase = await createServerAuthClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function requireRole(requiredRole: Role) {
  const supabase = await createServerAuthClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    redirect('/login')
  }

  if (profile.role !== requiredRole) {
    const destination = profile.role === 'OWNER' ? '/owner' : '/sitter'
    redirect(destination)
  }

  return { user, profile }
}