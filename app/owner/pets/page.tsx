import Link from 'next/link'

import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/layout/PageContainer'
import { DeletePetButton } from '@/components/pets/DeletePetButton'
import type { Pet } from '@/types'

export const dynamic = 'force-dynamic'

const TYPE_EMOJI: Record<string, string> = { dog: '🐕', cat: '🐈', other: '🐾' }
const TYPE_LABEL: Record<string, string> = { dog: 'Dog', cat: 'Cat', other: 'Other' }

export default async function PetsPage() {
  const { user } = await requireRole('OWNER')
  const db = createAdminClient()

  const { data: pets, error } = await db
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <PageContainer className="py-10 sm:py-12">
      <div className="flex items-center justify-between gap-6 mb-8">
        <div>
          <Link href="/owner" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-3">
            <span aria-hidden>←</span> Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My pets</h1>
          <p className="text-sm text-gray-400 mt-1">
            {pets?.length ?? 0} {pets?.length === 1 ? 'pet' : 'pets'} registered
          </p>
        </div>
        <Link href="/owner/pets/new" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          + Add pet
        </Link>
      </div>

      <div className="max-w-2xl">
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
            <Link href="/owner/pets/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              + Add Pet
            </Link>
          </div>
        )}

        {pets && pets.length > 0 && (
          <ul className="space-y-3">
            {(pets as Pet[]).map((pet) => (
              <li key={pet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-4">
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
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/owner/pets/${pet.id}/edit`} className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                    Edit
                  </Link>
                  <DeletePetButton petId={pet.id} petName={pet.name} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  )
}
