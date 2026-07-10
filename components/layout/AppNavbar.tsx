import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { createServerAuthClient, createAdminClient } from '@/lib/supabase/server'
import type { Role } from '@/types'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'

type NavLink = { href: string; label: string }

export async function AppNavbar() {
  const t = await getTranslations('Nav')
  const supabase = await createServerAuthClient()
  const { data: { user } } = await supabase.auth.getUser()

  function getLinks(role: Role | null): NavLink[] {
    if (role === 'OWNER') {
      return [
        { href: '/owner', label: t('dashboard') },
        { href: '/owner/pets', label: t('myPets') },
        { href: '/owner/profile', label: t('myProfile') },
        { href: '/hotels', label: t('petHotels') },
        { href: '/sitters', label: t('browseSitters') },
      ]
    }
    if (role === 'SITTER') {
      return [
        { href: '/sitter', label: t('dashboard') },
        { href: '/sitter/profile', label: t('myProfile') },
        { href: '/hotels', label: t('petHotels') },
        { href: '/sitters', label: t('browseSitters') },
      ]
    }
    return [
      { href: '/hotels', label: t('petHotels') },
      { href: '/sitters', label: t('browseSitters') },
    ]
  }

  let role: Role | null = null
  let displayName: string | null = null
  let initials: string | null = null
  let avatarUrl: string | null = null

  if (user) {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('role, first_name, last_name, image_url')
      .eq('id', user.id)
      .single()

    if (profile) {
      role = profile.role as Role
      displayName = `${profile.first_name} ${profile.last_name}`
      initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      avatarUrl = profile.image_url ?? null
    }
  }

  const links = getLinks(role)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-lg font-extrabold tracking-tight shrink-0"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-200">
                🐾
              </span>
              <span className="text-gray-900">
                Pet<span className="text-blue-600">Care</span>
              </span>
            </Link>

            <div className="flex flex-wrap gap-1 ml-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="shrink-0 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-xl transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={role === 'SITTER' ? '/sitter/profile' : '/owner/profile'}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 px-2 py-1.5 rounded-xl transition-colors"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName ?? 'User avatar'} className="w-6 h-6 rounded-lg object-cover" />
                ) : initials ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs font-bold">
                    {initials}
                  </span>
                ) : null}
                <p className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">{displayName ?? 'Account'}</p>
              </Link>
              <LogoutButton />
              <LocaleSwitcher />
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-white border border-gray-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3 py-1.5 rounded-xl transition-colors shadow-sm shadow-blue-200"
              >
                {t('signup')}
              </Link>
              <LocaleSwitcher />
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
