'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { SITTER_SERVICES } from '@/lib/constants/services'

type SitterFiltersValue = {
  city: string
  minPrice: string
  maxPrice: string
  services: string[]
  hotelOnly: boolean
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr))
}

export function SitterFilters({
  initial,
  totalCount,
}: {
  initial: SitterFiltersValue
  totalCount: number
}) {
  const t = useTranslations('Filter')
  const tSvc = useTranslations('ServiceLabels')
  const router = useRouter()

  const [city, setCity] = useState(initial.city)
  const [minPrice, setMinPrice] = useState(initial.minPrice)
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice)
  const [services, setServices] = useState<string[]>(initial.services)
  const [hotelOnly, setHotelOnly] = useState<boolean>(initial.hotelOnly)

  const activeCount = useMemo(() => {
    return (
      (city.trim() ? 1 : 0) +
      (minPrice.trim() ? 1 : 0) +
      (maxPrice.trim() ? 1 : 0) +
      (services.length ? 1 : 0) +
      (hotelOnly ? 1 : 0)
    )
  }, [city, hotelOnly, maxPrice, minPrice, services.length])

  const toggleService = (id: string) => {
    setServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : uniq([...prev, id])))
  }

  const apply = () => {
    const params = new URLSearchParams()
    const nextCity = city.trim()
    if (nextCity) params.set('city', nextCity)
    const nextMin = minPrice.trim()
    if (nextMin) params.set('min', nextMin)
    const nextMax = maxPrice.trim()
    if (nextMax) params.set('max', nextMax)
    if (services.length) params.set('services', services.join(','))
    if (hotelOnly) params.set('hotel', '1')
    const qs = params.toString()
    router.push(qs ? `/sitters?${qs}` : '/sitters')
  }

  const clear = () => {
    setCity('')
    setMinPrice('')
    setMaxPrice('')
    setServices([])
    setHotelOnly(false)
    router.push('/sitters')
  }

  return (
    <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 sm:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {t('results', { count: totalCount })}
            {activeCount ? ` ${t('active', { count: activeCount })}` : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="flex-1 inline-flex items-center justify-center text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
          >
            {t('clear')}
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex-1 inline-flex items-center justify-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-xl transition-colors"
          >
            {t('apply')}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('city')}</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            type="text"
            placeholder={t('cityPlaceholder')}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <p className="mt-1 text-xs text-gray-400">{t('cityHint')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('priceRange')}</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              type="number"
              min="0"
              placeholder="Min"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              type="number"
              min="0"
              placeholder="Max"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">{t('priceHint')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('services')}</label>
          <div className="rounded-2xl border border-gray-200 bg-white p-3 max-h-64 overflow-auto">
            <div className="grid grid-cols-1 gap-1">
              {SITTER_SERVICES.map((service) => {
                const checked = services.includes(service.id)
                return (
                  <label
                    key={service.id}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-colors ${
                      checked ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(service.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">
                      <span className="mr-1" aria-hidden>{service.icon}</span>
                      {tSvc(service.id)}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-400">{t('servicesHint')}</p>
        </div>

        <div>
          <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hotelOnly}
              onChange={(e) => setHotelOnly(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-800">{t('petHotelOnly')}</span>
              <span className="block text-xs text-gray-500">{t('petHotelOnlyDesc')}</span>
            </span>
          </label>
        </div>
      </div>
    </section>
  )
}
