import { redirect } from 'next/navigation'
import { createServerAuthClient, createAdminClient } from './server'
import type { Role } from './types'

/**
 * Ensures the user is authenticated. Redirects to /login if not.
 */
export async function requireAuth() {
  const supabase = await createServerAuthClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

/**
 * Ensures the user is authenticated AND has the required role.
 * Redirects to the correct dashboard if role doesn't match.
 */
export async function requireRole(requiredRole: Role) {
  const user = await requireAuth()
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (profile.role !== requiredRole) {
    redirect(profile.role === 'OWNER' ? '/owner' : '/sitter')
  }

  return { user, role: profile.role as Role }
}