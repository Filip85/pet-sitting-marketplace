export interface ExternalHotel {
  id: string
  name: string
  address: string
  lat: number
  lon: number
  sourceUrl: string
}

export interface ExternalHotelsDebug {
  city: string
  variants: string[]
  sourceCounts: {
    google: number
  }
  mergedBeforeLimit: number
  finalCount: number
}

export interface ExternalHotelsResult {
  items: ExternalHotel[]
  debug: ExternalHotelsDebug
}

interface GooglePlacesNewResponse {
  places?: Array<{
    id: string
    displayName?: {
      text?: string
    }
    formattedAddress?: string
    location?: {
      latitude?: number
      longitude?: number
    }
  }>
}

interface GoogleGeocodingResponse {
  results?: Array<{
    formatted_address?: string
    address_components?: Array<{
      long_name?: string
      short_name?: string
      types?: string[]
    }>
    geometry?: {
      location?: {
        lat?: number
        lng?: number
      }
      viewport?: {
        northeast?: {
          lat?: number
          lng?: number
        }
        southwest?: {
          lat?: number
          lng?: number
        }
      }
    }
  }>
}

type CitySize = 'small' | 'medium' | 'large'

interface CitySearchContext {
  centerLat: number
  centerLon: number
  radiusMeters: number
  size: CitySize
  cityAliases: string[]
  countryCode?: string
  countryName?: string
}

const NETWORK_TIMEOUT_MS = 3500

const PET_HOTEL_KEYWORDS = [
  'pet hotel',
  'hotel za pse',
  'hotel za mačke',
  'hotel za macke',
  'mackotel',
  'cat hotel',
  'dog hotel',
  'pansion za pse',
  'pansion za mačke',
  'pansion za macke',
  'dog boarding',
  'cat boarding',
  'animal boarding',
  'boarding kennel',
  'boarding',
  'kennel',
  'pet daycare',
]

const PET_HOTEL_NEGATIVE_KEYWORDS = [
  'pet sitting',
  'pet transfer',
  'transfer',
  'vrtić',
  'vrtic',
]

const GOOGLE_QUERY_TERMS = [
  'pet hotel',
  'animal boarding',
  'pet boarding',
  'dog hotel',
  'cat hotel',
  'boarding kennel',
  'hotel za pse',
  'hotel za mačke',
  'hotel za macke',
  'pansion za pse',
]

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function cityVariants(city: string): string[] {
  const trimmed = city.trim()
  if (!trimmed) return []

  const ascii = normalizeText(trimmed)
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const variants = [trimmed]
  if (ascii && ascii !== normalizeText(trimmed)) {
    variants.push(ascii)
  }

  return Array.from(new Set(variants))
}

function looksLikePetHotel(name: string | undefined, address: string | undefined): boolean {
  const combined = normalizeText([name ?? '', address ?? ''].join(' '))
  if (!combined) return false

  if (PET_HOTEL_NEGATIVE_KEYWORDS.some((keyword) => combined.includes(normalizeText(keyword)))) {
    return false
  }

  return PET_HOTEL_KEYWORDS.some((keyword) => combined.includes(normalizeText(keyword)))
}

function hasToken(text: string, token: string): boolean {
  const escapedToken = token
    .trim()
    .toLowerCase()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+')

  if (!escapedToken) return false

  const pattern = new RegExp(`(^|[^a-z0-9])${escapedToken}([^a-z0-9]|$)`)
  return pattern.test(text)
}

function addressMentionsCity(address: string, aliases: string[]): boolean {
  const normalizedAddress = normalizeText(address)
  const variants = aliases
    .map((variant) => normalizeText(variant).trim())
    .filter((variant) => variant.length >= 3)

  if (normalizedAddress.includes('grad zagreb') && variants.some((variant) => variant.includes('zagreb'))) {
    return true
  }

  return variants.some((variant) => hasToken(normalizedAddress, variant))
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earthRadius = 6371

  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  return 2 * earthRadius * Math.asin(Math.sqrt(h))
}

