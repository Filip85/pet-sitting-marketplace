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
    overpassRaw: number
    overpassMapped: number
    nominatimNamed: number
    photon: number
    broadFallback: number
    google: number
  }
  mergedBeforeLimit: number
  finalCount: number
}

export interface ExternalHotelsResult {
  items: ExternalHotel[]
  debug: ExternalHotelsDebug
}

interface OverpassElement {
  id: number
  type: 'node' | 'way' | 'relation'
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

interface PhotonFeature {
  properties?: {
    osm_type?: 'N' | 'W' | 'R'
    osm_id?: number
    name?: string
    street?: string
    housenumber?: string
    city?: string
    country?: string
  }
  geometry?: {
    type: 'Point'
    coordinates: [number, number]
  }
}

interface PhotonResponse {
  features: PhotonFeature[]
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

interface NominatimCityRow {
  lat: string
  lon: string
  boundingbox?: [string, string, string, string]
}

interface CityArea {
  lat: number
  lon: number
  boundingBox?: {
    south: number
    north: number
    west: number
    east: number
  }
}

const DEFAULT_COUNTRY_CODE = 'hr'
const NETWORK_TIMEOUT_MS = 3000

interface NominatimPlaceRow {
  place_id: number
  display_name: string
  lat: string
  lon: string
  name?: string
  osm_id?: number
  osm_type?: 'node' | 'way' | 'relation' | 'N' | 'W' | 'R'
}

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
  'pet house',
  'nannydogs',
  'woff woff',
  'alfapawpaf',
  'alpha dog team',
]

const PET_HOTEL_NEGATIVE_KEYWORDS = [
  'pet sitting',
  'transfer',
  'čuvanje kućnih ljubimaca',
  'cuvanje kucnih ljubimaca',
  'pet transfer',
  'vrtić',
  'vrtic',
]

const GENERIC_HOTEL_QUERIES = [
  'pet hotel',
  'animal boarding',
  'pet boarding',
  'dog hotel',
  'cat hotel',
  'kennel',
  'pet daycare',
  'hotel za pse',
  'hotel za mačke',
  'hotel za macke',
  'pansion za pse',
  'čuvanje pasa',
  'cuvanje pasa',
  'mačkotel',
  'mackotel',
]

function buildViewbox(center: { lat: number; lon: number }, delta = 0.35): string {
  const left = center.lon - delta
  const top = center.lat + delta
  const right = center.lon + delta
  const bottom = center.lat - delta
  return `${left},${top},${right},${bottom}`
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const radius = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  return 2 * radius * Math.asin(Math.sqrt(h))
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

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function addressMentionsCity(address: string, city: string): boolean {
  const normalizedAddress = normalizeText(address)
  const cityVariantsList = cityVariants(city).map((variant) => normalizeText(variant))

  if (normalizedAddress.includes('grad zagreb') && cityVariantsList.some((variant) => variant.includes('zagreb'))) {
    return true
  }

  return cityVariantsList.some((variant) => normalizedAddress.includes(variant))
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

function looksLikePetHotel(name: string | undefined): boolean {
  if (!name) return false
  const normalized = normalizeText(name)
  if (PET_HOTEL_NEGATIVE_KEYWORDS.some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return false
  }

  return PET_HOTEL_KEYWORDS.some((keyword) => normalized.includes(normalizeText(keyword)))
}

function looksLikePetHotelOverpass(tags: Record<string, string> | undefined): boolean {
  if (!tags) return false
  if (tags['amenity'] === 'animal_boarding' || tags['animal_boarding'] === 'yes') {
    return true
  }

  const candidates = [
    tags.name,
    tags.description,
    tags['brand'],
    tags['operator'],
  ]
  return candidates.some((value) => looksLikePetHotel(value))
}

function toOsmPath(osmType: OverpassElement['type'], osmId: number | undefined): string | null {
  if (!osmId || !osmType) return null
  if (osmType === 'node') return `/node/${osmId}`
  if (osmType === 'way') return `/way/${osmId}`
  if (osmType === 'relation') return `/relation/${osmId}`
  return null
}

function getCoordinates(element: OverpassElement): { lat: number; lon: number } | null {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { lat: element.lat, lon: element.lon }
  }
  if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
    return { lat: element.center.lat, lon: element.center.lon }
  }
  return null
}

function buildAddress(tags: Record<string, string> | undefined, city: string): string {
  if (!tags) return city
  const street = tags['addr:street']
  const number = tags['addr:housenumber']
  const placeCity = tags['addr:city'] || city
  const parts = [
    [street, number].filter(Boolean).join(' ').trim(),
    placeCity,
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : city
}

function mapOverpassToExternal(row: OverpassElement, city: string): ExternalHotel | null {
  const coords = getCoordinates(row)
  if (!coords) return null

  const primaryName = row.tags?.name?.trim() || 'Pet-friendly place'
  const osmPath = toOsmPath(row.type, row.id)

  return {
    id: `${row.type}:${row.id}`,
    name: primaryName,
    address: buildAddress(row.tags, city),
    lat: coords.lat,
    lon: coords.lon,
    sourceUrl: osmPath ? `https://www.openstreetmap.org${osmPath}` : 'https://www.openstreetmap.org',
  }
}

async function fetchOverpassElements(city: string, limit: number): Promise<OverpassElement[]> {
  const areaName = city.replace(/"/g, '')

  const query = `
[out:json][timeout:25];
area["ISO3166-1"="HR"]["admin_level"="2"]->.countryArea;
area["name"="${areaName}"]["boundary"="administrative"](area.countryArea)->.searchArea;
(
  nwr["amenity"="animal_boarding"](area.searchArea);
  nwr["animal_boarding"="yes"](area.searchArea);
  nwr["shop"="pet_grooming"](area.searchArea);
  nwr["shop"="pet"]["name"~"pet hotel|hotel|boarding|daycare|kennel|pansion|cuvanje",i](area.searchArea);
  nwr["tourism"="hotel"]["pets"~"yes|designated|only",i](area.searchArea);
  nwr["name"~"pet hotel|hotel za pse|hotel za ma[cč]ke|mackotel|boarding|kennel|pansion|europansion|pet house|nannydogs|woff woff|alfapawpaf|alpha dog team|vrti[cć]|[cč]uvanje",i](area.searchArea);
);
out center ${limit};
`

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ]

  for (const endpoint of endpoints) {
    let response: Response
    try {
      response = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            Accept: 'application/json',
            'User-Agent': 'PetCareMarketplace/1.0',
          },
          body: query,
          next: { revalidate: 1800 },
        },
        1800
      )
    } catch {
      continue
    }

