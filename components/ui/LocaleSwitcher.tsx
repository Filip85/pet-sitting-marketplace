'use client'

import { Fragment } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchLocale = (next: string) => {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex items-center gap-1">
      {(['en', 'hr'] as const).map((l, i) => (
        <Fragment key={l}>
          {i > 0 && <span className="text-gray-300 text-xs select-none">|</span>}
          <button
            onClick={() => switchLocale(l)}
            disabled={locale === l || isPending}
            className={`px-1 text-xs font-semibold transition-colors disabled:cursor-default ${
              locale === l ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {l === 'en' ? 'EN' : 'HR'}
          </button>
        </Fragment>
      ))}
    </div>
  )
}
