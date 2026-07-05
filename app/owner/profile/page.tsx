import Link from 'next/link'

import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/layout/PageContainer'
import { OwnerProfileForm } from '@/components/auth/OwnerProfileForm'

export const dynamic = 'force-dynamic'

export default async function OwnerProfilePage() {
  const { user } = await requireRole('OWNER')
  const db = createAdminClient()

  const { data: profile } = await db
    .from('profiles')
    .select('first_name, last_name, city, bio, image_url')
    .eq('id', user.id)
    .single()

  return (
    <PageContainer className="py-10 sm:py-12">
      <Link
        href="/owner"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <span aria-hidden>←</span>
        Back to dashboard
      </Link>

      <div className="max-w-xl">
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-blue-400" />

          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit profile</h1>
              <p className="text-sm text-gray-400 mt-1">
                Add or update your profile photo and personal details.
              </p>
            </div>

            <OwnerProfileForm
              defaultImageUrl={profile?.image_url ?? null}
              defaultValues={{
                firstName: profile?.first_name ?? '',
                lastName: profile?.last_name ?? '',
                city: profile?.city ?? '',
                bio: profile?.bio ?? '',
              }}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
