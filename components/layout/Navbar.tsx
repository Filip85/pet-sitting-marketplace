import Link from 'next/link'

export const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          PetCare
        </Link>

        {/* Navigation links — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-8">
          <Link
            href="/sitters"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Browse Sitters
          </Link>

          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition-colors"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile — compact auth links */}
        <div className="flex sm:hidden items-center gap-4">
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
        </div>
      </nav>
    </header>
  )
}
