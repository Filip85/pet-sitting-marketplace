'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerAuthClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { petSchema, PetForm } from '@/lib/validations/pets'

// ── Auth helper ───────────────────────────────────────────────────────────────

async function getAuthUser() {
  const supabase = await createServerAuthClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createPet(formData: PetForm) {
  const user = await getAuthUser()

  const result = petSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { name, type, breed, age } = result.data
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from('pets').insert({
    owner_id: user.id,
    name,
    type,
    breed: breed || null,
    age: age ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/owner/pets')
  return { success: true }
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updatePet(id: string, formData: PetForm) {
  const user = await getAuthUser()

  const result = petSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { name, type, breed, age } = result.data
  const supabase = createServerSupabaseClient()

  // Verify ownership before updating
  const { data: existing } = await supabase
    .from('pets')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (!existing || existing.owner_id !== user.id) {
    return { error: 'Pet not found or access denied.' }
  }

  const { error } = await supabase
    .from('pets')
    .update({ name, type, breed: breed || null, age: age ?? null })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/owner/pets')
  return { success: true }
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deletePet(id: string) {
  const user = await getAuthUser()

  const supabase = createServerSupabaseClient()

  // owner_id filter enforces ownership at DB level
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/owner/pets')
  return { success: true }
}
