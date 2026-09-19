import { Segmented } from './common.jsx'
import Icon from './Icon.jsx'

export default function Header({ standard, onStandard, theme, onTheme }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Icon name="gauge" size={20} stroke={2.25} />
        <span className="brand-name">Kvalitet&nbsp;vazduha</span>
      </div>

      <div className="topbar-controls">
        <Segmented
          ariaLabel="Standard indeksa"
          value={standard}
          onChange={onStandard}
          options={[
            { value: 'us', label: 'US AQI' },
            { value: 'eu', label: 'EU AQI' },
          ]}
        />
        <button
          className="icon-btn"
          onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Svetla tema' : 'Tamna tema'}
          aria-label={theme === 'dark' ? 'Svetla tema' : 'Tamna tema'}
          type="button"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
        </button>
      </div>

      <style>{`
        .topbar {
          display:flex; align-items:center; justify-content:space-between;
          gap:16px; flex-wrap:wrap;
          padding-bottom:16px; margin-bottom:22px;
          border-bottom:1px solid var(--border);
        }
        .brand { display:flex; align-items:center; gap:9px; color:var(--text); }
        .brand-name {
          font-size:1.02rem; font-weight:700; letter-spacing:-0.015em;
        }
        .topbar-controls { display:flex; align-items:center; gap:10px; }
      `}</style>
    </header>
  )
}
