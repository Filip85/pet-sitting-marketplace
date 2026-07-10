import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/layout/PageContainer'
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
  const [{ user }, t] = await Promise.all([requireRole('OWNER'), getTranslations('Pets')])
  const db = createAdminClient()

  const { data: pet } = await db
    .from('pets')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!pet) notFound()

  async function handleUpdate(data: PetFormType) {
    'use server'
    return updatePet(id, data)
  }

  return (
    <PageContainer className="py-10 sm:py-12">
      <Link
        href="/owner/pets"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <span aria-hidden>←</span>
        {t('newBack')}
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10 max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('editTitle', { name: pet.name })}</h1>
          <p className="text-sm text-gray-400 mt-1">{t('editDesc')}</p>
        </div>
        <PetForm
          action={handleUpdate}
          submitLabel={t('editSubmit')}
          defaultImageUrl={pet.image_url ?? null}
          defaultValues={{
            name: pet.name,
            type: pet.type,
            breed: pet.breed ?? undefined,
            age: pet.age ?? undefined,
          }}
        />
      </div>
    </PageContainer>
  )
}
