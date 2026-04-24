import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="text-lg font-bold text-blue-600">
            PetCare
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/sitters" className="hover:text-gray-900 transition-colors">
              Browse Sitters
            </Link>
            <Link href="/register" className="hover:text-gray-900 transition-colors">
              Become a Sitter
            </Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} PetCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
