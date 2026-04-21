import { useSettings } from '../../hooks/useSettings.js';

export default function Logo() {
  const { t } = useSettings();
  return (
    <div className="logo">
      <div className="logo-mark" aria-hidden="true">
        <span className="cell i" />
        <span className="cell i" />
        <span className="cell i" />
        <span className="cell i" />
      </div>
      <h1>
        TETRIS<span className="dot">.</span>
        <br />
        CASA
      </h1>
      <div className="subtitle">{t('subtitle')}</div>
    </div>
  );
}
