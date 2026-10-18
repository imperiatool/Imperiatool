import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Swatches from '../ui/Swatches.jsx';
import {
  buildStickerSvg, renderStickerCanvas, canvasToBlob, downloadBlob, canShareFiles, shareBlob, makeWhatsAppSticker, detectPlatform,
} from '../../lib/exportImage.js';
import { useI18n } from '../../i18n/index.js';

const BORDERS = [
  { id: 'none', width: 0 },
  { id: 'thin', width: 16 },
  { id: 'thick', width: 32 },
];

/** Sticker download: what you see in the preview is exactly the file you get. */
export default function ExportModal({ open, onClose, items, library }) {
  const { t } = useI18n();
  const { assetsById, palette } = library;
  const [border, setBorder] = useState('thick');
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [wa, setWa] = useState(null);
  const platform = useMemo(() => (typeof navigator !== 'undefined' ? detectPlatform() : 'desktop'), []);
  const borderOpt = { width: BORDERS.find((b) => b.id === border).width, color: borderColor };
  const outlinePalette = useMemo(() => [{ id: 'white', name: t('export.white'), hex: '#ffffff' }, ...palette], [palette, t]);
  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  // live preview = the real PNG
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setWa(null);
    setMessage('');
    renderStickerCanvas(items, assetsById, { border: borderOpt, maxSide: 900 })
      .then((c) => alive && setPreview(c.toDataURL('image/png')))
      .catch(() => alive && setMessage(t('export.renderError')));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items, assetsById, border, borderColor]);

  const run = async (fn) => {
    setBusy(true);
    setMessage('');
    try {
      await fn();
    } catch (e) {
      if (e?.name !== 'AbortError') setMessage(t('export.failed'));
    } finally {
      setBusy(false);
    }
  };
  const png = async () => canvasToBlob(await renderStickerCanvas(items, assetsById, { border: borderOpt, maxSide: 2048 }));
  const prepareWa = () => run(async () => setWa(await makeWhatsAppSticker(items, assetsById, borderOpt)));
  const waName = () => `imperia-sticker-${stamp()}.${wa.format}`;
  const primary = platform === 'desktop' ? 'web' : platform;
  const steps = [primary, ...['web', 'ios', 'android'].filter((s) => s !== primary)];
  const waUrl = useMemo(() => (wa ? URL.createObjectURL(wa.blob) : ''), [wa]);

  return (
    <Modal open={open} onClose={onClose} title={t('export.title')} size="xl">
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* preview on a neutral surface: the file itself is transparent */}
        <div className="grid min-h-64 place-items-center rounded-3xl bg-[#efe9df] p-6">
          {preview ? (
            <img src={preview} alt={t('export.preview')} className="max-h-[46vh] w-auto max-w-full drop-shadow-[0_8px_14px_rgba(58,31,27,0.25)]" data-testid="sticker-preview" />
          ) : (
            <span className="text-sm text-muted">…</span>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('export.outline')}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {BORDERS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBorder(b.id)}
                  className={`rounded-xl border-2 px-2 py-2 text-sm font-bold ${border === b.id ? 'border-ink bg-ink text-cream' : 'border-line bg-white'}`}
                  data-testid={`border-${b.id}`}
                >
                  {t(`export.border.${b.id}`)}
                </button>
              ))}
            </div>
            {border !== 'none' && (
              <div className="mt-3">
                <p className="mb-1 text-xs font-medium text-muted">{t('export.outlineColor')}</p>
                <Swatches palette={outlinePalette} value={borderColor} onPick={setBorderColor} size="h-8 w-8" />
              </div>
            )}
          </div>

          <Button variant="primary" size="lg" className="w-full justify-center" disabled={busy || !preview} onClick={() => run(async () => downloadBlob(await png(), `imperia-sticker-${stamp()}.png`))} data-testid="download-png">
            <Icon name="download" /> {t('export.png')}
          </Button>
          {canShareFiles() && (
            <Button className="w-full justify-center" disabled={busy} onClick={() => run(async () => shareBlob(await png(), `imperia-sticker-${stamp()}.png`))}>
              <Icon name="share" /> {t('export.share')}
            </Button>
          )}

          {/* WhatsApp */}
          <div className="rounded-2xl border-2 border-[#25d366]/50 bg-[#25d366]/5 p-4" data-testid="wa-section">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#25d366] text-white"><Icon name="chat" className="h-4 w-4" /></span>
              {t('export.whatsappTitle')}
            </h3>
            <p className="mt-1 text-sm text-muted">{t('export.whatsappDesc')}</p>
            {!wa ? (
              <Button className="mt-3 w-full justify-center !bg-[#25d366] !text-white !shadow-[0_3px_0_0_#128c4b]" onClick={prepareWa} disabled={busy} data-testid="wa-prepare">
                <Icon name="chat" /> {t('export.whatsappPrepare')}
              </Button>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={waUrl} alt="" className="h-16 w-16 rounded-lg bg-[#efe9df]" />
                  <p className="text-xs font-semibold text-basil" data-testid="wa-ready">
                    {t('export.whatsappReady', { format: wa.format.toUpperCase(), size: Math.ceil(wa.bytes / 1024) })}
                  </p>
                </div>
                {wa.format !== 'webp' && <p className="text-xs text-muted">{t('export.pngFallback')}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => downloadBlob(wa.blob, waName())} data-testid="wa-save">
                    <Icon name="download" /> {t('export.whatsappSave')}
                  </Button>
                  {canShareFiles() && (
                    <Button onClick={() => run(() => shareBlob(wa.blob, waName()))}>
                      <Icon name="share" /> {t('export.whatsappShare')}
                    </Button>
                  )}
                </div>
                <div className="rounded-xl bg-white/70 p-3 text-sm">
                  <p className="mb-2 text-muted">{t('export.whatsappWhy')}</p>
                  <ol className="space-y-1.5">
                    {steps.map((s, i) => (
                      <li key={s} className={`flex gap-2 ${i === 0 ? 'font-semibold text-ink' : 'text-muted'}`}>
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink/10 text-[11px]">{i + 1}</span>
                        <span>{t(`export.steps.${s}`)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-muted hover:text-ink">{t('export.moreFormats')}</summary>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => {
                const { svg } = buildStickerSvg(items, assetsById, { outline: { enabled: borderOpt.width > 0, color: borderColor, width: borderOpt.width } });
                downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `imperia-sticker-${stamp()}.svg`);
              }}
            >
              <Icon name="download" /> {t('export.svg')}
            </Button>
          </details>
          {message && <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand-dark">{message}</p>}
        </div>
      </div>
    </Modal>
  );
}
