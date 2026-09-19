import { parseLocal } from './format.js'

export function buildRows(hourly) {
  if (!hourly?.time) return []
  const keys = Object.keys(hourly).filter((k) => k !== 'time')
  return hourly.time.map((iso, i) => {
    const row = { iso, t: parseLocal(iso), ts: parseLocal(iso).getTime() }
    for (const k of keys) row[k] = hourly[k]?.[i] ?? null
    return row
  })
}

export function nowIndex(rows) {
  const now = Date.now()
  let idx = rows.findIndex((r) => r.ts > now)
  if (idx === -1) idx = rows.length - 1
  return Math.max(0, idx - 1)
}

export function sliceRecent(rows, hours) {
  const end = nowIndex(rows) + 1
  const start = Math.max(0, end - hours)
  return rows.slice(start, end)
}

export function sliceFuture(rows) {
  return rows.slice(nowIndex(rows) + 1)
}

export function stats(rows, key) {
  const vals = rows.map((r) => r[key]).filter((v) => v != null && !Number.isNaN(v))
  if (!vals.length) return { min: null, max: null, avg: null, count: 0 }
  const sum = vals.reduce((a, b) => a + b, 0)
  return {
    min: Math.min(...vals),
    max: Math.max(...vals),
    avg: sum / vals.length,
    count: vals.length,
  }
}

export function dailyAggregate(rows, indexKey) {
  const byDay = new Map()
  for (const r of rows) {
    if (!r.t) continue
    const dayKey = r.t.toISOString().slice(0, 10)
    if (!byDay.has(dayKey)) byDay.set(dayKey, [])
    byDay.get(dayKey).push(r)
  }
  return [...byDay.entries()].map(([day, items]) => {
    const s = stats(items, indexKey)
    const pm = stats(items, 'pm2_5')
    return {
      day,
      date: new Date(day),
      avg: s.avg,
      max: s.max,
      pm25avg: pm.avg,
      hours: items.length,
    }
  })
}


const WMO = {
  0: ['Vedro', 'sun'],
  1: ['Pretežno vedro', 'cloud-sun'],
  2: ['Delimično oblačno', 'cloud-sun'],
  3: ['Oblačno', 'cloud'],
  45: ['Magla', 'cloud-fog'],
  48: ['Ledena magla', 'cloud-fog'],
  51: ['Slaba rosulja', 'cloud-drizzle'],
  53: ['Rosulja', 'cloud-drizzle'],
  55: ['Jaka rosulja', 'cloud-drizzle'],
  61: ['Slaba kiša', 'cloud-rain'],
  63: ['Kiša', 'cloud-rain'],
  65: ['Jaka kiša', 'cloud-rain'],
  71: ['Slab sneg', 'cloud-snow'],
  73: ['Sneg', 'cloud-snow'],
  75: ['Jak sneg', 'cloud-snow'],
  80: ['Pljuskovi', 'cloud-rain'],
  81: ['Jaki pljuskovi', 'cloud-rain'],
  82: ['Olujni pljuskovi', 'cloud-rain'],
  95: ['Grmljavina', 'cloud-lightning'],
  96: ['Grmljavina s gradom', 'cloud-lightning'],
  99: ['Jaka grmljavina s gradom', 'cloud-lightning'],
}

export function weatherText(code) {
  return WMO[code]?.[0] ?? 'Nepoznato'
}
export function weatherIconName(code) {
  return WMO[code]?.[1] ?? 'cloud'
}

export function windDir(deg) {
  if (deg == null) return ''
  const dirs = ['S', 'SI', 'I', 'JI', 'J', 'JZ', 'Z', 'SZ']
  return dirs[Math.round(deg / 45) % 8]
}

export function rowsToCsv(rows, columns) {
  const header = columns.map((c) => c.label).join(',')
  const lines = rows.map((r) =>
    columns
      .map((c) => {
        const v = c.get(r)
        if (v == null) return ''
        if (typeof v === 'string' && (v.includes(',') || v.includes('"')))
          return `"${v.replace(/"/g, '""')}"`
        return v
      })
      .join(','),
  )
  return [header, ...lines].join('\n')
}

export function downloadCsv(filename, csv) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
