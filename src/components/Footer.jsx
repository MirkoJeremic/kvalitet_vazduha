export default function Footer() {
  return (
    <footer className="app-footer">
      <div>
        <strong>Izvori podataka</strong>
        <p className="faint">
          Kvalitet vazduha i polen:{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo Air Quality API
          </a>{' '}
          (model CAMS). Geokodiranje: Open-Meteo Geocoding i BigDataCloud. Mapa:{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
            OpenStreetMap
          </a>
          .
        </p>
      </div>
      <p className="faint">
        Prikazani podaci potiču iz numeričkih modela i mogu odstupati od zvaničnih
        mernih stanica. Aplikacija je informativnog karaktera i ne zamenjuje savet lekara.
      </p>
      <p className="faint">Izrađeno kao diplomski rad · {new Date().getFullYear()}.</p>
      <style>{`
        .app-footer {
          margin-top:40px; padding-top:20px; border-top:1px solid var(--border);
          display:flex; flex-direction:column; gap:8px; font-size:0.82rem;
        }
        .app-footer a { text-decoration:none; }
        .app-footer a:hover { text-decoration:underline; }
      `}</style>
    </footer>
  )
}