    if (!response.ok) {
      continue
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      continue
    }

    const payload = (await response.json()) as OverpassResponse
    return payload.elements ?? []
  }

  return []
}

async function fetchOverpassBroadPetPlaces(city: string, limit: number): Promise<OverpassElement[]> {
  const areaName = city.replace(/"/g, '')

  const query = `
[out:json][timeout:25];
area["ISO3166-1"="HR"]["admin_level"="2"]->.countryArea;
area["name"="${areaName}"]["boundary"="administrative"](area.countryArea)->.searchArea;
(
  nwr["amenity"="animal_boarding"](area.searchArea);
  nwr["shop"="pet"](area.searchArea);
  nwr["shop"="pet_grooming"](area.searchArea);
);
out center ${limit};
`

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ]

  for (const endpoint of endpoints) {
    let response: Response
    try {
      response = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            Accept: 'application/json',
            'User-Agent': 'PetCareMarketplace/1.0',
          },
          body: query,
          next: { revalidate: 1800 },
        },
        1800
      )
    } catch {
      continue
    }

    if (!response.ok) continue
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) continue
    const payload = (await response.json()) as OverpassResponse
    return payload.elements ?? []
  }

  return []
}

function isWithinBoundingBox(
  point: { lat: number; lon: number },
  boundingBox: { south: number; north: number; west: number; east: number }
): boolean {
  return (
    point.lat >= boundingBox.south &&
    point.lat <= boundingBox.north &&
    point.lon >= boundingBox.west &&
    point.lon <= boundingBox.east
  )
}

