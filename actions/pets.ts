'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { petSchema, type PetForm } from '@/lib/validations/pets'
import { firstZodError, type ActionResult } from '@/lib/utils'

export async function createPet(formData: PetForm): Promise<ActionResult> {
  const user = await requireAuth()
  const parsed = petSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) }

  const { name, type, breed, age } = parsed.data
  const db = createAdminClient()

  const { error } = await db.from('pets').insert({
    owner_id: user.id,
    name,
    type,
    breed: breed || null,
    age: age ?? null,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/owner/pets')
  return { success: true }
}

export async function updatePet(id: string, formData: PetForm): Promise<ActionResult> {
  const user = await requireAuth()
  const parsed = petSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) }

  const { name, type, breed, age } = parsed.data
  const db = createAdminClient()

  const { error } = await db
    .from('pets')
    .update({ name, type, breed: breed || null, age: age ?? null })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/owner/pets')
  return { success: true }
}

export async function deletePet(id: string): Promise<ActionResult> {
  const user = await requireAuth()
  const db = createAdminClient()

  const { error } = await db
    .from('pets')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/owner/pets')
  return { success: true }
}
