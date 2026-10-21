import { useEffect } from 'react';
import Icon from './Icon.jsx';
import { useI18n } from '../../i18n/index.js';

/** Side panel (menu, cart, account). `side` = 'left' | 'right'. */
export default function Drawer({ open, onClose, side = 'right', title, children, footer, testid }) {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink/35 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid={testid}
        className={`absolute top-0 flex h-full w-[min(100%,26rem)] flex-col bg-white transition-[transform,visibility] duration-300 ease-out ${open ? 'visible shadow-2xl' : 'invisible'} ${
          side === 'left' ? `left-0 ${open ? 'translate-x-0' : '-translate-x-full'}` : `right-0 ${open ? 'translate-x-0' : 'translate-x-full'}`
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" aria-label={t('common.close')}>
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-5">{open && children}</div>
        {footer && open && <div className="border-t border-line px-5 py-4">{footer}</div>}
      </aside>
    </div>
  );
}
