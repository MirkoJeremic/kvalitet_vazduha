import AqiGauge from './AqiGauge.jsx'
import Icon from './Icon.jsx'
import { STANDARDS, AQI_KEYS, dominantPollutant, cigaretteEquivalent } from '../lib/aqi.js'
import { POLLUTANTS } from '../lib/pollutants.js'
import { num, fmtDateTime } from '../lib/format.js'
import { weatherText, weatherIconName, windDir } from '../lib/series.js'

export default function CurrentPanel({ standard, current, currentTime, weather }) {
  const indexKey = AQI_KEYS[standard].index
  const value = current?.[indexKey]
  const dom = dominantPollutant(standard, current)
  const domMeta = dom ? POLLUTANTS[dom.pollutant] : null
  const cigs = cigaretteEquivalent(current?.pm2_5)

  return (
    <div className="card current-panel">
      <div className="cp-gauge">
        <AqiGauge standard={standard} value={value} size={230} />
        <div className="faint" style={{ fontSize: '0.76rem', textAlign: 'center' }}>
          Ažurirano: {currentTime ? fmtDateTime(currentTime) : '—'}
        </div>
      </div>

      <div className="cp-body">
        <div className="cp-facts">
          <Fact
            label="Dominantni zagađivač"
            value={domMeta ? domMeta.label : '—'}
            sub={domMeta ? domMeta.fullName : 'Diktira trenutni indeks'}
          />
          <Fact
            label="PM2.5 sada"
            value={`${num(current?.pm2_5, 1)} µg/m³`}
            sub={`SZO 24h smernica: ${num(POLLUTANTS.pm2_5.who24h, 0)} µg/m³`}
          />
          <Fact
            label="Drugi standard"
            value={
              standard === 'us'
                ? `EU ${num(current?.european_aqi, 0)}`
                : `US ${num(current?.us_aqi, 0)}`
            }
            sub={standard === 'us' ? STANDARDS.eu.fullName : STANDARDS.us.fullName}
          />
        </div>

        <div className="cp-cig">
          <Icon name="cigarette" size={20} className="cig-ico" />
          <div>
            <strong>
              ≈ {cigs == null ? '—' : num(cigs, cigs < 1 ? 2 : 1)}{' '}
              {cigs != null && Math.abs(cigs - 1) < 0.05 ? 'cigareta' : 'cigarete'} dnevno
            </strong>
            <div className="faint" style={{ fontSize: '0.78rem' }}>
              Toliko bi značilo udisanje ovog vazduha tokom 24 sata (procena iz PM2.5).
            </div>
          </div>
        </div>

        {weather && (
          <div className="cp-wx">
            <div className="wx-main">
              <Icon name={weatherIconName(weather.weather_code)} size={24} stroke={1.75} className="muted" />
              <span className="tnum" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                {num(weather.temperature_2m, 0)}°C
              </span>
              <span className="faint">{weatherText(weather.weather_code)}</span>
            </div>
            <div className="wx-grid">
              <span><Icon name="wind" size={15} /> Vetar {num(weather.wind_speed_10m, 0)} km/h {windDir(weather.wind_direction_10m)}</span>
              <span><Icon name="droplet" size={15} /> Vlažnost {num(weather.relative_humidity_2m, 0)}%</span>
              <span><Icon name="thermometer" size={15} /> Oseća se {num(weather.apparent_temperature, 0)}°C</span>
              <span><Icon name="umbrella" size={15} /> Padavine {num(weather.precipitation, 1)} mm</span>
            </div>
            <div className="faint wx-note">
              Vetar i padavine rasteruju i ispiraju zagađenje; tišina i temperaturna
              inverzija ga zadržavaju pri tlu.
            </div>
          </div>
        )}
      </div>

      <style>{`
        .current-panel {
          display:grid; grid-template-columns: 260px 1fr; gap:28px; align-items:start;
        }
        .cp-gauge { display:flex; flex-direction:column; align-items:center; gap:8px; }
        .cp-body { display:flex; flex-direction:column; gap:16px; }
        .cp-facts { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
        .cp-cig {
          display:flex; gap:12px; align-items:center;
          background:var(--surface-2); border:1px solid var(--border);
          border-radius:var(--radius-sm); padding:12px 14px;
        }
        .cig-ico { color:var(--text-faint); }
        .cp-wx { border-top:1px solid var(--border); padding-top:14px; display:flex; flex-direction:column; gap:8px; }
        .wx-main { display:flex; align-items:center; gap:10px; }
        .wx-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:6px 16px; font-size:0.84rem; color:var(--text-soft); }
        .wx-grid span { display:flex; align-items:center; gap:7px; }
        .wx-grid svg { color:var(--text-faint); }
        .wx-note { font-size:0.76rem; line-height:1.4; }
        @media (max-width: 780px){
          .current-panel { grid-template-columns: 1fr; }
          .cp-gauge { }
          .cp-facts { grid-template-columns: 1fr 1fr; }
          .wx-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

function Fact({ label, value, sub }) {
  return (
    <div>
      <div className="faint" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 2 }}>{value}</div>
      <div className="faint" style={{ fontSize: '0.74rem' }}>{sub}</div>
    </div>
  )
}
