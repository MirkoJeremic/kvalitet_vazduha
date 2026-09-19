# Kvalitet vazduha

Web aplikacija za prikaz kvaliteta vazduha za bilo koje mesto na svetu.
Korisnik unosi lokaciju (pretraga po imenu, klik na mapu ili „moja lokacija"),
a aplikacija prikazuje podatke **numerički, tabelarno i grafički**:

- trenutni indeks kvaliteta vazduha (US AQI i EU AQI) sa kategorijom i bojom,
- koncentracije šest zagađujućih materija (PM2.5, PM10, O₃, NO₂, SO₂, CO) sa
  odnosom prema smernicama Svetske zdravstvene organizacije,
- **istorija do 30 dana** unazad po satu — grafikon, statistika (min/prosek/maks)
  i tabela, sa izvozom u CSV,
- **prognoza** za narednih ~5 dana (dnevne kartice + grafikon po satu),
- **polen** u vazduhu po vrstama (za Evropu),
- **vremenski kontekst** (temperatura, vetar, vlažnost) uz objašnjenje kako
  meteorologija utiče na zagađenje,
- **ekvivalent cigareta** — koliko bi udisanje trenutnog vazduha tokom 24 h
  odgovaralo pušenju (procena iz PM2.5),
- **interaktivna mapa** (Leaflet + OpenStreetMap) sa obojenim krugovima za
  praćene gradove i klikom na proizvoljnu tačku,
- **rang-lista gradova** po trenutnom indeksu i **poređenje** do 4 grada uporedo,
- **zdravstvene preporuke** za opštu populaciju i osetljive grupe,
- svetla i tamna tema, deljiv link (URL pamti izabranu lokaciju).

## Izvor podataka

Sve preko besplatnog [Open-Meteo](https://open-meteo.com/) servisa — **bez
registracije i bez API ključa**, pozivi idu direktno iz pregledača:

| Namena | Endpoint |
| --- | --- |
| Kvalitet vazduha i polen | `air-quality-api.open-meteo.com/v1/air-quality` |
| Prognoza vremena | `api.open-meteo.com/v1/forecast` |
| Geokodiranje (ime → koordinate) | `geocoding-api.open-meteo.com/v1/search` |
| Obrnuto geokodiranje (koordinate → ime) | `api.bigdatacloud.net` (besplatno) |

Podaci potiču iz modela **CAMS** (Copernicus Atmosphere Monitoring Service).

## Tehnologije

- **React 19** + **Vite** (build alat, dev server)
- **Recharts** — grafikoni (učitava se naknadno, *code splitting*)
- **Leaflet** + **react-leaflet** — mapa (takođe naknadno učitavanje)
- čist **CSS** dizajn-sistem sa promenljivama (bez UI biblioteke), tema preko
  `data-theme` atributa

## Pokretanje lokalno

Potreban je Node.js 18+ (proveri sa `node -v`).

```bash
npm install      # jednom, skida biblioteke
npm run dev      # razvojni server -> http://localhost:5173
```

Za „pravu" verziju bez dev servera:

```bash
npm run build    # napravi folder dist/
npm run preview  # servira dist/ na http://localhost:4173
```

> Napomena: `index.html` se ne otvara duplim klikom — to je izvorni kod;
> mora `npm run dev` ili `npm run build`.

## Struktura projekta

```
src/
  main.jsx             – ulazna tačka
  App.jsx              – stanje aplikacije i raspored sekcija
  index.css            – kompletan dizajn (boje, tema, raspored)
  api/openMeteo.js     – svi mrežni pozivi, ograničavač navale, retry na 429
  lib/
    aqi.js             – standardi US/EU: kategorije, boje, dominantni zagađivač,
                         zdravstveni savet, ekvivalent cigareta
    pollutants.js      – metapodaci i granične vrednosti (SZO, EU)
    series.js          – obrada satnih nizova, statistika, dnevna agregacija, CSV
    format.js          – formatiranje brojeva i datuma (sr-Latn)
    cities.js          – lista praćenih gradova (rang-lista + mapa)
  components/
    Icon.jsx           – skup SVG ikonica (jedan stil za celu aplikaciju)
    Header.jsx         – gornja traka
    SearchBar.jsx      – pretraga + „moja lokacija"
    CurrentPanel.jsx   – merač indeksa + cigarete + vreme
    AqiGauge.jsx       – polukružni merač (SVG crtež)
    PollutantGrid.jsx  – kartice zagađivača
    HealthAdvice.jsx   – zdravstvene preporuke
    HistoryPanel.jsx   – istorija: grafikon + tabela + CSV
    ForecastPanel.jsx  – prognoza
    PollenPanel.jsx    – polen
    MapPanel.jsx       – mapa (Leaflet)
    Ranking.jsx        – rang-lista gradova
    CityCompare.jsx    – poređenje gradova
    Footer.jsx         – podnožje (izvori)
    common.jsx         – sitne deljene komponente (Kartica, Sekcija, Skeleton)
```

## Napomena

Prikazane vrednosti dolaze iz numeričkih modela i mogu odstupati od zvaničnih
mernih stanica. Aplikacija je informativnog karaktera.
