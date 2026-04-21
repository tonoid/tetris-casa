import { useSettings } from '../../hooks/useSettings.js';
import { IconGitHub } from '../Icons.jsx';

export default function TopBar({ mode }) {
  const { t } = useSettings();
  const isRooms = mode === 'rooms';
  return (
    <div className="topbar">
      <div className={`chip ${isRooms ? 'rooms' : ''}`}>
        <span className="dot" />
        <span>{isRooms ? t('chipRooms') : t('chipLand')}</span>
      </div>
      <div className="credits">
        TETRIS.CASA
        <br />
        BY{' '}
        <a
          className="lit"
          href="https://tonoid.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          TONOÏD
        </a>
        {' · '}
        <a
          className="gh-link"
          href="https://github.com/tonoid/tetris-casa"
          target="_blank"
          rel="noopener noreferrer"
          title="Source on GitHub"
          aria-label="Source on GitHub"
        >
          <IconGitHub />
        </a>
      </div>
    </div>
  );
}
