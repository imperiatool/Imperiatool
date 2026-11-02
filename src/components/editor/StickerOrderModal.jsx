import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { useStickerCollection, MAX_QTY, PER_SHEET, MIN_ORDER, PAPERS } from '../../store/useStickerCollection.js';
import { renderStickerCanvas, canvasToBlob, downloadBlob } from '../../lib/exportImage.js';
import { loadInEditor } from './StickerCollection.jsx';

const COLS = 3; // 3 × 4 = 12 stickers on a sheet

/** Every printed sticker in order: each design repeated by its quantity. */
export function layoutSheets(stickers) {
  const all = stickers.filter((s) => s.items.length).flatMap((s) => Array.from({ length: s.qty }, () => s));
  const sheets = [];
  for (let i = 0; i < all.length; i += PER_SHEET) sheets.push(all.slice(i, i + PER_SHEET));
  return sheets.length ? sheets : [[]];
}

/** One sheet as a print file: A4 proportions, 3 × 4 cells, transparent background. */
async function sheetPng(sheet, assetsById) {
  const W = 1654;
  const H = 2339; // A4 at 200 dpi
  const margin = 90;
  const cw = (W - margin * 2) / COLS;
  const ch = (H - margin * 2) / (PER_SHEET / COLS);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const cache = new Map();
  for (let i = 0; i < sheet.length; i++) {
    const s = sheet[i];
    if (!cache.has(s.id)) cache.set(s.id, await renderStickerCanvas(s.items, assetsById, { border: { width: 30, color: '#ffffff' }, maxSide: Math.min(cw, ch) * 0.86 }));
    const c = cache.get(s.id);
    const x = margin + (i % COLS) * cw + (cw - c.width) / 2;
    const y = margin + Math.floor(i / COLS) * ch + (ch - c.height) / 2;
    ctx.drawImage(c, x, y);
  }
  return canvasToBlob(canvas);
}

// how each paper finish is suggested in the preview (a look, not a specification)
const PAPER_STYLE = {
  raw: {
    background:
      "#faf7f0 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0.09 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
    sticker: 'drop-shadow(0 1px 1px rgba(0,0,0,0.12))',
  },
  aldente: {
    background: 'linear-gradient(125deg, #ffffff 0%, #f3f3f1 38%, #ffffff 52%, #f1f1ef 100%)',
    sticker: 'drop-shadow(0 1px 2px rgba(0,0,0,0.14))',
  },
  overcooked: {
    background: 'linear-gradient(160deg, #fbfaf8 0%, #f2f0ec 100%)',
    sticker: 'drop-shadow(0 3px 4px rgba(0,0,0,0.2)) drop-shadow(0 0 1px rgba(0,0,0,0.1))',
  },
};

/**
 * Review of the sticker collection before ordering: every design with its
 * quantity, the paper finish, the printed sheet (12 stickers per sheet, at
 * least 12 individual stickers), a summary and the order step. No printing
 * or delivery service is connected to this app yet, so the order button is
 * not active and says so plainly: no prices, delivery times, payment or
 * confirmation are made up. The sheet can be downloaded as a print file.
 */
