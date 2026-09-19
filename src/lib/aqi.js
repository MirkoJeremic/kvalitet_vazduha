export const STANDARDS = {
  us: {
    id: 'us',
    label: 'US AQI',
    fullName: 'Indeks EPA (SAD), 0–500',
    max: 500,
    bands: [
      { min: 0, max: 50, name: 'Dobar', color: '#00b050', text: '#04371f' },
      { min: 51, max: 100, name: 'Umeren', color: '#ffd60a', text: '#4a3b00' },
      { min: 101, max: 150, name: 'Nezdrav za osetljive', color: '#ff8c00', text: '#4a2600' },
      { min: 151, max: 200, name: 'Nezdrav', color: '#e63946', text: '#450a0f' },
      { min: 201, max: 300, name: 'Veoma nezdrav', color: '#8b3a9e', text: '#2a0b32' },
      { min: 301, max: 500, name: 'Opasan', color: '#7a1128', text: '#ffdfe4' },
    ],
  },
  eu: {
    id: 'eu',
    label: 'EU AQI',
    fullName: 'Indeks EEA (Evropa), 0–100+',
    max: 120,
    bands: [
      { min: 0, max: 20, name: 'Dobar', color: '#009e73', text: '#04371f' },
      { min: 20, max: 40, name: 'Zadovoljavajući', color: '#84c318', text: '#26340a' },
      { min: 40, max: 60, name: 'Umeren', color: '#ffd60a', text: '#4a3b00' },
      { min: 60, max: 80, name: 'Loš', color: '#ff8c00', text: '#4a2600' },
      { min: 80, max: 100, name: 'Veoma loš', color: '#e63946', text: '#450a0f' },
      { min: 100, max: 120, name: 'Ekstremno loš', color: '#7a1128', text: '#ffdfe4' },
    ],
  },
}

const FALLBACK_BAND = { name: 'Nepoznato', color: '#94a3b8', text: '#0b1220' }

export function bandFor(standardId, value) {
  if (value == null || Number.isNaN(value)) return FALLBACK_BAND
  const s = STANDARDS[standardId] ?? STANDARDS.us
  const band = s.bands.find((b) => value <= b.max) ?? s.bands[s.bands.length - 1]
  return band
}

export function categoryName(standardId, value) {
  return bandFor(standardId, value).name
}

export function colorFor(standardId, value) {
  return bandFor(standardId, value).color
}

// Udeo skale [0..1] za polukružni merač.
export function scaleFraction(standardId, value) {
  if (value == null || Number.isNaN(value)) return 0
  const s = STANDARDS[standardId] ?? STANDARDS.us
  return Math.max(0, Math.min(1, value / s.max))
}

// Ključevi za trenutni indeks i pod indekse.
export const AQI_KEYS = {
  us: {
    index: 'us_aqi',
    parts: {
      pm2_5: 'us_aqi_pm2_5',
      pm10: 'us_aqi_pm10',
      ozone: 'us_aqi_ozone',
      nitrogen_dioxide: 'us_aqi_nitrogen_dioxide',
      sulphur_dioxide: 'us_aqi_sulphur_dioxide',
      carbon_monoxide: 'us_aqi_carbon_monoxide',
    },
  },
  eu: {
    index: 'european_aqi',
    parts: {
      pm2_5: 'european_aqi_pm2_5',
      pm10: 'european_aqi_pm10',
      ozone: 'european_aqi_ozone',
      nitrogen_dioxide: 'european_aqi_nitrogen_dioxide',
      sulphur_dioxide: 'european_aqi_sulphur_dioxide',
    },
  },
}

// Zagađivač koji trenutno "diktira" indeks (najveći pod-indeks).
export function dominantPollutant(standardId, currentObj) {
  const parts = AQI_KEYS[standardId]?.parts ?? {}
  let best = null
  for (const [pollutant, apiKey] of Object.entries(parts)) {
    const v = currentObj?.[apiKey]
    if (v == null || Number.isNaN(v)) continue
    if (!best || v > best.value) best = { pollutant, value: v }
  }
  return best
}

