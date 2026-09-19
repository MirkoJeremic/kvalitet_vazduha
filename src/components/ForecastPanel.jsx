import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { AQI_KEYS, bandFor, colorFor } from '../lib/aqi.js'
import { num, fmtDay, fmtHourDay, fmtDateTime } from '../lib/format.js'
import { sliceFuture, dailyAggregate } from '../lib/series.js'

export default function ForecastPanel({ rows, standard }) {
  const indexKey = AQI_KEYS[standard].index
  const future = useMemo(() => sliceFuture(rows), [rows])
  const days = useMemo(() => dailyAggregate(future, indexKey).slice(0, 6), [future, indexKey])

  const chartData = useMemo(
    () =>
      future.map((r) => ({
        label: fmtHourDay(r.t),
        full: fmtDateTime(r.t),
        v: r[indexKey],
      })),
    [future, indexKey],
  )

  if (!future.length) return null

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>Prognoza</h3>
          <div className="card-sub">Predviđeni {standard === 'us' ? 'US' : 'EU'} AQI za naredne dane</div>
        </div>
      </div>

      <div className="fc-days">
        {days.map((d) => {
          const band = bandFor(standard, d.avg)
          return (
            <div key={d.day} className="fc-day">
              <div className="faint" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                {fmtDay(d.date)}
              </div>
              <div
                className="fc-dot"
                style={{ background: colorFor(standard, d.avg) }}
                title={band.name}
              />
              <div className="tnum" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {num(d.avg, 0)}
              </div>
              <div className="faint" style={{ fontSize: '0.72rem' }}>
                max {num(d.max, 0)}
              </div>
              <div className="faint" style={{ fontSize: '0.68rem' }}>{band.name}</div>
            </div>
          )
        })}
      </div>

      <div style={{ width: '100%', height: 240, marginTop: 8 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="fcFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" minTickGap={44} tickLine={false} axisLine={false} />
            <YAxis width={46} tickLine={false} axisLine={false} />
            <Tooltip content={<TipBox standard={standard} />} />
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#fcFill)"
              connectNulls
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .fc-days {
          display:grid; grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
          gap:10px; margin-bottom:16px;
        }
        .fc-day {
          display:flex; flex-direction:column; align-items:center; gap:3px;
          background:var(--surface-2); border:1px solid var(--border);
          border-radius:var(--radius-sm); padding:12px 8px; text-align:center;
        }
        .fc-dot { width:14px; height:14px; border-radius:50%; margin:2px 0; }
      `}</style>
    </div>
  )
}

function TipBox({ active, payload, standard }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  const band = bandFor(standard, p.value)
  return (
    <div className="chart-tip">
      <div className="tip-label">{p.payload.full}</div>
      <div className="tip-row">
        <span className="dot" style={{ background: band.color }} />
        <strong>{num(p.value, 0)}</strong>
        <span className="faint">{band.name}</span>
      </div>
    </div>
  )
}
