import { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { drawRecipeCard, canvasToBlob, CARD_FORMATS } from '../../lib/recipeCard.js';
import { downloadBlob } from '../../lib/exportImage.js';

/** Copies text, with the old textarea route where the Clipboard API is missing. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

const slug = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'recipe';

/**
 * Shareable recipe card. Everything happens on the device: the card is drawn
 * on a canvas, the photo (only if the person adds it and keeps "include"
 * ticked) is read locally and never uploaded. Share opens the device's own
 * share menu; where that is missing, the image is downloaded and the caption
 * copied instead. Nothing is ever published on anyone's behalf.
 *
 * @param card  the recipe data (see drawRecipeCard) without name/photo
 * @param defaultName  the name proposed for the card
 * @param caption (name) => the suggested caption, in the app language
 */
export default function RecipeCard({ open, onClose, card, defaultName, caption, initialPhoto }) {
  const { t } = useI18n();
  const [format, setFormat] = useState('square');
  const [name, setName] = useState(defaultName);
  const [photo, setPhoto] = useState(null); // { url, own } own = object URL made here
  const [include, setInclude] = useState(true);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(''); // copied | downloaded | shared | fallback | failed
  const input = useRef(null);
  const canvasRef = useRef(null);

  // fresh name each time the card is opened for a different dish
  useEffect(() => {
    if (open) {
      setName(defaultName);
      setStatus('');
    }
  }, [open, defaultName]);
  // a photo already chosen under "Share your plate" is offered, not forced
  useEffect(() => {
    if (open && initialPhoto && !photo) setPhoto({ url: initialPhoto, own: false });
  }, [open, initialPhoto]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => photo?.own && URL.revokeObjectURL(photo.url), [photo]);

  const finalName = name.trim() || defaultName;
  const text = caption(finalName);

  // redraw the preview when anything on the card changes (typing is debounced)
  useEffect(() => {
    if (!open) return undefined;
    let alive = true;
    setBusy(true);
    const id = setTimeout(async () => {
      try {
        const canvas = await drawRecipeCard(format, { ...card, name: finalName, photo: include ? photo?.url : null });
        if (!alive) return;
        canvasRef.current = canvas;
        setPreview(canvas.toDataURL('image/png'));
      } catch {
        if (alive) setStatus('failed');
      } finally {
        if (alive) setBusy(false);
      }
    }, 180);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [open, format, finalName, include, photo, card]);

  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !f.type.startsWith('image/')) return;
    setPhoto({ url: URL.createObjectURL(f), own: true });
    setInclude(true);
  };

  const fileName = `imperia-recipe-club-${slug(finalName)}-${format}.png`;
  const blob = async () => (canvasRef.current ? canvasToBlob(canvasRef.current) : null);

  const download = async () => {
    const b = await blob();
    if (!b) return setStatus('failed');
    downloadBlob(b, fileName);
    setStatus('downloaded');
  };
  const copy = async () => setStatus((await copyText(text)) ? 'copied' : 'failed');
  const share = async () => {
    const b = await blob();
    if (!b) return setStatus('failed');
    const file = new File([b], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        // some apps drop the text: the caption is also put on the clipboard
        await copyText(text);
        await navigator.share({ files: [file], text, title: finalName });
        setStatus('shared');
      } catch (e) {
        setStatus(e?.name === 'AbortError' ? '' : 'failed');
      }
      return;
    }
    // no file sharing here (most computers): save the image and copy the caption
    downloadBlob(b, fileName);
    const ok = await copyText(text);
    setStatus(ok ? 'fallback' : 'downloaded');
  };

  const { w, h } = CARD_FORMATS[format];
  return (
    <Modal open={open} onClose={onClose} title={t('recipe.card.title')} size="xl">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-testid="recipe-card">
        {/* preview */}
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('recipe.card.preview')}</p>
          <div className="relative mx-auto w-full overflow-hidden rounded-2xl border border-line bg-white shadow-[0_6px_24px_rgba(0,0,0,0.08)]" style={{ aspectRatio: `${w} / ${h}`, maxWidth: format === 'story' ? 340 : 520 }}>
            {preview && <img src={preview} alt={finalName} className="h-full w-full object-contain" data-testid="recipe-card-preview" />}
            {busy && <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] text-muted">{t('recipe.card.drawing')}</span>}
          </div>
        </div>

        {/* settings and actions */}
        <div className="min-w-0 space-y-5">
          <p className="text-sm text-ink">{t('recipe.card.intro')}</p>

          <div role="radiogroup" aria-label={t('recipe.card.format')}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('recipe.card.format')}</p>
            <div className="flex flex-wrap gap-1.5">
              {['square', 'story'].map((f) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={format === f}
                  onClick={() => setFormat(f)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${format === f ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/40'}`}
                  data-testid={`recipe-card-${f}`}
                >
                  {t(`recipe.card.${f}`)}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">{t('recipe.card.name')}</span>
            <input
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-ink"
              data-testid="recipe-card-name"
            />
          </label>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('recipe.card.photo')}</p>
            <input ref={input} type="file" accept="image/*" className="sr-only" onChange={pick} data-testid="recipe-card-photo-input" />
            {!photo ? (
              <Button size="sm" variant="secondary" onClick={() => input.current?.click()} data-testid="recipe-card-photo-pick">
                <Icon name="upload" /> {t('recipe.card.addPhoto')}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <img src={photo.url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 space-y-1.5">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={include} onChange={(e) => setInclude(e.target.checked)} className="h-4 w-4 accent-[#e1201b]" data-testid="recipe-card-include" />
                    {t('recipe.card.include')}
                  </label>
                  <button type="button" onClick={() => setPhoto(null)} className="text-xs font-medium underline underline-offset-4">
                    {t('recipe.card.removePhoto')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('recipe.card.caption')}</p>
            <p className="whitespace-pre-line rounded-xl border border-line p-3 text-sm" data-testid="recipe-card-caption">
              {text}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={share} disabled={!preview} data-testid="recipe-card-share">
              <Icon name="share" /> {t('recipe.card.share')}
            </Button>
            <Button variant="secondary" onClick={download} disabled={!preview} data-testid="recipe-card-download">
              <Icon name="download" /> {t('recipe.card.download')}
            </Button>
            <Button variant="secondary" onClick={copy} data-testid="recipe-card-copy">
              <Icon name="copy" /> {t('recipe.card.copy')}
            </Button>
          </div>
          {status && (
            <p role="status" className={`text-sm ${status === 'failed' ? 'text-brand' : 'text-ink'}`} data-testid="recipe-card-status">
              {t(`recipe.card.${status}`)}
            </p>
          )}
          <p className="flex gap-1.5 text-xs text-muted">
            <Icon name="lock" className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t('recipe.card.note')}
          </p>
        </div>
      </div>
    </Modal>
  );
}
