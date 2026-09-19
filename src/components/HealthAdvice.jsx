import { AQI_KEYS, bandFor, healthAdvice } from '../lib/aqi.js'
import Icon from './Icon.jsx'

export default function HealthAdvice({ standard, current }) {
  const value = current?.[AQI_KEYS[standard].index]
  const band = bandFor(standard, value)
  const advice = healthAdvice(standard, value)
  if (!advice) return null

  return (
    <div className="card health">
      <div className="card-head">
        <div>
          <h3>Zdravstvene preporuke</h3>
          <div className="card-sub">Za trenutnu kategoriju</div>
        </div>
        <span className="badge" style={{ background: band.color, color: band.text }}>
          {band.name}
        </span>
      </div>
      <div className="health-grid">
        <div className="health-col">
          <div className="h-title"><Icon name="users" size={17} /> Opšta populacija</div>
          <p className="muted">{advice.general}</p>
        </div>
        <div className="health-col">
          <div className="h-title"><Icon name="heart-pulse" size={17} /> Osetljive grupe</div>
          <p className="muted">{advice.sensitive}</p>
          <div className="faint" style={{ fontSize: '0.76rem', marginTop: 6 }}>
            Deca, stariji, trudnice, osobe sa astmom, HOBP ili srčanim oboljenjima.
          </div>
        </div>
      </div>

      {advice.tips?.length > 0 && (
        <div className="row wrap" style={{ gap: 8, marginTop: 16 }}>
          {advice.tips.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      )}

      <style>{`
        .health-grid { display:grid; grid-template-columns: 1fr 1fr; gap:18px; }
        .h-title {
          display:flex; align-items:center; gap:8px;
          font-weight:700; margin-bottom:6px; font-size:0.92rem;
        }
        .h-title svg { color:var(--text-faint); }
        @media (max-width:640px){ .health-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