function isWithinCityArea(point: { lat: number; lon: number }, cityArea: CityArea | null): boolean {
  if (!cityArea) return true
  if (cityArea.boundingBox) {
    return isWithinBoundingBox(point, cityArea.boundingBox)
  }

  return haversineKm(cityArea, point) <= 20
}

async function fetchCityCenter(city: string): Promise<CityArea | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', DEFAULT_COUNTRY_CODE)
  url.searchParams.set('q', `${city}, Croatia`)

  let response: Response
  try {
    response = await fetchWithTimeout(
      url.toString(),
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'PetCareMarketplace/1.0',
        },
        next: { revalidate: 1800 },
      },
      2200
    )
  } catch {
    return null
  }

  if (!response.ok) return null

  const rows = (await response.json()) as NominatimCityRow[]
  const first = rows[0]
  if (!first) return null

  const lat = Number(first.lat)
  const lon = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  const boundingBox = first.boundingbox
  if (!boundingBox || boundingBox.length !== 4) {
    return { lat, lon }
  }

  const south = Number(boundingBox[0])
  const north = Number(boundingBox[1])
  const west = Number(boundingBox[2])
  const east = Number(boundingBox[3])

  if (![south, north, west, east].every(Number.isFinite)) {
    return { lat, lon }
  }

  return { lat, lon, boundingBox: { south, north, west, east } }
}

function photonTypeToOsmType(type: 'N' | 'W' | 'R' | undefined): OverpassElement['type'] {
  if (type === 'N') return 'node'
  if (type === 'R') return 'relation'
  return 'way'
}

function nominatimTypeToOsmType(type: NominatimPlaceRow['osm_type']): OverpassElement['type'] {
  if (type === 'N' || type === 'node') return 'node'
  if (type === 'R' || type === 'relation') return 'relation'
  return 'way'
}

async function fetchNominatimNamedHotels(city: string, limit: number): Promise<ExternalHotel[]> {
  const center = await fetchCityCenter(city)
  const maxQueries = Math.min(GENERIC_HOTEL_QUERIES.length, 5)
  const queries = GENERIC_HOTEL_QUERIES.slice(0, maxQueries)

  const queryResults = await Promise.all(
    queries.map(async (queryText) => {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', '4')
    url.searchParams.set('countrycodes', DEFAULT_COUNTRY_CODE)
    url.searchParams.set('q', `${queryText}, ${city}`)
    if (center) {
      url.searchParams.set('viewbox', buildViewbox(center))
      url.searchParams.set('bounded', '1')
    }

    let response: Response
    try {
      response = await fetchWithTimeout(
        url.toString(),
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'PetCareMarketplace/1.0',
          },
          next: { revalidate: 1800 },
        },
        1800
      )
    } catch {
      return [] as ExternalHotel[]
    }

    if (!response.ok) return [] as ExternalHotel[]

    const rows = (await response.json()) as NominatimPlaceRow[]
    const items: ExternalHotel[] = []
    for (const row of rows) {
      const lat = Number(row.lat)
      const lon = Number(row.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue

      const name = row.name?.trim() || row.display_name.split(',')[0]?.trim() || 'Pet-friendly place'
      if (!looksLikePetHotel(name) && !looksLikePetHotel(row.display_name)) continue

      const osmPath = toOsmPath(nominatimTypeToOsmType(row.osm_type), row.osm_id)

      items.push({
        id: `nominatim:${row.place_id}`,
        name,
        address: row.display_name,
        lat,
        lon,
        sourceUrl: osmPath ? `https://www.openstreetmap.org${osmPath}` : 'https://www.openstreetmap.org',
      })
    }
    return items
  })
  )

  return queryResults.flat().slice(0, limit)
}

