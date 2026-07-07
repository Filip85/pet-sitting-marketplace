import { SitterCard } from './SitterCard'
import type { SitterWithProfile } from '@/types'

interface SitterGridProps {
  sitters: SitterWithProfile[]
  cardBadgeLabel?: string
  emptyTitle?: string
  emptyMessage?: string
}

export function SitterGrid({
  sitters,
  cardBadgeLabel,
  emptyTitle = 'No sitters available yet',
  emptyMessage = "We're growing every day. Check back soon — new sitters are joining all the time!",
}: SitterGridProps) {
  if (sitters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-5" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-blue-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
            />
          </svg>
        </div>
        <h3 className="text-gray-700 text-lg font-semibold mb-1">{emptyTitle}</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <ul
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
      aria-label="Available sitters"
    >
      {sitters.map((sitter) => (
        <li key={sitter.id}>
          <SitterCard sitter={sitter} badgeLabel={cardBadgeLabel} />
        </li>
      ))}
    </ul>
  )
}