import Link from 'next/link'

import { createServerAuthClient, createAdminClient } from '@/lib/supabase/server'
import type { Role } from '@/types'
import { LogoutButton } from '@/components/auth/LogoutButton'

type NavLink = { href: string; label: string }

function getLinks(role: Role | null): NavLink[] {
  if (role === 'OWNER') {
    return [
      { href: '/owner', label: 'Dashboard' },
      { href: '/owner/pets', label: 'My Pets' },
      { href: '/sitters', label: 'Browse Sitters' },
    ]
  }
  if (role === 'SITTER') {
    return [
      { href: '/sitter', label: 'Dashboard' },
      { href: '/sitters', label: 'Browse Sitters' },
    ]
  }
  return [{ href: '/sitters', label: 'Browse Sitters' }]
}

export async function AppNavbar() {
  const supabase = await createServerAuthClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role: Role | null = null
  let displayName: string | null = null
  let initials: string | null = null

  if (user) {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (profile) {
      role = profile.role as Role
      displayName = `${profile.first_name} ${profile.last_name}`
      initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
  }

  const links = getLinks(role)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-200">
                🐾
              </span>
              <span className="text-gray-900">
                Pet<span className="text-blue-600">Care</span>
              </span>
            </Link>

            <div className="flex flex-wrap gap-2 sm:ml-2 w-full sm:w-auto">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="shrink-0 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-2xl transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {user ? (
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-2xl max-w-[70vw] sm:max-w-none">
                {initials && (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold">
                    {initials}
                  </span>
                )}
                <div className="leading-tight min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName ?? 'Account'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-white border border-gray-200 px-4 py-2.5 rounded-2xl transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2.5 rounded-2xl transition-colors shadow-sm shadow-blue-200"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
