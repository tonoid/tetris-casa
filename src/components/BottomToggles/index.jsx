import { LOCALES } from '../../i18n/strings.js';
import { useSettings } from '../../hooks/useSettings.js';

const UNIT_OPTIONS = [
  { code: 'meters', label: 'M²' },
  { code: 'feet', label: 'FT²' },
];

const VIEW_OPTIONS = [
  { code: '2d', label: '2D' },
  { code: 'iso', label: 'ISO' },
];

export default function BottomToggles() {
  const { locale, units, view, setLocale, setUnits, setView, rotateView, t } = useSettings();

  return (
    <div className="bottom-toggles">
      <div className="toggle-group">
        <div className="toggle-label">{t('lang')}</div>
        <div className="toggle-buttons">
          {LOCALES.map(l => (
            <button
              key={l.code}
              type="button"
              className={`lang-btn ${locale === l.code ? 'active' : ''}`}
              onClick={() => setLocale(l.code)}
              aria-pressed={locale === l.code}
              aria-label={l.label}
            >
              <span className="lang-code">{l.label}</span>
              <span
                className="lang-stripe"
                aria-hidden="true"
                style={{
                  background: `linear-gradient(to right, ${l.stripe[0]} 0 33%, ${l.stripe[1]} 33% 66%, ${l.stripe[2]} 66% 100%)`,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="toggle-group">
        <div className="toggle-label">{t('unit')}</div>
        <div className="toggle-buttons">
          {UNIT_OPTIONS.map(u => (
            <button
              key={u.code}
              type="button"
              className={`unit-btn ${units === u.code ? 'active' : ''}`}
              onClick={() => setUnits(u.code)}
              aria-pressed={units === u.code}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toggle-group">
        <div className="toggle-label">{t('view')}</div>
        <div className="toggle-buttons">
          {VIEW_OPTIONS.map(v => (
            <button
              key={v.code}
              type="button"
              className={`unit-btn ${view === v.code ? 'active' : ''}`}
              onClick={() => setView(v.code)}
              aria-pressed={view === v.code}
            >
              {v.label}
            </button>
          ))}
          {view === 'iso' && (
            <button
              type="button"
              className="unit-btn"
              onClick={rotateView}
              title={t('rotateView')}
              aria-label={t('rotateView')}
            >
              ↻
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
