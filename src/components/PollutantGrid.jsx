import { useState } from 'react'
import { POLLUTANTS, POLLUTANT_ORDER, whoReference } from '../lib/pollutants.js'
import { num } from '../lib/format.js'
import { Sparkline } from './common.jsx'

// Kartice za šest zagađivača
export default function PollutantGrid({ current, recentRows }) {
  return (
    <div className="grid pollutant-grid">
      {POLLUTANT_ORDER.map((key) => (
        <PollutantCard
          key={key}
          meta={POLLUTANTS[key]}
          value={current?.[key]}
          series={recentRows.map((r) => r[key])}
        />
      ))}
      <style>{`
        .pollutant-grid { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
        /* fiksno 3 kolone na desktopu, da izbegnemo neravan auto-fill red (5+1) */
        @media (min-width: 900px) {
          .pollutant-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  )
}

function PollutantCard({ meta, value, series }) {
  const [open, setOpen] = useState(false)
  const ref = whoReference(meta.key)
  const ratio = ref && value != null ? value / ref : null
  const pct = ratio == null ? 0 : Math.max(4, Math.min(100, ratio * 50)) // 100% bara = 2× SZO
  const over = ratio != null && ratio > 1
  const barColor = over ? (ratio > 2 ? '#e63946' : '#ff8c00') : '#00b050'

  return (
    <div className="card tight p-card">
      <div className="row spread">
        <div className="row" style={{ gap: 6 }}>
          <strong style={{ fontSize: '0.95rem' }}>{meta.label}</strong>
          <button
            className="info-dot"
            onClick={() => setOpen((v) => !v)}
            aria-label={`Objašnjenje: ${meta.fullName}`}
            type="button"
          >
            i
          </button>
        </div>
        <Sparkline values={series} color={meta.color} width={72} height={26} />
      </div>

      <div className="tnum" style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: 4 }}>
        {num(value, value >= 100 ? 0 : 1)}
        <span className="faint" style={{ fontSize: '0.72rem', fontWeight: 600 }}> {meta.unit}</span>
      </div>

      <div className="p-name faint">{meta.fullName}</div>

      {ref && (
        <div className="p-bar-wrap" title={`Smernica SZO: ${num(ref, 0)} ${meta.unit}`}>
          <div className="p-bar-track">
            <div className="p-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
            <div className="p-bar-mark" style={{ left: '50%' }} />
          </div>
          <div className="p-bar-label" style={{ color: over ? barColor : 'var(--text-faint)' }}>
            {ratio == null
              ? '—'
              : over
                ? `${num(ratio, 1)}× iznad SZO`
                : `${num(ratio * 100, 0)}% SZO granice`}
          </div>
        </div>
      )}

      {open && <div className="p-about">{meta.about}</div>}

      <style>{`
        .p-card { display:flex; flex-direction:column; gap:2px; }
        .info-dot {
          width:16px; height:16px; border-radius:50%; border:1px solid var(--border-strong);
          background:var(--surface-2); color:var(--text-faint); font-size:10px; font-style:italic;
          font-weight:700; cursor:pointer; line-height:1; display:flex; align-items:center; justify-content:center;
        }
        .info-dot:hover { color:var(--accent); border-color:var(--accent); }
        .p-name { font-size:0.72rem; margin-top:1px; }
        .p-bar-wrap { margin-top:10px; }
        .p-bar-track {
          position:relative; height:7px; border-radius:999px; background:var(--surface-inset);
          overflow:hidden;
        }
        .p-bar-fill { position:absolute; left:0; top:0; bottom:0; border-radius:999px; transition:width .5s ease; }
        .p-bar-mark { position:absolute; top:-2px; bottom:-2px; width:2px; background:var(--text-faint); opacity:.6; }
        .p-bar-label { font-size:0.72rem; font-weight:600; margin-top:5px; }
        .p-about {
          margin-top:10px; font-size:0.78rem; color:var(--text-soft); line-height:1.45;
          border-top:1px solid var(--border); padding-top:8px;
        }
      `}</style>
    </div>
  )
}
