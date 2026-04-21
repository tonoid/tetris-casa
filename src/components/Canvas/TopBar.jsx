import { useSettings } from '../../hooks/useSettings.js';

export default function TopBar({ mode }) {
  const { t } = useSettings();
  const isRooms = mode === 'rooms';
  return (
    <div className="topbar">
      <div className={`chip ${isRooms ? 'rooms' : ''}`}>
        <span className="dot" />
        <span>{isRooms ? t('chipRooms') : t('chipLand')}</span>
      </div>
      <a
        className="credits"
        href="https://tonoid.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        TETRIS.CASA
        <br />
        BY <span className="lit">TONOÏD</span>
      </a>
    </div>
  );
}
