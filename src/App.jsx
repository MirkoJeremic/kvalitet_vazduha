import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import SearchBar from './components/SearchBar.jsx'
import CurrentPanel from './components/CurrentPanel.jsx'
import PollutantGrid from './components/PollutantGrid.jsx'
import HealthAdvice from './components/HealthAdvice.jsx'
import PollenPanel from './components/PollenPanel.jsx'
import { Section, Card, Skeleton, ErrorBanner } from './components/common.jsx'

// Lazy load — smanjuje početni paket
const HistoryPanel = lazy(() => import('./components/HistoryPanel.jsx'))
const ForecastPanel = lazy(() => import('./components/ForecastPanel.jsx'))
const MapPanel = lazy(() => import('./components/MapPanel.jsx'))
const Ranking = lazy(() => import('./components/Ranking.jsx'))
const CityCompare = lazy(() => import('./components/CityCompare.jsx'))

import { fetchAirQuality, fetchWeather, fetchCurrentIndex } from './api/openMeteo.js'
import { DEFAULT_LOCATION, PRESET_CITIES } from './lib/cities.js'
import { buildRows, sliceRecent } from './lib/series.js'
import { AQI_KEYS, bandFor } from './lib/aqi.js'

function loadPref(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}
function savePref(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
  
  }
}

// Keš rang-liste gradova u localStorage na 20 min, da se svaki refresh ne
// plaća novim API pozivom.
const PRESET_CACHE_KEY = 'aqi-preset-cache-v2'
const PRESET_CACHE_TTL = 20 * 60 * 1000
const presetCacheTag = PRESET_CITIES.map((c) => c.name).join('|')

function loadPresetCache() {
  try {
    const raw = localStorage.getItem(PRESET_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.ts || !Array.isArray(parsed.rows)) return null
    if (parsed.tag !== presetCacheTag) return null
    if (Date.now() - parsed.ts > PRESET_CACHE_TTL) return null
    return parsed.rows
  } catch {
    return null
  }
}
function savePresetCache(rows) {
  try {
    localStorage.setItem(PRESET_CACHE_KEY, JSON.stringify({ ts: Date.now(), tag: presetCacheTag, rows }))
  } catch {

  }
}

function locationFromUrl() {
  const p = new URLSearchParams(window.location.search)
  const lat = parseFloat(p.get('lat'))
  const lon = parseFloat(p.get('lon'))
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return {
      name: p.get('name') || 'Izabrana tačka',
      country: p.get('country') || '',
      admin1: '',
      latitude: lat,
      longitude: lon,
      timezone: 'auto',
    }
  }
  return null
}

