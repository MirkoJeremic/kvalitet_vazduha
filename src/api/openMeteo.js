// Komunikacija sa Open-Meteo servisima 
import { toLatin, resolveExonym } from '../lib/transliterate.js'

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const WX_URL = 'https://api.open-meteo.com/v1/forecast'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url, params, { retries = 3 } = {}) {
  const qs = new URLSearchParams(params).toString()
  for (let attempt = 0; ; attempt++) {
    let res
    try {
      res = await fetch(`${url}?${qs}`)
    } catch (netErr) {
      if (attempt < retries) {
        await sleep(400 * 2 ** attempt)
        continue
      }
      throw new Error('Nema veze sa serverom. Proverite internet konekciju.')
    }
    if (res.ok) return res.json()

    // 429 (previše zahteva), cekanje, pokusaj ponovo
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await sleep(500 * 2 ** attempt + Math.random() * 300)
      continue
    }
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.reason ? ` (${body.reason})` : ''
    } catch {

    }
    throw new Error(`Zahtev nije uspeo: ${res.status}${detail}`)
  }
}

// Ogranicavanje broj istovremenih poziva
export function createLimiter(concurrency = 3, gap = 0) {
  let active = 0
  let lastStart = 0
  const queue = []
  const next = async () => {
    if (active >= concurrency || !queue.length) return
    if (gap) {
      const wait = lastStart + gap - Date.now()
      if (wait > 0) {
        setTimeout(next, wait)
        return
      }
    }
    active++
    lastStart = Date.now()
    const { fn, resolve, reject } = queue.shift()
    fn()
      .then(resolve, reject)
      .finally(() => {
        active--
        next()
      })
    next()
  }
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject })
      next()
    })
}

const limit = createLimiter(3, 150)

export async function searchPlaces(query, { count = 8 } = {}) {
  const q = query.trim()
  if (q.length < 2) return []
  const data = await getJson(GEO_URL, {
    // Cirilica -> latinica pre slanja, pa tek onda provera egzonima
    name: resolveExonym(toLatin(q)),
    count,
    language: 'sr',
    format: 'json',
  })
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: toLatin(r.name),
    admin1: toLatin(r.admin1 ?? ''),
    country: toLatin(r.country ?? ''),
    countryCode: r.country_code ?? '',
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone ?? 'auto',
    population: r.population ?? null,
  }))
}

// Obrnuto geokodiranje, koriscenje BigDataCloud 
export async function reverseGeocode(lat, lon) {
  try {
    const data = await getJson('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      latitude: lat,
      longitude: lon,
      localityLanguage: 'en',
    })
    const name =
      data.city || data.locality || data.principalSubdivision || data.countryName || 'Izabrana tačka'
    return {
      name: toLatin(name),
      admin1: toLatin(data.principalSubdivision ?? ''),
      country: toLatin(data.countryName ?? ''),
      latitude: lat,
      longitude: lon,
      timezone: 'auto',
    }
  } catch {
    return {
      name: 'Izabrana tačka',
      admin1: '',
      country: '',
      latitude: lat,
      longitude: lon,
      timezone: 'auto',
    }
  }
}

const HOURLY_VARS = [
  'pm10',
  'pm2_5',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
  'dust',
  'uv_index',
  'ammonia',
  'us_aqi',
  'us_aqi_pm2_5',
  'us_aqi_pm10',
  'us_aqi_ozone',
  'us_aqi_nitrogen_dioxide',
  'us_aqi_sulphur_dioxide',
  'us_aqi_carbon_monoxide',
  'european_aqi',
  'european_aqi_pm2_5',
  'european_aqi_pm10',
  'european_aqi_ozone',
  'european_aqi_nitrogen_dioxide',
  'european_aqi_sulphur_dioxide',
  'alder_pollen',
  'birch_pollen',
  'grass_pollen',
  'mugwort_pollen',
  'olive_pollen',
  'ragweed_pollen',
]

const CURRENT_VARS = [
  'us_aqi',
  'european_aqi',
  'pm10',
  'pm2_5',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
  'dust',
  'uv_index',
  'ammonia',
  'us_aqi_pm2_5',
  'us_aqi_pm10',
  'us_aqi_ozone',
  'us_aqi_nitrogen_dioxide',
  'us_aqi_sulphur_dioxide',
  'us_aqi_carbon_monoxide',
  'european_aqi_pm2_5',
  'european_aqi_pm10',
  'european_aqi_ozone',
  'european_aqi_nitrogen_dioxide',
  'european_aqi_sulphur_dioxide',
]

export async function fetchAirQuality(lat, lon, { pastDays = 30, forecastDays = 5 } = {}) {
  return getJson(AIR_URL, {
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    past_days: pastDays,
    forecast_days: forecastDays,
    current: CURRENT_VARS.join(','),
    hourly: HOURLY_VARS.join(','),
  })
}


export async function fetchCurrentIndex(lat, lon) {
  const data = await limit(() =>
    getJson(AIR_URL, {
      latitude: lat,
      longitude: lon,
      timezone: 'auto',
      current: ['us_aqi', 'european_aqi', 'pm2_5', 'pm10'].join(','),
    }),
  )
  return data.current ?? null
}

export async function fetchWeather(lat, lon) {
  const data = await getJson(WX_URL, {
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'is_day',
    ].join(','),
  })
  return data.current ?? null
}
