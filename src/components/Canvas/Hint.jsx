import { useSettings } from '../../hooks/useSettings.js';

const LAND_ACTION = {
  add: 'hintPaint',
  remove: 'hintErase',
  move: 'hintMoveLand',
};

export default function Hint({ state }) {
  const { t } = useSettings();
  return (
    <div className="hint">
      <div className="hint-inner">{renderInner(state, t)}</div>
    </div>
  );
}

function renderInner(state, t) {
  if (state.mode === 'land') {
    return <span>► {t(LAND_ACTION[state.landTool])}</span>;
  }

  if (state.activeTemplate) {
    return (
      <>
        <span>
          ► {t('hintPlacing')} <strong>{t(`rooms.${state.activeTemplate.key}`)}</strong>
        </span>
        <span className="hint-divider" />
        <span>
          <kbd>CLICK</kbd> {t('hintDrop')}
        </span>
        <span>
          <kbd>R</kbd> {t('hintSpin')}
        </span>
        <span>
          <kbd>ESC</kbd> {t('hintBail')}
        </span>
      </>
    );
  }

  const selCount = state.selectedRoomIds.length;
  if (selCount > 0) {
    const label = selCount === 1 ? t('hintSelected') : `${selCount} ${t('hintSelected')}`;
    return (
      <>
        <span>
          ► <strong>{label}</strong> · {selCount === 1 ? t('hintDragEdge') : t('hintShiftClick')}
        </span>
        <span className="hint-divider" />
        <span>
          <kbd>DRAG</kbd> {t('hintMove')}
        </span>
        {selCount === 1 && (
          <span>
            <kbd>R</kbd> {t('hintSpin')}
          </span>
        )}
        <span>
          <kbd>DEL</kbd> {t('hintTrash')}
        </span>
      </>
    );
  }

  return (
    <>
      <span>► {t('hintPickRoom')}</span>
      <span className="hint-divider" />
      <span>
        <kbd>DRAG</kbd> {t('hintMove')}
      </span>
      <span>
        <kbd>SHIFT</kbd>+<kbd>CLICK</kbd> {t('hintShiftClick')}
      </span>
    </>
  );
}
