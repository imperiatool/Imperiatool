import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { useStickerCollection, MAX_QTY } from '../../store/useStickerCollection.js';
import { renderStickerCanvas, canvasToBlob, downloadBlob } from '../../lib/exportImage.js';
import { loadInEditor } from './StickerCollection.jsx';

/** One image with every design of the collection, die-cut border included (transparent PNG). */
async function stickerSheet(stickers, assetsById) {
  const cell = 520;
  const gap = 40;
  const cols = Math.min(4, stickers.length);
  const rows = Math.ceil(stickers.length / cols);
  const canvas = document.createElement('canvas');
  canvas.width = cols * cell + (cols + 1) * gap;
  canvas.height = rows * cell + (rows + 1) * gap;
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < stickers.length; i++) {
    const c = await renderStickerCanvas(stickers[i].items, assetsById, { border: { width: 30, color: '#ffffff' }, maxSide: cell });
    const x = gap + (i % cols) * (cell + gap) + (cell - c.width) / 2;
    const y = gap + Math.floor(i / cols) * (cell + gap) + (cell - c.height) / 2;
    ctx.drawImage(c, x, y);
  }
  return canvasToBlob(canvas);
}

/**
 * Review of the sticker collection before ordering: every design with its
 * quantity, a summary, and the order step. No printing or delivery service
 * is connected to this app yet, so the order button is not active and says
 * so plainly (no prices, delivery times or confirmations are made up). The
 * designs can still be downloaded as one sheet.
 */
export default function StickerOrderModal({ open, onClose, library }) {
  const { t, locale } = useI18n();
  const { stickers, setQty, remove, setEditing } = useStickerCollection();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const total = stickers.reduce((n, s) => n + s.qty, 0);
  const num = (n) => n.toLocaleString(locale);

  const edit = (s) => {
    loadInEditor(s.items);
    setEditing(s.id);
    onClose();
  };
  const sheet = async () => {
    setBusy(true);
    try {
      downloadBlob(await stickerSheet(stickers, library.assetsById), `imperia-stickers-${stickers.length}.png`);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('order.stk.title')} size="lg">
      {!stickers.length ? (
        <p className="py-8 text-center text-sm text-muted" data-testid="sticker-order-empty">
          {t('order.stk.empty')}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]" data-testid="sticker-order">
          <ul className="space-y-2">
            {stickers.map((s, n) => (
              <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5" data-testid={`sticker-order-row-${n}`}>
                <div className="checker grid h-16 w-16 shrink-0 place-items-center rounded-xl p-1">
                  <img src={s.thumb} alt={t('order.stk.sticker', { n: n + 1 })} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{t('order.stk.sticker', { n: n + 1 })}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <button type="button" onClick={() => edit(s)} className="font-medium underline underline-offset-4 hover:text-brand" data-testid={`sticker-order-edit-${n}`}>
                      {t('order.stk.edit')}
                    </button>
                    <button type="button" onClick={() => remove(s.id)} className="font-medium underline underline-offset-4 hover:text-brand" data-testid={`sticker-order-remove-${n}`}>
                      {t('order.stk.remove')}
                    </button>
                  </div>
                </div>
                <div className="flex items-center rounded-full border border-line" role="group" aria-label={t('order.stk.qty')}>
                  <button type="button" onClick={() => setQty(s.id, s.qty - 1)} disabled={s.qty <= 1} className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-30" aria-label={t('order.stk.less')}>
                    <Icon name="minus" className="h-4 w-4" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold tabular-nums" data-testid={`sticker-order-qty-${n}`}>
                    {s.qty}
                  </span>
                  <button type="button" onClick={() => setQty(s.id, s.qty + 1)} disabled={s.qty >= MAX_QTY} className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-30" aria-label={t('order.stk.more')}>
                    <Icon name="plus" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-line p-4" data-testid="sticker-order-summary">
              <p className="text-[15px] font-bold uppercase text-brand">{t('order.stk.summary')}</p>
              <p className="mt-2 text-sm">
                <span className="font-semibold">{t('order.stk.designs')}:</span> {num(stickers.length)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">{t('order.stk.total')}:</span> <span data-testid="sticker-order-total">{num(total)}</span>
              </p>
            </div>

            {/* ordering: honest about what is not connected yet */}
            <div className="rounded-2xl border border-brand/40 bg-brand/5 p-4" data-testid="sticker-order-unavailable">
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <Icon name="help" className="h-4 w-4 text-brand" /> {t('order.stk.notReady')}
              </p>
              <p id="sticker-order-notice" className="mt-1.5 text-xs leading-relaxed text-ink">
                {t('order.stk.notice')}
              </p>
              <Button variant="primary" className="mt-3 w-full justify-center" disabled aria-describedby="sticker-order-notice" data-testid="sticker-order-cta">
                <Icon name="cart" /> {t('order.stk.cta')}
              </Button>
            </div>

            <div>
              <Button variant="secondary" className="w-full justify-center" onClick={sheet} disabled={busy} data-testid="sticker-order-sheet">
                <Icon name={done ? 'check' : 'download'} /> {done ? t('order.stk.sheetDone') : t('order.stk.sheet')}
              </Button>
              <p className="mt-1.5 text-xs text-muted">{t('order.stk.sheetHint')}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
