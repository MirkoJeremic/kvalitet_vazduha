import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { reverseGeocode } from '../api/openMeteo.js'
import { AQI_KEYS, bandFor, colorFor } from '../lib/aqi.js'
import { num } from '../lib/format.js'

export default function MapPanel({ place, onPick, presetData, standard }) {
  const [picking, setPicking] = useState(false)
  const indexKey = AQI_KEYS[standard].index
  const center = place ? [place.latitude, place.longitude] : [44.8, 20.46]

  async function handleClick(lat, lng) {
    setPicking(true)
    try {
      const p = await reverseGeocode(lat, lng)
      onPick(p)
    } finally {
      setPicking(false)
    }
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="card-head" style={{ padding: '16px 20px 0' }}>
        <div>
          <h3>Mapa</h3>
          <div className="card-sub">
            Kliknite bilo gde na mapi za kvalitet vazduha te tačke · krugovi = praćeni gradovi
          </div>
        </div>
        {picking && <span className="chip">Učitavam…</span>}
      </div>

      <div style={{ height: 420, margin: 16, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <MapContainer
          center={center}
          zoom={place ? 8 : 5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter center={center} zoom={place ? 8 : 5} />
          <ClickCatcher onClick={handleClick} />

          {(presetData ?? []).map(({ city, current }) => {
            const v = current?.[indexKey]
            const band = bandFor(standard, v)
            return (
              <CircleMarker
                key={city.name}
                center={[city.latitude, city.longitude]}
                radius={11}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  fillColor: colorFor(standard, v),
                  fillOpacity: 0.9,
                }}
                eventHandlers={{ click: () => onPick(city) }}
              >
                <Popup>
                  <strong>{city.name}</strong>
                  <br />
                  {standard === 'us' ? 'US' : 'EU'} AQI: <strong>{num(v, 0)}</strong> — {band.name}
                  <br />
                  PM2.5: {num(current?.pm2_5, 1)} µg/m³
                </Popup>
              </CircleMarker>
            )
          })}

          {place && (
            <CircleMarker
              center={[place.latitude, place.longitude]}
              radius={8}
              pathOptions={{ color: '#2563eb', weight: 3, fillColor: '#ffffff', fillOpacity: 1 }}
            >
              <Popup>
                <strong>{place.name}</strong>
                <br />
                Trenutno prikazana lokacija
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}

function ClickCatcher({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center[0], center[1], zoom]) 
  return null
}
