import { useSettings } from '../../hooks/useSettings.js';
import { IconLand, IconRooms } from '../Icons.jsx';

const MODES = [
  { key: 'land', stage: 1, token: 'stageLand', Icon: IconLand },
  { key: 'rooms', stage: 2, token: 'stageRooms', Icon: IconRooms },
];

export default function ModeSwitch({ mode, onChange }) {
  const { t } = useSettings();
  return (
    <div>
      <div className="section-title">{t('stage')}</div>
      <div className="mode-switch">
        {MODES.map(m => {
          const { Icon } = m;
          return (
            <button
              key={m.key}
              type="button"
              className={`mode-btn ${mode === m.key ? 'active' : ''}`}
              onClick={() => onChange(m.key)}
              title={t(m.token)}
              aria-label={t(m.token)}
              aria-pressed={mode === m.key}
            >
              <span className="mode-stage" aria-hidden="true">{m.stage}</span>
              <span className="mode-icon" aria-hidden="true">
                <Icon />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
