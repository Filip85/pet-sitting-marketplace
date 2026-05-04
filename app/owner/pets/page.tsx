import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerAuthClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { DeletePetButton } from '@/components/pets/DeletePetButton'
import type { Pet } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

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

export default async function PetsPage() {
  const authClient = await createServerAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/login')

  const supabase = createServerSupabaseClient()
  const { data: pets, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 py-10 bg-gray-50 min-h-screen">

      <Link
        href="/owner"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
        </svg>
        Back to dashboard
      </Link>

      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Pets</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {pets?.length ?? 0} {pets?.length === 1 ? 'pet' : 'pets'} registered
          </p>
        </div>
        <Link
          href="/owner/pets/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          + Add Pet
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-6">
          Failed to load pets. Please try refreshing.
        </div>
      )}

      {!error && pets?.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
          <p className="text-4xl mb-4">🐾</p>
          <h3 className="text-gray-700 font-semibold mb-1">No pets yet</h3>
          <p className="text-sm text-gray-400 mb-6">Add your first pet to get started.</p>
          <Link
            href="/owner/pets/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            + Add Pet
          </Link>
        </div>
      )}

      {pets && pets.length > 0 && (
        <ul className="space-y-3 max-w-2xl mx-auto">
          {pets.map((pet: Pet) => (
            <li
              key={pet.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-4"
            >
              <div className="shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl select-none">
                {TYPE_EMOJI[pet.type] ?? '🐾'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{pet.name}</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {TYPE_LABEL[pet.type] ?? pet.type}
                  {pet.breed ? ` · ${pet.breed}` : ''}
                  {pet.age != null ? ` · ${pet.age} yr${pet.age === 1 ? '' : 's'}` : ''}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/owner/pets/${pet.id}/edit`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <DeletePetButton petId={pet.id} petName={pet.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
