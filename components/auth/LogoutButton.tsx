'use client'

import { useTransition } from 'react'
import { logout } from '@/actions/logout'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? 'Signing out...' : 'Log out'}
    </button>
  )
}