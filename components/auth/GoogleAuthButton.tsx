'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

type GoogleAuthButtonProps = {
  mode: 'login' | 'signup'
  role?: 'OWNER' | 'SITTER'
}

export function GoogleAuthButton({ mode, role = 'OWNER' }: GoogleAuthButtonProps) {
  const t = useTranslations('Auth.google')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cta = mode === 'signup' ? t('signup') : t('login')

  const onGoogleAuth = async () => {
    setError(null)
    setIsLoading(true)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/api/auth/callback?role=${role}`

    const { data, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    if (data.url) {
      window.location.assign(data.url)
      return
    }

    setError('Unable to start Google authentication. Please try again.')
    setIsLoading(false)
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={onGoogleAuth}
        disabled={isLoading}
        className="w-full rounded-2xl bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
        aria-label={cta}
      >
        <span className="inline-flex items-center justify-center w-full">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.8 12.23c0-.76-.07-1.49-.2-2.19H12v4.14h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.59z" fill="#4285F4" />
            <path d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.3-2.56c-.92.62-2.09.99-3.31.99-2.54 0-4.69-1.72-5.45-4.02H3.14v2.64A10 10 0 0 0 12 22z" fill="#34A853" />
            <path d="M6.55 13.97a6 6 0 0 1 0-3.94V7.39H3.14a10 10 0 0 0 0 9.22l3.41-2.64z" fill="#FBBC05" />
            <path d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.96 3.02 14.7 2 12 2A10 10 0 0 0 3.14 7.39l3.41 2.64C7.31 7.73 9.46 6.01 12 6.01z" fill="#EA4335" />
          </svg>
        </span>
      </Button>
      <p className="text-sm text-gray-600 text-center">{isLoading ? t('redirecting') : cta}</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}