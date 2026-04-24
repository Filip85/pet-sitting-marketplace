'use client'

import { useState } from 'react'
import { logout } from '../../actions/logout'
import { Button } from '../ui/Button'

export const LogoutButton = () => {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await logout()
    // Redirect is handled by the server action
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      className="bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900"
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}