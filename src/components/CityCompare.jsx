import { useEffect, useRef, useState } from 'react'
import { searchPlaces, fetchCurrentIndex } from '../api/openMeteo.js'
import { AQI_KEYS, bandFor, colorFor } from '../lib/aqi.js'
import { num } from '../lib/format.js'
import Icon from './Icon.jsx'

export default function CityCompare({ standard, seed }) {
  const [items, setItems] = useState([]) // { place, current, loading }
  const seededRef = useRef(false)

  function addPlace(place) {
    setItems((prev) => {
      if (prev.length >= 4) return prev
      if (prev.some((p) => p.place.name === place.name && Math.abs(p.place.latitude - place.latitude) < 0.01))
        return prev
      const entry = { place, current: null, loading: true }
      fetchCurrentIndex(place.latitude, place.longitude)
        .then((cur) =>
          setItems((cur2) =>
            cur2.map((it) => (it.place === place ? { ...it, current: cur, loading: false } : it)),
          ),
        )
        .catch(() =>
          setItems((cur2) =>
            cur2.map((it) => (it.place === place ? { ...it, loading: false } : it)),
          ),
        )
      return [...prev, entry]
    })
  }

  useEffect(() => {
    if (seed && !seededRef.current) {
      seededRef.current = true
      addPlace(seed)
    }
  }, [seed])

  function remove(place) {
    setItems((prev) => prev.filter((p) => p.place !== place))
  }

  const indexKey = AQI_KEYS[standard].index
  const maxVal = Math.max(1, ...items.map((it) => it.current?.[indexKey] ?? 0))

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>Poređenje gradova</h3>
          <div className="card-sub">Dodajte do 4 lokacije i uporedite trenutni indeks</div>
        </div>
      </div>

      {items.length < 4 && <MiniSearch onPick={addPlace} />}

      {items.length === 0 && (
        <p className="faint" style={{ fontSize: '0.85rem', marginTop: 10 }}>
          Još nema dodatih gradova.
        </p>
      )}

      <div className="cmp-grid">
        {items.map(({ place, current, loading }) => {
          const v = current?.[indexKey]
          const band = bandFor(standard, v)
          return (
            <div key={place.name + place.latitude} className="cmp-card">
              <div className="row spread">
                <strong style={{ fontSize: '0.92rem' }}>{place.name}</strong>
                <button className="btn ghost icon" onClick={() => remove(place)} type="button" aria-label="Ukloni">
                  <Icon name="x" size={14} />
                </button>
              </div>
              <div className="faint" style={{ fontSize: '0.74rem' }}>{place.country || '—'}</div>
              {loading ? (
                <div className="skeleton" style={{ height: 54, marginTop: 10 }} />
              ) : (
                <>
                  <div className="tnum" style={{ fontSize: '2rem', fontWeight: 800, color: band.color, marginTop: 6 }}>
                    {num(v, 0)}
                  </div>
                  <div className="badge" style={{ background: band.color, color: band.text, fontSize: '0.7rem' }}>
                    {band.name}
                  </div>
                  <div className="cmp-bar">
                    <span style={{ width: `${((v ?? 0) / maxVal) * 100}%`, background: colorFor(standard, v) }} />
                  </div>
                  <div className="faint" style={{ fontSize: '0.76rem', marginTop: 6 }}>
                    PM2.5 {num(current?.pm2_5, 1)} · PM10 {num(current?.pm10, 1)} µg/m³
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        .cmp-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:12px; margin-top:14px; }
        .cmp-card { background:var(--surface-2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px 14px; }
        .cmp-bar { height:8px; background:var(--surface-inset); border-radius:999px; overflow:hidden; margin-top:10px; }
        .cmp-bar span { display:block; height:100%; border-radius:999px; transition:width .5s ease; }
      `}</style>
    </div>
  )
}

function MiniSearch({ onPick }) {
  const [q, setQ] = useState('')
  const [res, setRes] = useState([])
  const [open, setOpen] = useState(false)
  const t = useRef(null)

  useEffect(() => {
    if (t.current) clearTimeout(t.current)
    if (q.trim().length < 2) {
      setRes([])
      return
    }
    t.current = setTimeout(async () => {
      try {
        setRes(await searchPlaces(q, { count: 6 }))
        setOpen(true)
      } catch {
        setRes([])
      }
    }, 280)
    return () => clearTimeout(t.current)
  }, [q])

  return (
    <div style={{ position: 'relative', maxWidth: 340 }}>
      <input
        className="input"
        placeholder="Dodaj grad…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => res.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && res.length > 0 && (
        <ul className="suggest" role="listbox" style={{ position: 'absolute', zIndex: 30, top: 'calc(100% + 4px)', left: 0, right: 0, listStyle: 'none', margin: 0, padding: 6, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)' }}>
          {res.map((r) => (
            <li
              key={r.id}
              onMouseDown={(e) => {
                e.preventDefault()
                onPick(r)
                setQ('')
                setRes([])
                setOpen(false)
              }}
              style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</div>
              <div className="faint" style={{ fontSize: '0.76rem' }}>
                {[r.admin1, r.country].filter(Boolean).join(', ')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
