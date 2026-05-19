import Link from 'next/link'
import type { Pet } from '@/types'

const TYPE_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  other: '🐾',
}

const TYPE_LABEL: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
}

export function PetList({ pets, showCta = true }: { pets: Pet[]; showCta?: boolean }) {
  if (pets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-3xl mb-3">🐾</p>
        <h3 className="text-gray-900 font-semibold">No pets yet</h3>
        <p className="text-sm text-gray-400 mt-1">Add a pet to start booking sitters.</p>
        {showCta ? (
          <Link
            href="/owner/pets/new"
            className="inline-flex items-center justify-center mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Add a pet
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {pets.map((pet) => (
        <li
          key={pet.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-4"
        >
          <div className="shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl select-none">
            {TYPE_EMOJI[pet.type] ?? '🐾'}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{pet.name}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {TYPE_LABEL[pet.type] ?? pet.type}
              {pet.breed ? ` · ${pet.breed}` : ''}
              {pet.age != null ? ` · ${pet.age} yr${pet.age === 1 ? '' : 's'}` : ''}
            </p>
          </div>

          <Link
            href="/owner/pets"
            className="shrink-0 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Manage
          </Link>
        </li>
      ))}
    </ul>
  )
}
