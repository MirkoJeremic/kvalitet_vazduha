import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { POLLUTANTS, POLLUTANT_ORDER, whoReference } from '../lib/pollutants.js'
import { AQI_KEYS } from '../lib/aqi.js'
import { num, fmtDay, fmtHourDay, fmtDateTime } from '../lib/format.js'
import { sliceRecent, stats, rowsToCsv, downloadCsv } from '../lib/series.js'
import { Segmented, Stat } from './common.jsx'
import Icon from './Icon.jsx'

const PERIODS = [
  { value: 24, label: '24 h' },
  { value: 24 * 7, label: '7 dana' },
  { value: 24 * 14, label: '14 dana' },
  { value: 24 * 30, label: '30 dana' },
]

export default function HistoryPanel({ rows, standard, place }) {
  const [hours, setHours] = useState(24 * 7)
  const [metric, setMetric] = useState('index')
  const [showTable, setShowTable] = useState(false)

  const indexKey = AQI_KEYS[standard].index
  const dataKey = metric === 'index' ? indexKey : metric
  const meta = metric === 'index' ? null : POLLUTANTS[metric]
  const unit = metric === 'index' ? (standard === 'us' ? 'US AQI' : 'EU AQI') : meta.unit
  const color = metric === 'index' ? 'var(--accent)' : meta.color
  const whoRef = metric === 'index' ? null : whoReference(metric)

  const slice = useMemo(() => sliceRecent(rows, hours), [rows, hours])
  const chartData = useMemo(
    () =>
      slice.map((r) => ({
        ts: r.ts,
        label: hours <= 48 ? fmtHourDay(r.t) : fmtDay(r.t),
        full: fmtDateTime(r.t),
        v: r[dataKey],
      })),
    [slice, dataKey, hours],
  )
  const st = useMemo(() => stats(slice, dataKey), [slice, dataKey])

  const metricOptions = [
    { value: 'index', label: 'Indeks' },
    ...POLLUTANT_ORDER.map((k) => ({ value: k, label: POLLUTANTS[k].label })),
  ]

  function exportCsv() {
    const cols = [
      { label: 'vreme', get: (r) => r.iso },
      ...POLLUTANT_ORDER.map((k) => ({ label: k, get: (r) => r[k] })),
      { label: 'us_aqi', get: (r) => r.us_aqi },
      { label: 'european_aqi', get: (r) => r.european_aqi },
    ]
    const csv = rowsToCsv(slice, cols)
    const safe = (place?.name || 'lokacija').replace(/[^\p{L}\d]+/gu, '_')
    downloadCsv(`kvalitet-vazduha_${safe}_${hours}h.csv`, csv)
  }

  return (
    <div className="card">
      <div className="card-head" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3>Istorija</h3>
          <div className="card-sub">
            Poslednjih {PERIODS.find((p) => p.value === hours)?.label} po satu
          </div>
        </div>
        <div className="row wrap" style={{ gap: 10 }}>
          <Segmented options={PERIODS} value={hours} onChange={setHours} ariaLabel="Period" />
        </div>
      </div>

      <div className="row wrap" style={{ gap: 10, marginBottom: 14 }}>
        <Segmented options={metricOptions} value={metric} onChange={setMetric} ariaLabel="Veličina" />
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" minTickGap={40} tickLine={false} axisLine={false} />
            <YAxis width={46} tickLine={false} axisLine={false} />
            <Tooltip content={<TipBox unit={unit} />} />
            {whoRef && (
              <ReferenceLine
                y={whoRef}
                stroke="#e63946"
                strokeDasharray="5 4"
                label={{ value: 'SZO', position: 'right', fill: '#e63946', fontSize: 11 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill="url(#histFill)"
              connectNulls
              isAnimationActive={false}
              dot={false}
              name={metric === 'index' ? 'Indeks' : meta.label}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="hist-stats">
        <Stat label="Minimum" value={num(st.min, 1)} unit={unit} />
        <Stat label="Prosek" value={num(st.avg, 1)} unit={unit} />
        <Stat label="Maksimum" value={num(st.max, 1)} unit={unit} />
        <Stat label="Merenja" value={num(st.count, 0)} sub="broj sati" />
      </div>

      <div className="row" style={{ marginTop: 14, gap: 10 }}>
        <button className="btn" onClick={() => setShowTable((v) => !v)} type="button">
          {showTable ? 'Sakrij tabelu' : 'Prikaži tabelu'}
        </button>
        <button className="btn" onClick={exportCsv} type="button">
          <Icon name="download" size={15} /> Izvezi CSV
        </button>
      </div>

      {showTable && (
        <div className="table-wrap" style={{ marginTop: 12, maxHeight: 360, overflowY: 'auto' }}>
          <table className="data">
            <thead>
              <tr>
                <th>Vreme</th>
                <th>PM2.5</th>
                <th>PM10</th>
                <th>O₃</th>
                <th>NO₂</th>
                <th>SO₂</th>
                <th>CO</th>
                <th>US AQI</th>
                <th>EU AQI</th>
              </tr>
            </thead>
            <tbody>
              {[...slice].reverse().map((r) => (
                <tr key={r.iso}>
                  <td>{fmtDateTime(r.t)}</td>
                  <td>{num(r.pm2_5, 1)}</td>
                  <td>{num(r.pm10, 1)}</td>
                  <td>{num(r.ozone, 0)}</td>
                  <td>{num(r.nitrogen_dioxide, 0)}</td>
                  <td>{num(r.sulphur_dioxide, 0)}</td>
                  <td>{num(r.carbon_monoxide, 0)}</td>
                  <td>{num(r.us_aqi, 0)}</td>
                  <td>{num(r.european_aqi, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .hist-stats {
          display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;
          margin-top:16px; padding-top:14px; border-top:1px solid var(--border);
        }
        @media (max-width:640px){ .hist-stats { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  )
}

function TipBox({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="chart-tip">
      <div className="tip-label">{p.payload.full || label}</div>
      <div className="tip-row">
        <span className="dot" style={{ background: p.color || p.stroke }} />
        <strong>{p.value == null ? '—' : num(p.value, 1)}</strong>
        <span className="faint">{unit}</span>
      </div>
    </div>
  )
}
