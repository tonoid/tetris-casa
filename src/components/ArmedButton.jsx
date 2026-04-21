import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../hooks/useSettings.js';

const ARM_DURATION = 2000;

export default function ArmedButton({ label, onConfirm, icon = null, className = '', ...rest }) {
  const { t } = useSettings();
  const [armed, setArmed] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = () => {
    if (!armed) {
      setArmed(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setArmed(false), ARM_DURATION);
      return;
    }
    clearTimeout(timerRef.current);
    setArmed(false);
    onConfirm();
  };

  return (
    <button
      {...rest}
      className={`btn danger btn-full ${armed ? 'armed' : ''} ${className}`.trim()}
      onClick={handleClick}
    >
      {icon && !armed && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      <span>{armed ? t('armedConfirm') : label}</span>
    </button>
  );
}
