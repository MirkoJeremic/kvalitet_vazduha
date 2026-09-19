import { STANDARDS, bandFor, scaleFraction } from '../lib/aqi.js'

export default function AqiGauge({ standard, value, size = 240 }) {
  const s = STANDARDS[standard] ?? STANDARDS.us
  const band = bandFor(standard, value)
  const frac = scaleFraction(standard, value)

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 16
  const startAngle = 180
  const endAngle = 360 

  const polar = (angleDeg, radius = r) => {
    const a = (angleDeg * Math.PI) / 180
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)]
  }

  const arc = (a0, a1, radius = r) => {
    const [x0, y0] = polar(a0, radius)
    const [x1, y1] = polar(a1, radius)
    const large = a1 - a0 > 180 ? 1 : 0
    return `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1}`
  }


  const segments = s.bands.map((b) => {
    const from = Math.min(b.min, s.max) / s.max
    const to = Math.min(b.max, s.max) / s.max
    return {
      color: b.color,
      a0: startAngle + from * (endAngle - startAngle),
      a1: startAngle + to * (endAngle - startAngle),
    }
  })

  const needleAngle = startAngle + frac * (endAngle - startAngle)
  const [nx, ny] = polar(needleAngle, r - 6)

  return (
    <div className="gauge" style={{ width: size }}>
      <svg width={size} height={size / 2 + 52} viewBox={`0 0 ${size} ${size / 2 + 52}`}>
        {segments.map((seg, i) => (
          <path
            key={i}
            d={arc(seg.a0, seg.a1)}
            stroke={seg.color}
            strokeWidth="16"
            fill="none"
            strokeLinecap="butt"
            opacity={0.92}
          />
        ))}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--text)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill="var(--text)" />
        <text x={cx} y={cy - 14} textAnchor="middle" fontSize={size * 0.22} fontWeight="800" fill="var(--text)">
          {value == null ? '—' : Math.round(value)}
        </text>
        <text x={cx} y={cy + 34} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-faint)">
          {s.label}
        </text>
      </svg>
      <div className="badge" style={{ background: band.color, color: band.text }}>
        {band.name}
      </div>
      <style>{`
        .gauge { display:flex; flex-direction:column; align-items:center; gap:10px; }
      `}</style>
    </div>
  )
}
