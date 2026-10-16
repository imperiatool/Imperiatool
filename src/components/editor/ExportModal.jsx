import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Toggle from '../ui/Toggle.jsx';
import Slider from '../ui/Slider.jsx';
import Swatches from '../ui/Swatches.jsx';
import {
  buildStickerSvg, svgToPngBlob, downloadBlob, canShareFiles, shareBlob, makeWhatsAppSticker, detectPlatform,
} from '../../lib/exportImage.js';
import { CANVAS_SIZE } from '../../data/defaults.js';
import { useI18n } from '../../i18n/index.js';

const SIZES = [512, 1024, 2048];

export default function ExportModal({ open, onClose, items, library, background }) {
  const { t } = useI18n();
  const { assetsById, palette } = library;
  const [outline, setOutline] = useState(true);
  const [outlineColor, setOutlineColor] = useState('#ffffff');
  const [outlineWidth, setOutlineWidth] = useState(26);
  const [useBg, setUseBg] = useState(false);
  const [size, setSize] = useState(1024);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [wa, setWa] = useState(null); // { blob, format, bytes, url }
  const platform = useMemo(() => (typeof navigator !== 'undefined' ? detectPlatform() : 'desktop'), []);

  // reset the WhatsApp sticker when the design or the border changes
  useEffect(() => {
    setMessage('');
    setWa((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, [open, items, outline, outlineColor, outlineWidth]);

  const outlinePalette = useMemo(() => [{ id: 'white', name: t('export.white'), hex: '#ffffff' }, ...palette], [palette, t]);
  const outlineOpts = { enabled: outline, color: outlineColor, width: outlineWidth };

  const result = useMemo(
    () =>
      open
        ? buildStickerSvg(items, assetsById, {
            outline: { enabled: outline, color: outlineColor, width: outlineWidth },
            background: useBg ? background : null,
            canvasSize: CANVAS_SIZE,
          })
        : null,
    [open, items, assetsById, outline, outlineColor, outlineWidth, useBg, background],
  );
  const previewUrl = useMemo(() => (result ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}` : ''), [result]);
  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const png = () => svgToPngBlob(result.svg, result.width, result.height, size);

  const run = async (fn) => {
    setBusy(true);
    setMessage('');
    try {
      await fn();
    } catch (e) {
      if (e?.name !== 'AbortError') setMessage(e?.message === 'render' ? t('export.renderError') : t('export.failed'));
    } finally {
      setBusy(false);
    }
  };

  const prepareWa = () =>
    run(async () => {
      const res = await makeWhatsAppSticker(items, assetsById, outlineOpts);
      setWa({ ...res, url: URL.createObjectURL(res.blob) });
    });
  const waName = () => `imperia-sticker-${stamp()}.${wa.format}`;
  const primary = platform === 'desktop' ? 'web' : platform;
  const steps = [primary, ...['web', 'ios', 'android'].filter((s) => s !== primary)];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('export.title')}
      size="xl"
      footer={
        <>
          <span className="mr-auto self-center text-xs font-semibold uppercase tracking-wider text-muted">{t('export.files')}</span>
          <Button onClick={() => run(async () => downloadBlob(new Blob([result.svg], { type: 'image/svg+xml' }), `imperia-sticker-${stamp()}.svg`))} disabled={busy}>
            <Icon name="download" /> {t('export.svg')}
          </Button>
          {canShareFiles() && (
            <Button onClick={() => run(async () => shareBlob(await png(), `imperia-sticker-${stamp()}.png`))} disabled={busy}>
              <Icon name="share" /> {t('export.share')}
            </Button>
          )}
          <Button variant="primary" onClick={() => run(async () => downloadBlob(await png(), `imperia-sticker-${stamp()}.png`))} disabled={busy} data-testid="download-png">
            <Icon name="download" /> {t('export.png')}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="checker grid min-h-56 place-items-center rounded-2xl border border-line p-4">
            {previewUrl && <img src={previewUrl} alt={t('export.preview')} className="max-h-[34vh] w-auto max-w-full drop-shadow-lg" />}
          </div>

          {/* WhatsApp sticker */}
          <div className="rounded-2xl border-2 border-[#25d366]/50 bg-[#25d366]/5 p-4" data-testid="wa-section">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-48 flex-1">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#25d366] text-white"><Icon name="chat" className="h-4 w-4" /></span>
                  {t('export.whatsappTitle')}
                </h3>
                <p className="mt-1 text-sm text-muted">{t('export.whatsappDesc')}</p>
              </div>
              {wa ? (
                <div className="checker h-24 w-24 shrink-0 rounded-xl border border-line p-1">
                  <img src={wa.url} alt="" className="h-full w-full" />
                </div>
              ) : null}
            </div>

            {!wa ? (
              <Button className="mt-3 !bg-[#25d366] !text-white !shadow-[0_3px_0_0_#128c4b]" onClick={prepareWa} disabled={busy} data-testid="wa-prepare">
                <Icon name="chat" /> {t('export.whatsappPrepare')}
              </Button>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-xs font-semibold text-basil" data-testid="wa-ready">
                  {t('export.whatsappReady', { format: wa.format.toUpperCase(), size: Math.ceil(wa.bytes / 1024) })}
                </p>
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
        </div>

        <div className="space-y-4">
          <Toggle label={t('export.outline')} hint={t('export.outlineHint')} checked={outline} onChange={setOutline} />
          {outline && (
            <>
              <Slider label={t('export.outlineWidth')} value={outlineWidth} min={6} max={60} step={1} onChange={setOutlineWidth} />
              <div>
                <p className="mb-1 text-xs font-medium text-muted">{t('export.outlineColor')}</p>
                <Swatches palette={outlinePalette} value={outlineColor} onPick={setOutlineColor} size="h-7 w-7" />
              </div>
            </>
          )}
          <Toggle
            label={t('export.includeBg')}
            hint={background ? t('export.bgHint') : t('export.noBgHint')}
            checked={useBg && !!background}
            onChange={setUseBg}
          />
          <div>
            <p className="mb-1 text-xs font-medium text-muted">{t('export.resolution')}</p>
            <div className="flex gap-1.5">
              {SIZES.map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)} className={`rounded-lg border px-2.5 py-1 text-sm font-semibold ${s === size ? 'border-ink bg-ink text-cream' : 'border-line bg-paper'}`}>
                  {s}px
                </button>
              ))}
            </div>
          </div>
          {message && <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand-dark">{message}</p>}
        </div>
      </div>
    </Modal>
  );
}
