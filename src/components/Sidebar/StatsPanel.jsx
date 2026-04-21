import { useSettings } from '../../hooks/useSettings.js';
import { padArea } from '../../lib/units.js';

function pad(n) {
  return String(n).padStart(3, '0');
}

export default function StatsPanel({ stats }) {
  const { t, units } = useSettings();
  return (
    <div className="stats">
      <div className="stats-badge">★ {t('score')} ★</div>
      <div className="stat-row hero">
        <span className="label">{t('statPlot')}</span>
        <span className="value">{padArea(stats.land, units)}</span>
      </div>
      <div className="stat-row">
        <span className="label">{t('statUsed')}</span>
        <span className="value">{padArea(stats.used, units)}</span>
      </div>
      <div className="stat-row">
        <span className="label">{t('statLeft')}</span>
        <span className="value">{padArea(stats.remaining, units)}</span>
      </div>
      <div className="stat-row">
        <span className="label">{t('statFill')}</span>
        <span className="value">{pad(stats.coverage)} %</span>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${stats.coverage}%` }} />
      </div>
    </div>
  );
}
