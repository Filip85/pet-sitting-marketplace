import { NextRequest, NextResponse } from 'next/server'

const LOCALES = ['en', 'hr'] as const
const DEFAULT_LOCALE = 'en'

export function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const acceptLang = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0]
  const locale = (LOCALES as readonly string[]).includes(cookieLocale!)
    ? cookieLocale!
    : (LOCALES as readonly string[]).includes(acceptLang!)
    ? acceptLang!
    : DEFAULT_LOCALE

  const headers = new Headers(request.headers)
  headers.set('X-NEXT-INTL-LOCALE', locale)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