async function fetchCitySearchContext(city: string): Promise<CitySearchContext | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', city)
  url.searchParams.set('key', apiKey)

  let response: Response
  try {
    response = await fetchWithTimeout(url.toString(), { next: { revalidate: 1800 } }, NETWORK_TIMEOUT_MS)
  } catch {
    return null
  }

  if (!response.ok) return null

  const payload = (await response.json()) as GoogleGeocodingResponse
  const first = payload.results?.[0]
  const location = first?.geometry?.location
  const components = first?.address_components ?? []

  const centerLat = location?.lat
  const centerLon = location?.lng
  if (!Number.isFinite(centerLat) || !Number.isFinite(centerLon)) return null

  const northeast = first?.geometry?.viewport?.northeast
  const southwest = first?.geometry?.viewport?.southwest

  const diagonalKm =
    Number.isFinite(northeast?.lat) &&
    Number.isFinite(northeast?.lng) &&
    Number.isFinite(southwest?.lat) &&
    Number.isFinite(southwest?.lng)
      ? haversineKm(
          { lat: northeast?.lat as number, lon: northeast?.lng as number },
          { lat: southwest?.lat as number, lon: southwest?.lng as number }
        )
      : 20

  let size: CitySize = 'medium'
  let radiusMeters = 18000

  if (diagonalKm < 12) {
    size = 'small'
    radiusMeters = 9000
  } else if (diagonalKm > 35) {
    size = 'large'
    radiusMeters = 38000
  }

  const aliasTypes = new Set(['locality', 'postal_town', 'administrative_area_level_1', 'administrative_area_level_2'])
  const cityAliases = new Set<string>(cityVariants(city))

  for (const component of components) {
    const types = component.types ?? []
    if (!types.some((type) => aliasTypes.has(type))) continue
    if (component.long_name) cityAliases.add(component.long_name)
    if (component.short_name) cityAliases.add(component.short_name)
  }

  const leadingFromFormatted = first?.formatted_address?.split(',')[0]?.trim()
  if (leadingFromFormatted) cityAliases.add(leadingFromFormatted)

  const countryComponent = components.find((component) => (component.types ?? []).includes('country'))

  return {
    centerLat: centerLat as number,
    centerLon: centerLon as number,
    radiusMeters,
    size,
    cityAliases: Array.from(cityAliases),
    countryCode: countryComponent?.short_name,
    countryName: countryComponent?.long_name,
  }
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = NETWORK_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchGooglePlacesHotels(
  city: string,
  limit: number,
  cityContext: CitySearchContext | null
): Promise<ExternalHotel[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return []

  const termCount = cityContext?.size === 'large' ? 10 : cityContext?.size === 'small' ? 6 : 8
  const searchTerms = GOOGLE_QUERY_TERMS.slice(0, termCount)
  const perQueryLimit = Math.max(4, Math.min(cityContext?.size === 'large' ? 12 : 10, limit))
  const strictCityMatch = cityContext?.size !== 'large'
  const cityAliases = cityContext?.cityAliases?.length ? cityContext.cityAliases : cityVariants(city)
  const countryName = cityContext?.countryName?.trim()
  const countryCode = cityContext?.countryCode?.trim().toUpperCase()
  const locationQuery = countryName ? `${city}, ${countryName}` : city
  const maxDistanceKm = cityContext ? Math.max(10, (cityContext.radiusMeters / 1000) * 1.6) : null

  const resultsPerTerm = await Promise.all(
    searchTerms.map(async (term) => {
      const url = 'https://places.googleapis.com/v1/places:searchText'

      let response: Response
      try {
        response = await fetchWithTimeout(
          url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              textQuery: `${term} in ${locationQuery}`,
              languageCode: 'en',
              pageSize: perQueryLimit,
              ...(countryCode && countryCode.length === 2 ? { regionCode: countryCode } : {}),
              ...(cityContext
                ? {
                    locationBias: {
                      circle: {
                        center: {
                          latitude: cityContext.centerLat,
                          longitude: cityContext.centerLon,
                        },
                        radius: cityContext.radiusMeters,
                      },
                    },
                  }
                : {}),
            }),
            next: { revalidate: 1800 },
          },
          NETWORK_TIMEOUT_MS
        )
      } catch {
        return [] as ExternalHotel[]
      }

      if (!response.ok) return [] as ExternalHotel[]

      const payload = (await response.json()) as GooglePlacesNewResponse
      const rows = payload.places ?? []

      return rows
        .map((row): ExternalHotel | null => {
          const lat = row.location?.latitude
          const lon = row.location?.longitude
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

          const name = row.displayName?.text?.trim() || 'Google place'
          const address = row.formattedAddress || city
          const distanceKm =
            cityContext
              ? haversineKm(
                  { lat: cityContext.centerLat, lon: cityContext.centerLon },
                  { lat: lat as number, lon: lon as number }
                )
              : null

          if (!looksLikePetHotel(name, address)) return null
          if (maxDistanceKm !== null && distanceKm !== null && distanceKm > maxDistanceKm) return null
          if (strictCityMatch && !addressMentionsCity(address, cityAliases)) return null
          return {
            id: `google:${row.id}`,
            name,
            address,
            lat: lat as number,
            lon: lon as number,
            sourceUrl: `https://www.google.com/maps/place/?q=place_id:${row.id}`,
          }
        })
        .filter((item): item is ExternalHotel => item !== null)
    })
  )

  const merged = new Map<string, ExternalHotel>()
  for (const item of resultsPerTerm.flat()) {
    const key = item.id || `${Math.round(item.lat * 10000)}:${Math.round(item.lon * 10000)}:${normalizeText(item.name)}`
    if (!merged.has(key)) merged.set(key, item)
  }

  return Array.from(merged.values()).slice(0, limit)
}

export async function fetchExternalPetHotelsByCityDetailed(city: string, limit = 12): Promise<ExternalHotelsResult> {
  const trimmedCity = city.trim()
  const safeLimit = Math.max(1, Math.min(limit, 50))

  if (!trimmedCity) {
    return {
      items: [],
      debug: {
        city: trimmedCity,
        variants: [],
        sourceCounts: { google: 0 },
        mergedBeforeLimit: 0,
        finalCount: 0,
      },
    }
  }

  const variants = cityVariants(trimmedCity)
  const cityContext = await fetchCitySearchContext(trimmedCity)
  const itemsPerVariant = await Promise.all(
    variants.map((variant) => fetchGooglePlacesHotels(variant, safeLimit, cityContext))
  )
  const rawItems = itemsPerVariant.flat()

  const deduped = new Map<string, ExternalHotel>()
  for (const item of rawItems) {
    const key = item.id || `${Math.round(item.lat * 10000)}:${Math.round(item.lon * 10000)}:${normalizeText(item.name)}`
    if (!deduped.has(key)) deduped.set(key, item)
  }

  const mergedItems = Array.from(deduped.values())
  const finalItems = mergedItems.slice(0, safeLimit)

  return {
    items: finalItems,
    debug: {
      city: trimmedCity,
      variants,
      sourceCounts: { google: rawItems.length },
      mergedBeforeLimit: mergedItems.length,
      finalCount: finalItems.length,
    },
  }
}

export async function fetchExternalPetHotelsByCity(city: string, limit = 50): Promise<ExternalHotel[]> {
  const result = await fetchExternalPetHotelsByCityDetailed(city, limit)
  return result.items
}
