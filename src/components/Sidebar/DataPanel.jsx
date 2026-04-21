import { useRef, useState } from 'react';
import { useSettings } from '../../hooks/useSettings.js';
import IconButton from './IconButton.jsx';
import { IconExport, IconImport } from '../Icons.jsx';

export default function DataPanel({ actions }) {
  const { t } = useSettings();
  const fileRef = useRef(null);
  const [error, setError] = useState(false);

  const onPickFile = () => {
    setError(false);
    fileRef.current?.click();
  };

  const onFileChange = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await actions.importPlan(file);
      setError(false);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  };

  return (
    <div>
      <div className="section-title">{t('data')}</div>
      <div className="icon-toolbar compact">
        <IconButton
          icon={IconExport}
          label={t('exportPlan')}
          title={t('exportPlan')}
          onClick={actions.exportPlan}
        />
        <IconButton
          icon={IconImport}
          label={error ? t('importError') : t('importPlan')}
          title={t('importPlan')}
          danger={error}
          onClick={onPickFile}
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={onFileChange}
      />
    </div>
  );
}
