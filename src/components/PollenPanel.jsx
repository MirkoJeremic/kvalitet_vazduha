import { useMemo } from 'react'
import { num } from '../lib/format.js'
import { nowIndex, sliceRecent } from '../lib/series.js'
import { Sparkline } from './common.jsx'

const POLLEN = [
  { key: 'alder_pollen', label: 'Jova', low: 5, mod: 25, high: 50 },
  { key: 'birch_pollen', label: 'Breza', low: 5, mod: 50, high: 200 },
  { key: 'grass_pollen', label: 'Trave', low: 5, mod: 20, high: 50 },
  { key: 'mugwort_pollen', label: 'Pelin', low: 5, mod: 15, high: 50 },
  { key: 'olive_pollen', label: 'Maslina', low: 5, mod: 50, high: 200 },
  { key: 'ragweed_pollen', label: 'Ambrozija', low: 2, mod: 10, high: 30 },
]

function level(v, t) {
  if (v == null) return { name: '—', color: 'var(--text-faint)' }
  if (v < 1) return { name: 'Nema', color: '#94a3b8' }
  if (v < t.low) return { name: 'Vrlo nizak', color: '#00b050' }
  if (v < t.mod) return { name: 'Nizak', color: '#84c318' }
  if (v < t.high) return { name: 'Umeren', color: '#ffd60a' }
  return { name: 'Visok', color: '#ff8c00' }
}

export default function PollenPanel({ rows }) {
  const cur = rows[nowIndex(rows)] ?? {}
  const recent = useMemo(() => sliceRecent(rows, 48), [rows])

  const items = POLLEN.map((p) => ({
    ...p,
    value: cur[p.key],
    lvl: level(cur[p.key], p),
    series: recent.map((r) => r[p.key]),
  }))

  const anyData = items.some((i) => i.value != null)
  if (!anyData) return null

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>Polen u vazduhu</h3>
          <div className="card-sub">Koncentracija po vrsti, zrnaca/m³ · izvor CAMS (Evropa)</div>
        </div>
      </div>
      <div className="pollen-grid">
        {items.map((i) => (
          <div key={i.key} className="pollen-item">
            <div className="row spread">
              <strong style={{ fontSize: '0.9rem' }}>{i.label}</strong>
              <span className="badge" style={{ background: i.lvl.color, color: '#0b1220', fontSize: '0.7rem', padding: '3px 8px' }}>
                {i.lvl.name}
              </span>
            </div>
            <div className="row spread" style={{ marginTop: 6 }}>
              <span className="tnum" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {num(i.value, 0)}
              </span>
              <Sparkline values={i.series} color={i.lvl.color} width={80} height={24} />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .pollen-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:12px; }
        /* fiksno 3 kolone na desktopu, da izbegnemo neravan auto-fill red */
        @media (min-width: 900px) {
          .pollen-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .pollen-item { background:var(--surface-2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px 14px; }
      `}</style>
    </div>
  )
}
