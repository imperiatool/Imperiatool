import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Toggle from '../ui/Toggle.jsx';
import { renderStickerCanvas, canvasToBlob, downloadBlob, canShareFiles, shareBlob, copyImage, detectPlatform } from '../../lib/exportImage.js';
import { useI18n } from '../../i18n/index.js';
import SpecList from '../order/SpecList.jsx';

const BORDER = { width: 30, color: '#ffffff' };

/**
 * One button to use the sticker anywhere:
 *   phone   → Share: the system sheet opens straight into WhatsApp, Instagram, Telegram…
 *   desktop → Copy: paste it (Ctrl/Cmd + V) in any chat or app
 * plus a small "Download" link. What you see is exactly the file you get
 * (transparent PNG with a clean die-cut border).
 */
export default function ExportModal({ open, onClose, items, library }) {
  const { t, label } = useI18n();
  const { assetsById, palette, categories } = library;
  const [withBorder, setWithBorder] = useState(true);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [webpSaved, setWebpSaved] = useState(false);
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

  // product specifications: the parts actually chosen, each with its shape
  // and its main colour (the one of its first coloured zone)
  const partOf = (catId) => {
    const it = items.find((i) => i.categoryId === catId && !i.hidden && assetsById[i.assetId]);
    if (!it) return '';
    const a = assetsById[it.assetId];
    const slot = a.slots.find((sl) => sl.kind === 'fill') || a.slots[0];
    const hex = (slot && (it.colors[slot.id] || slot.original)) || '';
    const colour = label(palette.find((c) => c.hex.toLowerCase() === hex.toLowerCase()));
    return colour ? `${label(a)} · ${colour}` : label(a);
  };
  const catIds = categories.map((c) => c.id);
  const specs = [
    ['spec.product', 'Imperia® Sticker'],
    ['spec.body', catIds.includes('cat-corpi') ? partOf('cat-corpi') : ''],
    ['spec.eyes', catIds.includes('cat-occhi') ? partOf('cat-occhi') : ''],
    ['spec.mouth', catIds.includes('cat-bocche') ? partOf('cat-bocche') : ''],
    ['spec.outline', withBorder ? t('spec.outline.white') : t('spec.outline.none')],
    ['spec.file', t('spec.file.png')],
  ];

  // WhatsApp on a computer sends a pasted image as a photo (JPEG: the
  // transparent background turns white). A 512 × 512 WebP file, the format
  // WhatsApp uses for stickers, keeps the transparency when dragged into a chat.
  const webpSticker = () =>
    run(async () => {
      const art = await renderStickerCanvas(items, assetsById, { border, maxSide: 480 });
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      c.getContext('2d').drawImage(art, (512 - art.width) / 2, (512 - art.height) / 2);
      let blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.9));
      if (!blob || blob.type !== 'image/webp') blob = await canvasToBlob(c); // no WebP encoder: transparent PNG
      downloadBlob(blob, name().replace(/\.png$/, blob.type === 'image/webp' ? '-whatsapp.webp' : '-512.png'));
      setWebpSaved(true);
      setTimeout(() => setWebpSaved(false), 2500);
    });

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
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });

  return (
    <Modal open={open} onClose={onClose} title={t('export.title')} size="lg">
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* neutral surface: the file itself is transparent */}
        <div className="checker grid min-h-64 place-items-center rounded-3xl p-6">
          {preview ? (
            <img src={preview} alt={t('export.preview')} className="sticker-breeze max-h-[46vh] w-auto max-w-full" data-testid="sticker-preview" />
          ) : (
            <span className="text-sm text-muted">…</span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <SpecList testid="sticker-specs" rows={specs} />
          <Toggle label={t('export.whiteBorder')} checked={withBorder} onChange={setWithBorder} />

          <p className="text-sm text-muted">{t('export.choose')}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" size="lg" className="justify-center whitespace-nowrap px-3" disabled={busy || !preview} onClick={copy} data-testid="sticker-copy">
              <Icon name={copied ? 'check' : 'copy'} /> {copied ? t('export.copied') : t('export.copy')}
            </Button>
            <Button variant="secondary" size="lg" className="justify-center whitespace-nowrap px-3" disabled={busy || !preview} onClick={save} data-testid="sticker-save">
              <Icon name={saved ? 'check' : 'download'} /> {saved ? t('export.saved') : t('export.save')}
            </Button>
          </div>
          {copied && <p className="-mt-2 text-center text-sm text-brand" data-testid="sticker-copied">{t('export.pasteHint')}</p>}
          {platform === 'desktop' && (
            <div className="rounded-2xl border border-line p-3" data-testid="sticker-desktop">
              <p className="text-xs leading-relaxed text-ink">{t('export.desktopNote')}</p>
              <Button variant="secondary" size="sm" className="mt-2 w-full justify-center" disabled={busy || !preview} onClick={webpSticker} data-testid="sticker-webp">
                <Icon name={webpSaved ? 'check' : 'download'} /> {webpSaved ? t('export.saved') : t('export.webp')}
              </Button>
            </div>
          )}
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
