import Link from 'next/link'
import type { SitterWithProfile } from '@/types'

interface SitterCardProps {
  sitter: SitterWithProfile
}

export function SitterCard({ sitter }: SitterCardProps) {
  const { first_name, last_name, city, bio } = sitter.profile
  const initials = `${first_name[0]}${last_name[0]}`.toUpperCase()
  const fullName = `${first_name} ${last_name}`
  const shortBio = bio?.trim() || 'No bio provided yet.'

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(sitter.price_per_day)

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

      {/* Accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-blue-400" />

      <div className="flex flex-col flex-1 p-6">

        {/* Avatar + name + city + price */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center select-none"
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {fullName}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {city ?? 'Location not set'}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-blue-600 leading-none">{formattedPrice}</p>
            <p className="text-xs text-gray-400 mt-0.5">/ day</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-5">
          {shortBio}
        </p>

        {/* CTA */}
        <Link
          href={`/sitters/${sitter.profile_id}`}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`View profile of ${fullName}`}
        >
          View Profile
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
            <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
          </svg>
        </Link>

      </div>
    </article>
  )
}