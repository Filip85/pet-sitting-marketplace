import Link from 'next/link'

import { requireRole } from '@/lib/supabase/protected'
import { PageContainer } from '@/components/layout/PageContainer'
import { PetForm } from '@/components/pets/PetForm'
import { createPet } from '@/actions/pets'

export const dynamic = 'force-dynamic'

export default async function NewPetPage() {
  await requireRole('OWNER')

  return (
    <PageContainer className="py-10 sm:py-12">
      <Link
        href="/owner/pets"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <span aria-hidden>←</span>
        Back to my pets
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10 max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add a pet</h1>
          <p className="text-sm text-gray-400 mt-1">Fill in your pet&apos;s details below.</p>
        </div>
        <PetForm action={createPet} submitLabel="Add Pet" />
      </div>
    </PageContainer>
  )
}