async function fetchPhotonHotels(city: string, limit: number): Promise<ExternalHotel[]> {
  const center = await fetchCityCenter(city)
  const normalizedCityVariants = cityVariants(city).map((variant) => normalizeText(variant))
  const queryTerms = [`pet hotel ${city}`, `pet ${city}`, `boarding ${city}`]
  const perQueryLimit = Math.max(6, Math.min(16, limit))

  const featuresPerQuery = await Promise.all(
    queryTerms.map(async (queryTerm) => {
      const url = new URL('https://photon.komoot.io/api/')
      url.searchParams.set('q', queryTerm)
      url.searchParams.set('limit', String(perQueryLimit))
      if (center) {
        url.searchParams.set('lat', String(center.lat))
        url.searchParams.set('lon', String(center.lon))
      }

      let response: Response
      try {
        response = await fetchWithTimeout(
          url.toString(),
          {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'PetCareMarketplace/1.0',
            },
            next: { revalidate: 1800 },
          },
          3200
        )
      } catch {
        return [] as PhotonFeature[]
      }

      if (!response.ok) return [] as PhotonFeature[]

      const payload = (await response.json()) as PhotonResponse
      return payload.features ?? []
    })
  )

  const features = featuresPerQuery.flat()

  const mapped = features
    .map((feature): ExternalHotel | null => {
      const coords = feature.geometry?.coordinates
      if (!coords || coords.length < 2) return null

      const [lon, lat] = coords
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

      const props = feature.properties
      const name = props?.name?.trim() || 'Hotel'
      if (!looksLikePetHotel(name)) return null
      const normalizedCity = normalizeText(props?.city || '')
      const normalizedCountry = normalizeText(props?.country || '')
      const cityMatches = normalizedCityVariants.some((variant) => normalizedCity.includes(variant))
      const countryMatches = normalizedCountry.includes('croatia') || normalizedCountry.includes('hrvatska')
      const distanceKm = center ? haversineKm(center, { lat, lon }) : null

      const locationMatches = cityMatches || (countryMatches && distanceKm !== null && distanceKm <= 20)

      if (!locationMatches) return null

      const address = [
        [props?.street, props?.housenumber].filter(Boolean).join(' ').trim(),
        props?.city || city,
        props?.country,
      ].filter(Boolean).join(', ')

      const osmType = photonTypeToOsmType(props?.osm_type)
      const osmPath = toOsmPath(osmType, props?.osm_id)

      return {
        id: `photon:${props?.osm_type ?? 'W'}:${props?.osm_id ?? name}`,
        name,
        address: address || city,
        lat,
        lon,
        sourceUrl: osmPath ? `https://www.openstreetmap.org${osmPath}` : 'https://www.openstreetmap.org',
      }
    })
    .filter((item): item is ExternalHotel => item !== null)

  const deduped = new Map<string, ExternalHotel>()
  for (const item of mapped) {
    const key = `${Math.round(item.lat * 10000)}:${Math.round(item.lon * 10000)}:${normalizeText(item.name)}`
    if (!deduped.has(key)) deduped.set(key, item)
  }

  return Array.from(deduped.values()).slice(0, limit)
}

async function fetchGooglePlacesHotels(city: string, limit: number): Promise<ExternalHotel[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return []

  const center = await fetchCityCenter(city)
  const queryTerms = [
    'pet hotel',
    'animal boarding',
    'dog hotel',
    'dog boarding',
    'hotel za pse',
    'hotel za mačke',
    'hotel za macke',
    'pansion za pse',
    'boarding kennel',
    'cat hotel',
  ]
  const perQueryLimit = Math.max(3, Math.min(8, limit))

  const resultsPerTerm = await Promise.all(
    queryTerms.map(async (term) => {
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
              textQuery: `${term} in ${city}, Croatia`,
              regionCode: DEFAULT_COUNTRY_CODE.toUpperCase(),
              languageCode: 'en',
            }),
            next: { revalidate: 1800 },
          },
          2500
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
          if (!looksLikePetHotel(name) && !looksLikePetHotel(row.formattedAddress)) return null
          if (center && haversineKm(center, { lat: lat as number, lon: lon as number }) > 30) return null

          return {
            id: `google:${row.id}`,
            name,
            address: row.formattedAddress || city,
            lat: lat as number,
            lon: lon as number,
            sourceUrl: `https://www.google.com/maps/place/?q=place_id:${row.id}`,
          }
        })
        .filter((item): item is ExternalHotel => item !== null)
        .slice(0, perQueryLimit)
    })
  )

  const merged = new Map<string, ExternalHotel>()
  for (const item of resultsPerTerm.flat()) {
    const key = `${Math.round(item.lat * 10000)}:${Math.round(item.lon * 10000)}:${normalizeText(item.name)}`
    if (!merged.has(key)) merged.set(key, item)
  }

  return Array.from(merged.values()).slice(0, limit)
}

