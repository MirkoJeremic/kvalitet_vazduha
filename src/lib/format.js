const LOCALE = 'sr-Latn'

const nf0 = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 })

export function num(value, decimals = 1) {
  if (value == null || Number.isNaN(value)) return '—'
  if (decimals === 0) return nf0.format(value)
  if (decimals === 2) return nf2.format(value)
  return nf1.format(value)
}

const dtDay = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })
const dtDayLong = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const dtTime = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })
const dtHourDay = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
})

export function fmtDay(d) {
  return dtDay.format(toDate(d))
}
export function fmtDayLong(d) {
  return dtDayLong.format(toDate(d))
}
export function fmtTime(d) {
  return dtTime.format(toDate(d))
}
export function fmtHourDay(d) {
  return dtHourDay.format(toDate(d))
}
export function fmtDateTime(d) {
  const date = toDate(d)
  return `${dtDayLong.format(date)}, ${dtTime.format(date)}`
}

function toDate(d) {
  return d instanceof Date ? d : new Date(d)
}

export function parseLocal(isoNoTz) {
  if (!isoNoTz) return null
  return new Date(isoNoTz)
}
