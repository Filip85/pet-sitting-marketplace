import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { requireRole } from '@/lib/supabase/protected'
import { createAdminClient } from '@/lib/supabase/server'
import { parseServices } from '@/lib/constants/services'
import { PageContainer } from '@/components/layout/PageContainer'
import { SitterProfileForm } from '@/components/sitters/SitterProfileForm'

export const dynamic = 'force-dynamic'

export default async function SitterProfilePage() {
  const [{ user }, t] = await Promise.all([requireRole('SITTER'), getTranslations('Sitter.profile')])
  const db = createAdminClient()

  const [{ data: sitterProfile }, { data: profile }] = await Promise.all([
    db.from('sitter_profiles').select('price_per_day, years_of_experience, services_offered, can_host_at_home').eq('profile_id', user.id).single(),
    db.from('profiles').select('bio, city, image_url').eq('id', user.id).single(),
  ])

  return (
    <PageContainer className="py-10 sm:py-12">
      <Link
        href="/sitter"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <span aria-hidden>&larr;</span>
        {t('back')}
      </Link>

      <div className="max-w-xl">
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
              <p className="text-sm text-gray-400 mt-1">{t('subtitle')}</p>
            </div>

            <SitterProfileForm
              defaultImageUrl={profile?.image_url ?? null}
              defaultValues={{
                pricePerDay: sitterProfile ? Number(sitterProfile.price_per_day) : undefined,
                yearsOfExperience: sitterProfile?.years_of_experience ?? undefined,
                services: parseServices(sitterProfile?.services_offered),
                canHostAtHome: sitterProfile?.can_host_at_home ?? false,
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
