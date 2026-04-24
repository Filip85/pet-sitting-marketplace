'use client'

import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Left — logo + links */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                PetCare
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/sitters" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Browse Sitters
                </Link>
                {user && (
                  <>
                    <Link href="/owner" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                      My Pets
                    </Link>
                    <Link href="/sitter" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                      My Profile
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right — auth state */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
              ) : user ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}