export default function StickerOrderModal({ open, onClose, library }) {
  const { t, locale } = useI18n();
  const { stickers, setQty, remove, setEditing, paper, setPaper, fillTo } = useStickerCollection();
  const ready = stickers.filter((s) => s.items.length);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [page, setPage] = useState(0);
  const total = ready.reduce((n, s) => n + s.qty, 0);
  const sheets = useMemo(() => layoutSheets(stickers), [stickers]);
  const missing = Math.max(0, MIN_ORDER - total);
  const num = (n) => n.toLocaleString(locale);
  const sheet = sheets[Math.min(page, sheets.length - 1)];
  useEffect(() => {
    if (page > sheets.length - 1) setPage(sheets.length - 1);
  }, [page, sheets.length]);

  const edit = (s) => {
    loadInEditor(s.items);
    setEditing(s.id);
    onClose();
  };
  const download = async () => {
    setBusy(true);
    try {
      downloadBlob(await sheetPng(sheet, library.assetsById), `imperia-sticker-sheet-${page + 1}-of-${sheets.length}.png`);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } finally {
      setBusy(false);
    }
  };
  const style = PAPER_STYLE[paper] || PAPER_STYLE.aldente;

  return (
    <Modal open={open} onClose={onClose} title={t('order.stk.title')} size="xl">
      {!ready.length ? (
        <p className="py-8 text-center text-sm text-muted" data-testid="sticker-order-empty">
          {t('order.stk.empty')}
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px]" data-testid="sticker-order">
          {/* 1 · the designs and how many of each */}
          <div className="min-w-0">
            <p className="mb-2 text-[15px] font-bold uppercase text-brand">{t('order.stk.designsTitle')}</p>
            <ul className="space-y-2">
              {ready.map((s, n) => (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5" data-testid={`sticker-order-row-${n}`}>
                  <div className="checker grid h-14 w-14 shrink-0 place-items-center rounded-xl p-1">
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
                    <button type="button" onClick={() => setQty(s.id, s.qty - 1)} disabled={s.qty <= 1} className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-30" aria-label={t('order.stk.less')} data-testid={`sticker-order-less-${n}`}>
                      <Icon name="minus" className="h-4 w-4" />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold tabular-nums" data-testid={`sticker-order-qty-${n}`}>
                      {s.qty}
                    </span>
                    <button type="button" onClick={() => setQty(s.id, s.qty + 1)} disabled={s.qty >= MAX_QTY} className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-30" aria-label={t('order.stk.more')} data-testid={`sticker-order-more-${n}`}>
                      <Icon name="plus" className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* paper finish, named like the finishes of the other products */}
            <div className="mt-5" role="radiogroup" aria-label={t('order.stk.paper')}>
              <p className="mb-2 text-[15px] font-bold uppercase text-brand">{t('order.stk.paper')}</p>
              <div className="grid grid-cols-3 gap-2">
                {PAPERS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={paper === id}
                    onClick={() => setPaper(id)}
                    className={`rounded-xl border-2 p-2 text-left transition ${paper === id ? 'border-brand bg-brand/5' : 'border-line hover:border-ink/40'}`}
                    data-testid={`sticker-paper-${id}`}
                  >
                    <span className="block text-sm font-bold">{t(`order.materials.${id}.name`)}</span>
                    <span className="block text-[11px] leading-tight text-ink/70">{t(`order.stk.paper.${id}`)}</span>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-muted">{t('order.stk.paperNote')}</p>
            </div>
          </div>

          {/* 2 · the printed sheet */}
          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[15px] font-bold uppercase text-brand">{t('order.stk.sheetTitle')}</p>
              {sheets.length > 1 && (
                <div className="flex items-center gap-1 text-xs font-semibold tabular-nums">
                  <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="grid h-7 w-7 place-items-center rounded-full border border-line disabled:opacity-30" aria-label={t('order.stk.prevSheet')}>
                    <Icon name="arrowLeft" className="h-3.5 w-3.5" />
                  </button>
                  <span data-testid="sticker-sheet-page">{t('order.stk.sheetOf', { n: page + 1, total: sheets.length })}</span>
                  <button type="button" onClick={() => setPage((p) => Math.min(sheets.length - 1, p + 1))} disabled={page >= sheets.length - 1} className="grid h-7 w-7 place-items-center rounded-full border border-line disabled:opacity-30" aria-label={t('order.stk.nextSheet')}>
                    <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="relative mx-auto aspect-[210/297] w-full max-w-[340px] rounded-md border border-line p-[5%] shadow-[0_6px_24px_rgba(0,0,0,0.1)]" style={{ background: style.background }} data-testid="sticker-sheet">
              <span className="absolute left-2 top-1.5 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink" data-testid="sticker-sheet-paper">
                {t('order.stk.paperLabel', { name: t(`order.materials.${paper}.name`) })}
              </span>
              <div className="grid h-full grid-cols-3 grid-rows-4 gap-[4%]">
                {Array.from({ length: PER_SHEET }, (_, i) => {
                  const s = sheet[i];
                  return s ? (
                    <div key={i} className="grid min-h-0 place-items-center" data-testid="sheet-slot-filled">
                      <img src={s.thumb} alt="" className="max-h-full max-w-full object-contain" style={{ filter: style.sticker }} />
                    </div>
                  ) : (
                    <div key={i} className="grid min-h-0 place-items-center rounded-lg border-2 border-dashed border-ink/15 text-ink/30" data-testid="sheet-slot-empty">
                      <Icon name="plus" className="h-4 w-4" />
                    </div>
                  );
                })}
              </div>
            </div>
            {missing > 0 ? (
              <div className="mt-3 rounded-2xl border border-line p-3" data-testid="sticker-min">
                <p className="text-sm text-ink">{t('order.stk.minimum', { min: MIN_ORDER, n: total, missing })}</p>
                <Button size="sm" variant="secondary" className="mt-2" onClick={() => fillTo(MIN_ORDER)} data-testid="sticker-fill">
                  <Icon name="plus" /> {t('order.stk.fill', { missing })}
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-ink/70">{t('order.stk.minimumOk', { min: MIN_ORDER })}</p>
            )}
          </div>

          {/* 3 · summary and ordering */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-line p-4" data-testid="sticker-order-summary">
              <p className="text-[15px] font-bold uppercase text-brand">{t('order.stk.summary')}</p>
              <p className="mt-2 text-sm">
                <span className="font-semibold">{t('order.stk.designs')}:</span> {num(ready.length)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">{t('order.stk.total')}:</span> <span data-testid="sticker-order-total">{num(total)}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold">{t('order.stk.sheets')}:</span> <span data-testid="sticker-order-sheets">{num(total ? sheets.length : 0)}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold">{t('order.stk.paper')}:</span> {t(`order.materials.${paper}.name`)}
              </p>
            </div>

            {/* ordering: honest about what is not connected yet */}
            <div className="rounded-2xl border border-brand/40 bg-brand/5 p-4" data-testid="sticker-order-unavailable">
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <Icon name="help" className="h-4 w-4 shrink-0 text-brand" /> {t('order.stk.notReady')}
              </p>
              <p id="sticker-order-notice" className="mt-1.5 text-xs leading-relaxed text-ink">
                {t('order.stk.notice')}
              </p>
              <Button variant="primary" className="mt-3 w-full justify-center" disabled aria-describedby="sticker-order-notice" data-testid="sticker-order-cta">
                <Icon name="cart" /> {t('order.stk.cta')}
              </Button>
            </div>

            <div>
              <Button variant="secondary" className="w-full justify-center" onClick={download} disabled={busy || !sheet.length} data-testid="sticker-order-sheet">
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
