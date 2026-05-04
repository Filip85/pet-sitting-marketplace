import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerAuthClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { PetForm } from '@/components/pets/PetForm'
import { updatePet } from '@/actions/pets'
import type { PetForm as PetFormType } from '@/lib/validations/pets'

export const dynamic = 'force-dynamic'

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const authClient = await createServerAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/login')

  const supabase = createServerSupabaseClient()
  const { data: pet, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error || !pet) notFound()

  async function handleUpdate(data: PetFormType) {
    'use server'
    return updatePet(id, data)
  }

  return (
    <div className="min-h-screenmax-w-lg mx-auto px-4 py-10 bg-gray-50">

      {/* Back */}
      <Link
        href="/owner/pets"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
        </svg>
        Back to my pets
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Edit {pet.name}</h1>
          <p className="text-sm text-gray-400 mt-1">Update your pet's details below.</p>
        </div>
        <PetForm
          action={handleUpdate}
          submitLabel="Save Changes"
          defaultValues={{
            name: pet.name,
            type: pet.type,
            breed: pet.breed ?? undefined,
            age: pet.age ?? undefined,
          }}
        />
      </div>

    </div>
  )
}
