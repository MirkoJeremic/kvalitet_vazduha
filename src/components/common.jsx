import Icon from './Icon.jsx'

export function Section({ title, hint, children, id }) {
  return (
    <section className="reveal" id={id}>
      <div className="section-title">
        <h2>{title}</h2>
        {hint && <span className="hint">{hint}</span>}
      </div>
      {children}
    </section>
  )
}

export function Card({ title, sub, right, children, tight, className = '' }) {
  return (
    <div className={`card ${tight ? 'tight' : ''} ${className}`}>
      {(title || right) && (
        <div className="card-head">
          <div>
            {title && <h3>{title}</h3>}
            {sub && <div className="card-sub">{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Skeleton({ height = 120, style }) {
  return <div className="skeleton" style={{ height, width: '100%', ...style }} />
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div
      className="card"
      style={{ borderColor: 'var(--border-strong)', display: 'flex', gap: 12, alignItems: 'center' }}
    >
      <Icon name="triangle-alert" size={22} style={{ color: '#e63946' }} />
      <div style={{ flex: 1 }}>
        <strong>Podaci trenutno nisu dostupni</strong>
        <div className="muted" style={{ fontSize: '0.85rem' }}>
          {message}
        </div>
      </div>
      {onRetry && (
        <button className="btn" onClick={onRetry} type="button">
          Pokušaj ponovo
        </button>
      )}
    </div>
  )
}

export function Stat({ label, value, unit, sub }) {
  return (
    <div>
      <div className="faint" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div className="tnum" style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: 2 }}>
        {value}
        {unit && <span className="faint" style={{ fontSize: '0.8rem', fontWeight: 600 }}> {unit}</span>}
      </div>
      {sub && <div className="faint" style={{ fontSize: '0.78rem' }}>{sub}</div>}
    </div>
  )
}

export function Sparkline({ values, color = 'currentColor', width = 120, height = 34 }) {
  const clean = values.filter((v) => v != null && !Number.isNaN(v))
  if (clean.length < 2) return <svg width={width} height={height} aria-hidden="true" />
  const min = Math.min(...clean)
  const max = Math.max(...clean)
  const span = max - min || 1
  const step = width / (values.length - 1)
  let d = ''
  values.forEach((v, i) => {
    if (v == null || Number.isNaN(v)) return
    const x = i * step
    const y = height - 3 - ((v - min) / span) * (height - 6)
    d += `${d ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `
  })
  return (
    <svg width={width} height={height} aria-hidden="true" style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
