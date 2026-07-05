'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { petSchema, type PetForm } from '@/lib/validations/pets'
import { firstZodError, type ActionResult } from '@/lib/utils'
import { uploadPetImage } from '@/lib/supabase/storage'

type PetActionData = PetForm & { imageFile?: File | null }

function isMissingColumnError(message: string) {
  return /column .* does not exist|does not exist|undefined column/i.test(message)
}

async function persistPetImage(petId: string, imageFile?: File | null) {
  if (!imageFile) return

  try {
    const imageUrl = await uploadPetImage(imageFile, petId)
    if (!imageUrl) return

    const db = createAdminClient()
    const { error } = await db.from('pets').update({ image_url: imageUrl }).eq('id', petId)

    if (error && isMissingColumnError(error.message)) {
      return
    }
  } catch {
    return
  }
}

export async function createPet(formData: PetActionData): Promise<ActionResult> {
  const user = await requireAuth()
  const parsed = petSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: firstZodError(parsed.error) }

  const { name, type, breed, age } = parsed.data
  const db = createAdminClient()

  const { data: pet, error } = await db
    .from('pets')
    .insert({
      owner_id: user.id,
      name,
      type,
      breed: breed || null,
      age: age ?? null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  if (pet?.id) {
    await persistPetImage(pet.id, formData.imageFile)
  }

  revalidatePath('/owner/pets')
  return { success: true }
}

export async function updatePet(id: string, formData: PetActionData): Promise<ActionResult> {
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

  if (formData.imageFile) {
    await persistPetImage(id, formData.imageFile)
  }

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
