import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { PageContainer } from '@/components/layout/PageContainer'
import { SitterGrid } from '@/components/sitters/SitterGrid'
import { createAdminClient } from '@/lib/supabase/server'
import { fetchExternalPetHotelsByCityDetailed } from '@/lib/hotels/external'
import type { SitterWithProfile } from '@/types'
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Internet Hotels | PetCare',
  description: 'Find pet hotels and boarding providers by city.',
}

function buildEmbedMapUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps?q=${lat},${lon}&z=14&output=embed`
}

type HotelSource = 'external' | 'internal'

function parseSource(value: string | undefined): HotelSource {
  return value === 'internal' ? 'internal' : 'external'
}

function buildTabHref(source: HotelSource, city: string): string {
  const params = new URLSearchParams()
  params.set('source', source)
  if (city) params.set('city', city)
  return `/hotels?${params.toString()}`
}

interface RawInternalHotelRow {
  id: string
  profile_id: string
  price_per_day: number
  years_of_experience: number | null
  services_offered: string | null
  can_host_at_home: boolean
  created_at: string
  profile:
    | { first_name: string; last_name: string; city: string | null; bio: string | null; image_url: string | null }
    | { first_name: string; last_name: string; city: string | null; bio: string | null; image_url: string | null }[]
}

function normaliseInternalHotels(rows: RawInternalHotelRow[]): SitterWithProfile[] {
  const hotels: SitterWithProfile[] = []
  for (const row of rows) {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile
    if (!profile) continue
    hotels.push({
      ...row,
      years_of_experience: row.years_of_experience ?? undefined,
      services_offered: row.services_offered ?? undefined,
      profile,
    })
  }
  return hotels
}

async function fetchRegisteredHotels(city: string): Promise<SitterWithProfile[]> {
  const db = createAdminClient()

  function buildRegisteredHotelsQuery(strict: boolean) {
    let query = db
      .from('sitter_profiles')
      .select(
        `
          id, profile_id, price_per_day, years_of_experience,
          services_offered, can_host_at_home, created_at,
          profile:profiles ( first_name, last_name, city, bio, image_url )
        `,
        { count: 'exact' }
      )
      .eq('can_host_at_home', true)

    if (strict) {
      query = query.ilike('services_offered', '%pet-hotel%')
    }

    if (city) {
      query = query.ilike('profiles.city', `%${city}%`)
    }

    return query.order('created_at', { ascending: false })
  }

  let { data, error } = await buildRegisteredHotelsQuery(true)

  if (!error && (data?.length ?? 0) === 0) {
    const fallbackResult = await buildRegisteredHotelsQuery(false)
    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error) throw error

  return normaliseInternalHotels((data as RawInternalHotelRow[]) ?? [])
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams?: Promise<{ city?: string; source?: string }>
}) {
  const [params, t] = await Promise.all([searchParams, getTranslations('Hotels')])
  const city = params?.city?.trim() ?? ''
  const source = parseSource(params?.source)

  let externalHotels: Awaited<ReturnType<typeof fetchExternalPetHotelsByCityDetailed>>['items'] = []
  let externalError: string | null = null
  let internalHotels: SitterWithProfile[] = []
  let internalError: string | null = null

  if (source === 'external') {
    if (city) {
      try {
        const externalResult = await fetchExternalPetHotelsByCityDetailed(city)
        externalHotels = externalResult.items
      } catch {
        externalError = t('providerUnavailable')
      }
    }
  } else {
    try {
      internalHotels = await fetchRegisteredHotels(city)
    } catch {
      internalError = t('internalError')
    }
  }

  return (
    <PageContainer className="py-10 sm:py-12">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-cyan-50 to-white border border-emerald-100 p-8 sm:p-10 mb-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('title')}</h1>
        <p className="text-sm text-gray-500 mt-2">{t('subtitle')}</p>
      </div>

      <div className="mb-6 inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
        <a
          href={buildTabHref('external', city)}
          aria-current={source === 'external' ? 'page' : undefined}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            source === 'external'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {t('tabExternal')}
        </a>
        <a
          href={buildTabHref('internal', city)}
          aria-current={source === 'internal' ? 'page' : undefined}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            source === 'internal'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {t('tabInternal')}
        </a>
      </div>

      <form method="get" action="/hotels" className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <input type="hidden" name="source" value={source} />
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              {t('searchCity')}
            </label>
            <input
              id="city"
              name="city"
              defaultValue={city}
              placeholder="e.g. Zagreb"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl transition-colors"
            >
              {t('search')}
            </button>
            <a
              href={buildTabHref(source, '')}
              className="inline-flex items-center justify-center text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors"
            >
              {t('reset')}
            </a>
          </div>
        </div>
      </form>

      {source === 'external' ? (
        <>
          <div className="mb-5 text-sm text-gray-500">
            {t('externalCount', { count: externalHotels.length })}
          </div>

          {!city ? (
            <div className="rounded-3xl bg-white border border-gray-100 px-6 py-10 text-center">
              <p className="text-gray-700 font-semibold mb-1">{t('enterCity')}</p>
              <p className="text-gray-500 text-sm">{t('enterCityDesc')}</p>
            </div>
          ) : externalError ? (
            <div className="rounded-3xl bg-red-50 border border-red-100 px-6 py-10 text-center">
              <p className="text-red-700 font-semibold mb-1">{t('externalError')}</p>
              <p className="text-red-500 text-sm">{externalError}</p>
            </div>
          ) : externalHotels.length === 0 ? (
            <div className="rounded-3xl bg-white border border-gray-100 px-6 py-10 text-center">
              <p className="text-gray-700 font-semibold mb-1">{t('noExternal')}</p>
              <p className="text-gray-500 text-sm">{t('noExternalDesc')}</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-5" aria-label="External pet hotels">
              {externalHotels.map((hotel: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; address: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; sourceUrl: string | undefined; lat: number; lon: number }) => (
                <li key={hotel.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 mb-2">
                      {t('externalBadge')}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900">{hotel.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{hotel.address}</p>
                    <a
                      href={hotel.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex mt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      {t('openMaps')}
                    </a>
                  </div>
                  <iframe
                    title={`Map for ${hotel.name}`}
                    src={buildEmbedMapUrl(hotel.lat, hotel.lon)}
                    className="w-full h-56 rounded-xl border border-gray-200"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : internalError ? (
        <div className="rounded-3xl bg-red-50 border border-red-100 px-6 py-10 text-center">
          <p className="text-red-700 font-semibold mb-1">{t('internalError')}</p>
          <p className="text-red-500 text-sm">{internalError}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mb-5 text-sm text-gray-500">
            {t('internalCount', { count: internalHotels.length })}
          </div>

          {city ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {t('showingCity', { city })}
            </div>
          ) : null}

          <SitterGrid
            sitters={internalHotels}
            cardBadgeLabel={t('tabInternal')}
            emptyTitle={t('noRegistered')}
            emptyMessage={city ? t('tryCityFilter') : t('addCityFilter')}
          />
        </div>
      )}
    </PageContainer>
  )
}