export function healthAdvice(standardId, value) {
  const usValue = standardId === 'eu' ? euToUsApprox(value) : value
  if (usValue == null) return null
  if (usValue <= 50)
    return {
      general:
        'Vazduh je čist — idealno vreme za trčanje, biciklizam ili duže zadržavanje napolju. Slobodno provetravajte stan tokom dana.',
      sensitive: 'Nema nikakvih ograničenja, čak ni za astmatičare, decu ili starije osobe.',
      tips: ['Idealno za sport napolju', 'Slobodno provetrite stan', 'Nema potrebe za maskom'],
    }
  if (usValue <= 100)
    return {
      general:
        'Kvalitet je prihvatljiv za skoro sve, ali izuzetno osetljive osobe mogu osetiti blagu nelagodu (nadražaj grla, suv kašalj) pri dužem naporu napolju.',
      sensitive:
        'Ako imate astmu, alergije ili respiratorne tegobe, skratite duže i naporne treninge na otvorenom i pratite kako se osećate.',
      tips: ['Sport napolju i dalje OK za većinu', 'Osetljivi: kraći trening', 'Provetravanje i dalje bezbedno'],
    }
  if (usValue <= 150)
    return {
      general:
        'Opšta populacija verovatno neće osetiti posledice, ali duži boravak napolju uz fizički napor (trčanje, biciklizam) može izazvati blagu nelagodu i kod zdravih osoba.',
      sensitive:
        'Deca, trudnice, stariji i osobe sa astmom, HOBP-om ili srčanim oboljenjima: skratite boravak napolju i izbegavajte naporne aktivnosti; ponesite inhalator ako ga koristite.',
      tips: ['Skratite intenzivan trening napolju', 'Osetljivi: ostanite u blizini doma', 'Provetravajte kraće, van špica saobraćaja'],
    }
  if (usValue <= 200)
    return {
      general:
        'Svako može osetiti posledice — nadražaj očiju, grla i disajnih puteva. Ograničite duže i naporne aktivnosti na otvorenom, posebno pored saobraćajnica.',
      sensitive:
        'Osetljive grupe: ostanite u zatvorenom, aktivnosti prebacite unutra i po mogućstvu koristite prečišćivač vazduha; pri simptomima (otežano disanje, stezanje u grudima) potražite lekarsku pomoć.',
      tips: ['Izbegavajte napor napolju', 'Zatvorite prozore u špicu', 'FFP2/N95 maska napolju za osetljive'],
    }
  if (usValue <= 300)
    return {
      general:
        'Zdravstveno upozorenje za celu populaciju — izbegavajte bilo kakvu fizičku aktivnost napolju i po mogućstvu ostanite u zatvorenom sa zatvorenim prozorima.',
      sensitive:
        'Osetljive grupe: ostanite u zatvorenom, koristite prečišćivač vazduha, uzimajte terapiju po uputstvu lekara i odmah potražite pomoć pri pojavi simptoma (otežano disanje, bol u grudima, vrtoglavica).',
      tips: ['Ostanite unutra', 'Prečišćivač vazduha ako imate', 'Maska (FFP2/N95) ako morate napolje'],
    }
  return {
    general:
      'Vanredni uslovi — cela populacija je u riziku. Ostanite u zatvorenom, zatvorite sve prozore i izbegavajte svaki nepotreban izlazak.',
    sensitive:
      'Osetljive grupe su u ozbiljnom riziku — hitno ograničite izloženost, konsultujte lekara i razmotrite privremeno napuštanje područja ako je moguće.',
    tips: ['Ne izlazite bez nužde', 'Zatvorite sve prozore', 'Hitna pomoć pri simptomima'],
  }
}

function euToUsApprox(euValue) {
  if (euValue == null) return null
  if (euValue <= 20) return euValue * 2.5
  if (euValue <= 40) return 50 + (euValue - 20) * 2.5
  if (euValue <= 60) return 100 + (euValue - 40) * 2.5
  if (euValue <= 80) return 150 + (euValue - 60) * 2.5
  if (euValue <= 100) return 200 + (euValue - 80) * 5
  return 300 + (euValue - 100) * 2
}

// Berkeley Earth pravilo 22 µg/m3 PM2.5 tokom 24 h = 1 cigareta.
export function cigaretteEquivalent(pm25) {
  if (pm25 == null || Number.isNaN(pm25)) return null
  return pm25 / 22
}
