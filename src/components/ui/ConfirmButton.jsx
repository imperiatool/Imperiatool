import { useEffect, useState } from 'react';
import Button from './Button.jsx';
import { useI18n } from '../../i18n/index.js';

/** Two-step destructive button (no blocking browser dialogs). */
export default function ConfirmButton({ onConfirm, children, confirmLabel, ...props }) {
  const { t } = useI18n();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <Button
      variant="danger"
      {...props}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
      className={`${props.className || ''} ${armed ? '!bg-brand !text-white' : ''}`}
    >
      {armed ? confirmLabel || t('common.confirm') : children}
    </Button>
  );
}
