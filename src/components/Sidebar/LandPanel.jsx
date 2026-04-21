import ArmedButton from '../ArmedButton.jsx';
import IconButton from './IconButton.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import {
  IconPaint,
  IconErase,
  IconMove,
  IconTrash,
} from '../Icons.jsx';

const TOOLS = [
  { key: 'add', token: 'toolPaintLabel', icon: IconPaint },
  { key: 'remove', token: 'toolEraseLabel', icon: IconErase },
  { key: 'move', token: 'toolMoveLabel', icon: IconMove },
];

export default function LandPanel({ landTool, actions }) {
  const { t } = useSettings();
  return (
    <div>
      <div className="section-title">{t('plot')}</div>
      <div className="icon-toolbar">
        {TOOLS.map(tool => (
          <IconButton
            key={tool.key}
            icon={tool.icon}
            label={t(tool.token)}
            title={t(tool.token)}
            active={landTool === tool.key}
            onClick={() => actions.setLandTool(tool.key)}
          />
        ))}
      </div>
      <ArmedButton
        className="with-icon"
        label={t('clearPlot')}
        onConfirm={actions.clearAll}
        icon={<IconTrash />}
      />
    </div>
  );
}