export default function App() {
  const [standard, setStandard] = useState(() => loadPref('standard', 'us'))
  const [theme, setTheme] = useState(() => {
    const saved = loadPref('theme', null)
    if (saved) return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [place, setPlace] = useState(() => locationFromUrl() ?? DEFAULT_LOCATION)
  const [air, setAir] = useState(null)
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('')
  const [presetData, setPresetData] = useState(null)
  const reqId = useRef(0)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    savePref('theme', theme)
  }, [theme])

  useEffect(() => {
    savePref('standard', standard)
  }, [standard])

  const load = useCallback(async (loc) => {
    const id = ++reqId.current
    setStatus('loading')
    setErrorMsg('')
    try {
      const [aq, wx] = await Promise.all([
        fetchAirQuality(loc.latitude, loc.longitude),
        fetchWeather(loc.latitude, loc.longitude).catch(() => null),
      ])
      if (id !== reqId.current) return // zastareo odgovor
      setAir(aq)
      setWeather(wx)
      setStatus('ready')
    } catch (err) {
      if (id !== reqId.current) return
      setErrorMsg(err.message || 'Nepoznata greška')
      setStatus('error')
    }
  }, [])


  useEffect(() => {
    load(place)
    const p = new URLSearchParams()
    p.set('name', place.name)
    if (place.country) p.set('country', place.country)
    p.set('lat', place.latitude.toFixed(4))
    p.set('lon', place.longitude.toFixed(4))
    window.history.replaceState(null, '', `?${p.toString()}`)
  }, [place, load])

  // Učitavanje nakon glavnog mesta, da se ne pošalju svi pozivi odjednom
  const presetStarted = useRef(false)
  useEffect(() => {
    if (status !== 'ready' || presetStarted.current) return
    presetStarted.current = true

    const cached = loadPresetCache()
    if (cached) {
      setPresetData(cached)
      return
    }

    let alive = true
    Promise.allSettled(
      PRESET_CITIES.map((c) => fetchCurrentIndex(c.latitude, c.longitude)),
    ).then((results) => {
      if (!alive) return
      const rows = results
        .map((r, i) =>
          r.status === 'fulfilled' && r.value ? { city: PRESET_CITIES[i], current: r.value } : null,
        )
        .filter(Boolean)
      setPresetData(rows)
      if (rows.length) savePresetCache(rows)
    })
    return () => {
      alive = false
    }
  }, [status])

  const rows = useMemo(() => (air?.hourly ? buildRows(air.hourly) : []), [air])
  const recent24 = useMemo(() => sliceRecent(rows, 24), [rows])
  const current = air?.current ?? null

  useEffect(() => {
    if (!current) return
    const band = bandFor(standard, current[AQI_KEYS[standard].index])
    document.documentElement.style.setProperty('--aqi', band.color)
    document.documentElement.style.setProperty('--aqi-contrast', band.text)
  }, [current, standard])

  return (
    <div className="app">
      <Header standard={standard} onStandard={setStandard} theme={theme} onTheme={setTheme} />

      <div className="stack">
        <div style={{ position: 'relative', zIndex: 20 }}>
          <Card tight className="reveal">
            <SearchBar onPick={setPlace} current={place} />
          </Card>
        </div>

        {status === 'error' && (
          <ErrorBanner message={errorMsg} onRetry={() => load(place)} />
        )}

        {status === 'loading' && (
          <div className="stack">
            <Skeleton height={280} />
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px,1fr))' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={150} />
              ))}
            </div>
            <Skeleton height={360} />
          </div>
        )}

        {status === 'ready' && current && (
          <>
            <Section title="Trenutno stanje" hint={place.name}>
              <CurrentPanel
                standard={standard}
                current={current}
                currentTime={current.time}
                weather={weather}
              />
            </Section>

            <Section title="Zagađujuće materije" hint="trenutne vrednosti · period 24 h · odnos prema SZO">
              <PollutantGrid current={current} recentRows={recent24} />
            </Section>

            <HealthAdvice standard={standard} current={current} />

            <Suspense fallback={<Skeleton height={420} />}>
              <Section title="Istorija i analiza" hint="do 30 dana unazad, po satu">
                <HistoryPanel rows={rows} standard={standard} place={place} />
              </Section>

              <Section title="Prognoza">
                <ForecastPanel rows={rows} standard={standard} />
              </Section>
            </Suspense>

            <PollenPanel rows={rows} />

            <Suspense fallback={<Skeleton height={460} />}>
              <Section title="Mapa">
                <MapPanel
                  place={place}
                  onPick={setPlace}
                  presetData={presetData}
                  standard={standard}
                />
              </Section>

              <Section title="Poređenje" hint="rang-lista gradova i sopstveni izbor">
                <div className="two-col">
                  <Ranking standard={standard} onPick={setPlace} shared={presetData} />
                  <CityCompare standard={standard} seed={place} />
                </div>
              </Section>
            </Suspense>
          </>
        )}
      </div>

      <Footer />

      <style>{`
        .two-col { display:grid; grid-template-columns: 1fr 1fr; gap:16px; align-items:start; }
        @media (max-width: 900px){ .two-col { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
