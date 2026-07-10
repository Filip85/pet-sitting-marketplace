import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createServerAuthClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

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
          const metadata = user.user_metadata ?? {}
          const givenName = (metadata.given_name as string | undefined)?.trim()
          const familyName = (metadata.family_name as string | undefined)?.trim()
          const fallbackName = user.email?.split('@')[0]?.trim() || 'Pet'

          const { error: profileInsertError } = await admin.from('profiles').insert({
            id: user.id,
            role: 'OWNER',
            first_name: givenName || fallbackName,
            last_name: familyName || 'User',
            email: user.email,
          })

          if (profileInsertError) {
            return NextResponse.redirect(`${origin}/login`)
          }
        }

        const destination =
          next && next.startsWith('/')
            ? next
            : profile?.role === 'SITTER'
              ? '/sitter'
              : '/owner'

        return NextResponse.redirect(`${origin}${destination}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}