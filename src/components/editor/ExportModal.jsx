import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Toggle from '../ui/Toggle.jsx';
import { renderStickerCanvas, canvasToBlob, downloadBlob, canShareFiles, shareBlob, copyImage, detectPlatform } from '../../lib/exportImage.js';
import { useI18n } from '../../i18n/index.js';

const BORDER = { width: 30, color: '#ffffff' };

/**
 * One button to use the sticker anywhere:
 *   phone   → Share: the system sheet opens straight into WhatsApp, Instagram, Telegram…
 *   desktop → Copy: paste it (Ctrl/Cmd + V) in any chat or app
 * plus a small "Download" link. What you see is exactly the file you get
 * (transparent PNG with a clean die-cut border).
 */
export default function ExportModal({ open, onClose, items, library }) {
  const { t } = useI18n();
  const { assetsById } = library;
  const [withBorder, setWithBorder] = useState(true);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const platform = useMemo(() => (typeof navigator !== 'undefined' ? detectPlatform() : 'desktop'), []);
  const border = withBorder ? BORDER : { width: 0 };
  const name = () => `imperia-sticker-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;

  // live preview = the real PNG
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setMessage('');
    setCopied(false);
    renderStickerCanvas(items, assetsById, { border, maxSide: 800 })
      .then((c) => alive && setPreview(c.toDataURL('image/png')))
      .catch(() => alive && setMessage(t('export.renderError')));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items, assetsById, withBorder]);

  const png = async () => canvasToBlob(await renderStickerCanvas(items, assetsById, { border, maxSide: 1024 }));
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
  // Copy: to the clipboard, ready to paste in any chat (transparency kept)
  const copy = () =>
    run(async () => {
      const blob = await png();
      try {
        await copyImage(blob);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // no image clipboard (old browsers): fall back to the share sheet
        if (canShareFiles()) await shareBlob(blob, name());
        else downloadBlob(blob, name());
      }
    });
  // Save: on phones the share sheet offers "Save image"; on computers it downloads
  const save = () =>
    run(async () => {
      const blob = await png();
      if (platform !== 'desktop' && canShareFiles()) await shareBlob(blob, name());
      else downloadBlob(blob, name());
    });

  return (
    <Modal open={open} onClose={onClose} title={t('export.title')} size="lg">
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* neutral surface: the file itself is transparent */}
        <div className="checker grid min-h-64 place-items-center rounded-3xl p-6">
          {preview ? (
            <img src={preview} alt={t('export.preview')} className="max-h-[46vh] w-auto max-w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.16)]" data-testid="sticker-preview" />
          ) : (
            <span className="text-sm text-muted">…</span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Toggle label={t('export.whiteBorder')} checked={withBorder} onChange={setWithBorder} />

          <p className="text-sm text-muted">{t('export.choose')}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" size="lg" className="justify-center whitespace-nowrap px-3" disabled={busy || !preview} onClick={copy} data-testid="sticker-copy">
              <Icon name={copied ? 'check' : 'copy'} /> {copied ? t('export.copied') : t('export.copy')}
            </Button>
            <Button variant="secondary" size="lg" className="justify-center whitespace-nowrap px-3" disabled={busy || !preview} onClick={save} data-testid="sticker-save">
              <Icon name="download" /> {t('export.save')}
            </Button>
          </div>
          {copied && <p className="-mt-2 text-center text-sm text-brand" data-testid="sticker-copied">{t('export.pasteHint')}</p>}
          <p className="text-xs text-muted">{t('export.socialHint')}</p>

          <p className="mt-auto rounded-2xl bg-cream px-3 py-2.5 text-xs leading-relaxed text-muted">
            <span className="font-bold text-ink">{t('export.tipTitle')}</span> {t('export.tip')}
          </p>
          {message && <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand-dark">{message}</p>}
        </div>
      </div>
    </Modal>
  );
}
