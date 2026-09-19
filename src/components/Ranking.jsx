import { useState } from 'react'
import { AQI_KEYS, bandFor, colorFor } from '../lib/aqi.js'
import { num } from '../lib/format.js'
import { PRESET_CITIES } from '../lib/cities.js'
import { Skeleton } from './common.jsx'

export default function Ranking({ standard, onPick, shared }) {
  const [view, setView] = useState('worst') // worst | best

  const indexKey = AQI_KEYS[standard].index

  if (!shared) {
    return (
      <div className="card">
        <div className="card-head"><h3>Rang-lista praćenih gradova</h3></div>
        <Skeleton height={220} />
      </div>
    )
  }

  const withIndex = shared.filter((r) => r.current?.[indexKey] != null)
  const sortedAsc = [...withIndex].sort((a, b) => a.current[indexKey] - b.current[indexKey])
  const top10 = view === 'worst' ? [...sortedAsc].reverse().slice(0, 10) : sortedAsc.slice(0, 10)
  const max = Math.max(...top10.map((r) => r.current[indexKey] ?? 0), 1)

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>Rang-lista praćenih gradova</h3>
          <div className="card-sub">
            Od {PRESET_CITIES.length} unapred izabranih gradova (ne svih gradova sveta) · trenutni{' '}
            {standard === 'us' ? 'US' : 'EU'} AQI
          </div>
        </div>
      </div>

      <div className="segmented" style={{ marginBottom: 12 }}>
        <button type="button" className={view === 'worst' ? 'active' : ''} onClick={() => setView('worst')}>
          Najzagađeniji
        </button>
        <button type="button" className={view === 'best' ? 'active' : ''} onClick={() => setView('best')}>
          Najčistiji
        </button>
      </div>

      <ol className="rank-list">
        {top10.map((r, i) => {
          const v = r.current[indexKey]
          const band = bandFor(standard, v)
          return (
            <li key={r.city.name + r.city.latitude}>
              <button className="rank-row" onClick={() => onPick(r.city)} type="button">
                <span className="rank-pos faint">{i + 1}</span>
                <span className="rank-name">
                  {r.city.name}
                  <span className="faint"> · {r.city.country}</span>
                </span>
                <span className="rank-bar-wrap">
                  <span
                    className="rank-bar"
                    style={{ width: `${((v ?? 0) / max) * 100}%`, background: colorFor(standard, v) }}
                  />
                </span>
                <span className="rank-val tnum" style={{ color: band.color }}>
                  {num(v, 0)}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <style>{`
        .rank-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:4px; }
        .rank-row {
          width:100%; display:grid; grid-template-columns: 22px 1fr 90px 42px;
          align-items:center; gap:10px; background:transparent; border:0; cursor:pointer;
          padding:7px 8px; border-radius:8px; text-align:left; color:var(--text); font-size:0.88rem;
        }
        .rank-row:hover { background:var(--surface-2); }
        .rank-pos { font-size:0.8rem; text-align:center; }
        .rank-name { font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .rank-bar-wrap { height:8px; background:var(--surface-inset); border-radius:999px; overflow:hidden; }
        .rank-bar { display:block; height:100%; border-radius:999px; transition:width .5s ease; }
        .rank-val { text-align:right; font-weight:800; }
        @media (max-width:520px){
          .rank-row { grid-template-columns: 20px 1fr 42px; }
          .rank-bar-wrap { display:none; }
        }
      `}</style>
    </div>
  )
}
