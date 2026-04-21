import { roomTemplates } from '../../constants/rooms.js';
import ArmedButton from '../ArmedButton.jsx';
import IconButton from './IconButton.jsx';
import NextPiece from './NextPiece.jsx';
import { useSettings } from '../../hooks/useSettings.js';
import { IconBroom, IconSelect, IconMove } from '../Icons.jsx';

const ROOM_TOOLS = [
  { key: 'select', token: 'toolSelectLabel', icon: IconSelect },
  { key: 'move', token: 'toolMoveLabel', icon: IconMove },
];

export default function RoomsPanel({ activeTemplate, ghostRotation, roomTool, actions }) {
  const { t, formatArea } = useSettings();

  const onPick = template => {
    if (activeTemplate === template) actions.clearTemplate();
    else actions.selectTemplate(template);
  };

  return (
    <div className="rooms-panel">
      <div className="section-title">{t('tool')}</div>
      <div className="icon-toolbar compact">
        {ROOM_TOOLS.map(tool => (
          <IconButton
            key={tool.key}
            icon={tool.icon}
            label={t(tool.token)}
            title={t(tool.token)}
            active={roomTool === tool.key && !activeTemplate}
            onClick={() => {
              actions.clearTemplate();
              actions.setRoomTool(tool.key);
            }}
          />
        ))}
      </div>

      <div className="section-title">{t('next')}</div>
      <NextPiece template={activeTemplate} rotation={ghostRotation} />

      <div className="section-title">{t('roomSet')}</div>
      <div className="rooms-list">
        {roomTemplates.map(tpl => (
          <button
            key={tpl.key}
            type="button"
            draggable
            className={`room-tile ${activeTemplate === tpl ? 'active' : ''}`}
            onClick={() => onPick(tpl)}
            onDragStart={e => {
              actions.selectTemplate(tpl);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', tpl.key);
              const img = document.createElement('canvas');
              img.width = 1;
              img.height = 1;
              e.dataTransfer.setDragImage(img, 0, 0);
            }}
          >
            <div
              className="swatch"
              style={{ background: tpl.color, boxShadow: `0 0 6px ${tpl.color}80` }}
            />
            <div className="name">{t(`rooms.${tpl.key}`)}</div>
            <div className="size">
              {tpl.w}×{tpl.h} · {formatArea(tpl.w * tpl.h)}
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <ArmedButton
          className="with-icon"
          label={t('wipeRooms')}
          onConfirm={actions.wipeRooms}
          icon={<IconBroom />}
        />
      </div>
    </div>
  );
}
