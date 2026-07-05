import { createAdminClient } from './server'

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'petcare-assets'

async function ensureBucket(bucketName: string) {
  try {
    const admin = createAdminClient()
    const { data: buckets, error: listError } = await admin.storage.listBuckets()

    if (listError) return false
    if (buckets?.some((bucket) => bucket.name === bucketName)) return true

    const { error: createError } = await admin.storage.createBucket(bucketName, { public: true })
    return !createError
  } catch {
    return false
  }
}

export async function uploadProfileImage(file: File, profileId: string) {
  try {
    const admin = createAdminClient()
    const bucketName = DEFAULT_BUCKET
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80) || `profile-${profileId}`
    const path = `profiles/${profileId}/${Date.now()}-${safeName}.${extension}`

    const bucketReady = await ensureBucket(bucketName)
    if (!bucketReady) return null

    const { error } = await admin.storage.from(bucketName).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })

    if (error) return null

    const { data: publicData } = admin.storage.from(bucketName).getPublicUrl(path)
    return publicData.publicUrl || null
  } catch {
    return null
  }
}

export async function uploadPetImage(file: File, petId: string) {
  try {
    const admin = createAdminClient()
    const bucketName = DEFAULT_BUCKET
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80) || `pet-${petId}`
    const path = `pets/${petId}/${Date.now()}-${safeName}.${extension}`

    const bucketReady = await ensureBucket(bucketName)
    if (!bucketReady) return null

    const { error } = await admin.storage.from(bucketName).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })

    if (error) return null

    const { data: publicData } = admin.storage.from(bucketName).getPublicUrl(path)
    return publicData.publicUrl || null
  } catch {
    return null
  }
}
