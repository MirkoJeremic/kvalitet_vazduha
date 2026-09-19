import { useEffect, useRef, useState } from 'react'
import { searchPlaces, reverseGeocode } from '../api/openMeteo.js'
import Icon from './Icon.jsx'

export default function SearchBar({ onPick, current }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [geoBusy, setGeoBusy] = useState(false)
  const [active, setActive] = useState(-1)
  const boxRef = useRef(null)
  const debounce = useRef(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    debounce.current = setTimeout(async () => {
      try {
        const list = await searchPlaces(q)
        setResults(list)
        setOpen(true)
        setActive(-1)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 280)
    return () => clearTimeout(debounce.current)
  }, [q])

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function choose(place) {
    onPick(place)
    setQ('')
    setResults([])
    setOpen(false)
  }

  function onKeyDown(e) {
    if (!open || !results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      alert('Vaš pregledač ne podržava geolokaciju.')
      return
    }
    setGeoBusy(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const place = await reverseGeocode(latitude, longitude)
        setGeoBusy(false)
        choose(place)
      },
      (err) => {
        setGeoBusy(false)
        alert('Nije moguće očitati lokaciju: ' + err.message)
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    )
  }

  return (
    <div className="searchbar" ref={boxRef}>
      <div className="row" style={{ position: 'relative', flex: 1 }}>
        <Icon name="search" size={16} className="search-ico" />
        <input
          className="input"
          style={{ paddingLeft: 40 }}
          placeholder="Unesite grad ili mesto (Beograd, Novi Sad, Beč…)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Pretraga mesta"
          autoComplete="off"
        />
        {open && (results.length > 0 || loading) && (
          <ul className="suggest" role="listbox">
            {loading && <li className="suggest-empty">Pretraga…</li>}
            {!loading &&
              results.map((r, i) => (
                <li
                  key={r.id}
                  role="option"
                  aria-selected={i === active}
                  className={i === active ? 'active' : ''}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(r)
                  }}
                >
                  <span className="s-name">{r.name}</span>
                  <span className="s-meta">
                    {[r.admin1, r.country].filter(Boolean).join(', ')}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
      <button
        className="btn"
        onClick={useMyLocation}
        disabled={geoBusy}
        type="button"
        title="Koristi moju lokaciju"
      >
        <Icon name="navigation" size={15} />
        <span className="hide-sm">{geoBusy ? 'Tražim…' : 'Moja lokacija'}</span>
      </button>

      {current && (
        <div className="current-place chip" title="Trenutno prikazano mesto">
          <strong style={{ color: 'var(--text)' }}>{current.name}</strong>
          {current.country ? ` · ${current.country}` : ''}
        </div>
      )}

      <style>{`
        .searchbar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; position:relative; z-index:50; }
        .search-ico {
          position:absolute; left:13px; top:50%; transform:translateY(-50%);
          color:var(--text-faint); pointer-events:none;
        }
        .suggest {
          position:absolute; z-index:1000; top:calc(100% + 6px); left:0; right:0;
          list-style:none; margin:0; padding:6px;
          background:var(--surface); border:1px solid var(--border-strong);
          border-radius:var(--radius-sm); box-shadow:var(--shadow); max-height:320px; overflow:auto;
        }
        .suggest li {
          padding:9px 11px; border-radius:8px; cursor:pointer;
          display:flex; flex-direction:column; gap:1px;
        }
        .suggest li.active { background:var(--accent-soft); }
        .s-name { font-weight:600; font-size:0.92rem; }
        .s-meta { font-size:0.78rem; color:var(--text-faint); }
        .suggest-empty { padding:10px 11px; color:var(--text-faint); font-size:0.85rem; }
        .current-place { background:var(--surface); }
        @media (max-width:560px){ .hide-sm{ display:none; } }
      `}</style>
    </div>
  )
}
