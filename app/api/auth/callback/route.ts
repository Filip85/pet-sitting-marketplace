import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerAuthClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const roleParam = searchParams.get('role')
  const chosenRole: 'OWNER' | 'SITTER' = roleParam === 'SITTER' ? 'SITTER' : 'OWNER'

  if (code) {
    const supabase = await createServerAuthClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const admin = createAdminClient()
        const { data: profile } = await admin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile) {
          // New user — create profile with chosen role
          const metadata = user.user_metadata ?? {}
          const givenName = (metadata.given_name as string | undefined)?.trim()
          const familyName = (metadata.family_name as string | undefined)?.trim()
          const fallbackName = user.email?.split('@')[0]?.trim() || 'Pet'

          const { error: profileInsertError } = await admin.from('profiles').insert({
            id: user.id,
            role: chosenRole,
            first_name: givenName || fallbackName,
            last_name: familyName || 'User',
            email: user.email,
          })

          if (profileInsertError) {
            return NextResponse.redirect(`${origin}/login`)
          }

          if (chosenRole === 'SITTER') {
            await admin.from('sitter_profiles').insert({ profile_id: user.id, price_per_day: 0 })
          }
        } else if (roleParam && profile.role !== chosenRole) {
          // Existing user switching role
          await admin.from('profiles').update({ role: chosenRole }).eq('id', user.id)

          if (chosenRole === 'SITTER') {
            const { data: sp } = await admin
              .from('sitter_profiles')
              .select('id')
              .eq('profile_id', user.id)
              .maybeSingle()
            if (!sp) {
              await admin.from('sitter_profiles').insert({ profile_id: user.id, price_per_day: 0 })
            }
          }
        }

        const effectiveRole = roleParam ? chosenRole : (profile?.role ?? 'OWNER')
        const destination =
          next && next.startsWith('/')
            ? next
            : effectiveRole === 'SITTER'
              ? '/sitter'
              : '/owner'

        return NextResponse.redirect(`${origin}${destination}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}