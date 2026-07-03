import Link from 'next/link'

import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { parseServices } from '@/lib/constants/services'
import { PageContainer } from '@/components/layout/PageContainer'
import { SitterProfileForm } from '@/components/sitters/SitterProfileForm'

export const dynamic = 'force-dynamic'

export default async function SitterProfilePage() {
  const { user } = await requireRole('SITTER')
  const db = createAdminClient()

  const [{ data: sitterProfile }, { data: profile }] = await Promise.all([
    db.from('sitter_profiles').select('price_per_day, years_of_experience, services_offered').eq('profile_id', user.id).single(),
    db.from('profiles').select('bio, city').eq('id', user.id).single(),
  ])

  return (
    <PageContainer className="py-10 sm:py-12">
      <Link
        href="/sitter"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <span aria-hidden>&larr;</span>
        Back to dashboard
      </Link>

      <div className="max-w-xl">
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit profile</h1>
              <p className="text-sm text-gray-400 mt-1">
                Update your rate, services, and bio. Owners see this on your public profile.
              </p>
            </div>

            <SitterProfileForm
              defaultValues={{
                pricePerDay: sitterProfile ? Number(sitterProfile.price_per_day) : undefined,
                yearsOfExperience: sitterProfile?.years_of_experience ?? undefined,
                services: parseServices(sitterProfile?.services_offered),
                bio: profile?.bio ?? '',
                city: profile?.city ?? '',
              }}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
