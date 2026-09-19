export const POLLUTANTS = {
  pm2_5: {
    key: 'pm2_5',
    label: 'PM2.5',
    fullName: 'Suspendovane čestice < 2,5 µm',
    unit: 'µg/m³',
    who24h: 15,
    whoYear: 5,
    euYear: 25,
    color: '#ef4444',
    about:
      'Sitne čestice koje prodiru duboko u pluća i u krvotok. Nastaju sagorevanjem — saobraćaj, individualna ložišta, termoelektrane. Najštetniji pokazatelj za zdravlje.',
  },
  pm10: {
    key: 'pm10',
    label: 'PM10',
    fullName: 'Suspendovane čestice < 10 µm',
    unit: 'µg/m³',
    who24h: 45,
    whoYear: 15,
    euYear: 40,
    color: '#f97316',
    about:
      'Krupnije čestice — prašina, polen, čađ, resuspendovani materijal sa puteva. Nadražuju disajne puteve i oči.',
  },
  ozone: {
    key: 'ozone',
    label: 'O₃',
    fullName: 'Prizemni ozon',
    unit: 'µg/m³',
    who8h: 100,
    euInfo: 180,
    color: '#3b82f6',
    about:
      'Ne emituje se direktno — nastaje na suncu iz izduvnih gasova i isparljivih jedinjenja. Najviši je u toplim popodnevnim satima leti.',
  },
  nitrogen_dioxide: {
    key: 'nitrogen_dioxide',
    label: 'NO₂',
    fullName: 'Azot-dioksid',
    unit: 'µg/m³',
    who24h: 25,
    whoYear: 10,
    euYear: 40,
    color: '#a855f7',
    about:
      'Marker saobraćaja, posebno dizel motora. Pogoršava astmu i smanjuje plućnu funkciju kod dece.',
  },
  sulphur_dioxide: {
    key: 'sulphur_dioxide',
    label: 'SO₂',
    fullName: 'Sumpor-dioksid',
    unit: 'µg/m³',
    who24h: 40,
    euDay: 125,
    color: '#eab308',
    about:
      'Potiče od sagorevanja uglja i mazuta (termoelektrane, teška industrija). Nadražuje disajne puteve, doprinosi kiselim kišama.',
  },
  carbon_monoxide: {
    key: 'carbon_monoxide',
    label: 'CO',
    fullName: 'Ugljen-monoksid',
    unit: 'µg/m³',
    who24h: 4000,
    color: '#64748b',
    about:
      'Gas bez boje i mirisa iz nepotpunog sagorevanja. Smanjuje sposobnost krvi da prenosi kiseonik.',
  },
}

export const POLLUTANT_ORDER = [
  'pm2_5',
  'pm10',
  'ozone',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'carbon_monoxide',
]

export function whoReference(key) {
  const p = POLLUTANTS[key]
  if (!p) return null
  return p.who24h ?? p.who8h ?? p.whoYear ?? null
}