export async function fetchExternalPetHotelsByCityDetailed(city: string, limit = 12): Promise<ExternalHotelsResult> {
  const trimmedCity = city.trim()
  if (!trimmedCity) {
    return {
      items: [],
      debug: {
        city: trimmedCity,
        variants: [],
        sourceCounts: {
          overpassRaw: 0,
          overpassMapped: 0,
          nominatimNamed: 0,
          photon: 0,
          broadFallback: 0,
          google: 0,
        },
        mergedBeforeLimit: 0,
        finalCount: 0,
      },
    }
  }

  const safeLimit = Math.max(1, Math.min(limit, 50))
  const cityArea = await fetchCityCenter(trimmedCity)
  const variants = cityVariants(trimmedCity)

  const [rowsPerVariant, photonPerVariant, namedPerVariant, broadPerVariant, googlePerVariant] = await Promise.all([
    Promise.all(variants.map((v) => fetchOverpassElements(v, safeLimit))),
    Promise.all(variants.map((v) => fetchPhotonHotels(v, safeLimit))),
    Promise.all(variants.map((v) => fetchNominatimNamedHotels(v, safeLimit))),
    Promise.all(variants.map((v) => fetchOverpassBroadPetPlaces(v, safeLimit))),
    Promise.all(variants.map((v) => fetchGooglePlacesHotels(v, safeLimit))),
  ])

  const rows = rowsPerVariant.flat()
  const photonItems = photonPerVariant.flat()
  const namedItems = namedPerVariant.flat()
  const broadRows = broadPerVariant.flat()
  const googleItems = googlePerVariant.flat()

  const deduped = new Map<string, OverpassElement>()
  for (const row of rows) {
    deduped.set(`${row.type}:${row.id}`, row)
  }

  const overpassItems = Array.from(deduped.values())
    .map((row): ExternalHotel | null => mapOverpassToExternal(row, trimmedCity))
    .filter((item): item is ExternalHotel => item !== null)
    .slice(0, safeLimit)

  const broadItems = broadRows
    .map((row): ExternalHotel | null => mapOverpassToExternal(row, trimmedCity))
    .filter((item, index): item is ExternalHotel => {
      if (!item) return false
      const sourceRow = broadRows[index]
      return looksLikePetHotel(item.name) || looksLikePetHotel(item.address) || looksLikePetHotelOverpass(sourceRow?.tags)
    })
    .slice(0, safeLimit)

  const merged = new Map<string, ExternalHotel>()
  for (const item of [...namedItems, ...overpassItems, ...googleItems, ...photonItems]) {
    const key = `${Math.round(item.lat * 10000)}:${Math.round(item.lon * 10000)}:${normalizeText(item.name)}`
    if (!merged.has(key)) {
      merged.set(key, item)
    }
  }

  if (merged.size < Math.min(8, safeLimit)) {
    for (const item of broadItems) {
      const key = `${Math.round(item.lat * 10000)}:${Math.round(item.lon * 10000)}:${normalizeText(item.name)}`
      if (!merged.has(key)) {
        merged.set(key, item)
      }
      if (merged.size >= safeLimit) break
    }
  }

  const mergedItems = Array.from(merged.values())
  const finalItems = mergedItems
    .filter((item) => isWithinCityArea({ lat: item.lat, lon: item.lon }, cityArea))
    .filter((item) => addressMentionsCity(item.address, trimmedCity))
    .slice(0, safeLimit)

  return {
    items: finalItems,
    debug: {
      city: trimmedCity,
      variants,
      sourceCounts: {
        overpassRaw: rows.length,
        overpassMapped: overpassItems.length,
        nominatimNamed: namedItems.length,
        photon: photonItems.length,
        broadFallback: broadItems.length,
        google: googleItems.length,
      },
      mergedBeforeLimit: mergedItems.length,
      finalCount: finalItems.length,
    },
  }
}

export async function fetchExternalPetHotelsByCity(city: string, limit = 50): Promise<ExternalHotel[]> {
  const result = await fetchExternalPetHotelsByCityDetailed(city, limit)
  return result.items
}
