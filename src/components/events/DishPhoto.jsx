import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { canShareFiles, downloadBlob } from '../../lib/exportImage.js';

/**
 * "Cooked it? Share your plate": take or choose a photo on the device, see it
 * here, then share it only when the person presses Share (the phone's own
 * share menu, where they choose the app). Nothing is uploaded by Imperia.
 * Without file sharing (most computers) the photo can be saved instead.
 */
export default function DishPhoto({ dish, onPhoto }) {
  const { t } = useI18n();
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState(''); // '' | 'shared' | 'saved' | 'failed'

  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  // the recipe card can offer the same photo (still only if the person includes it)
  useEffect(() => onPhoto?.(url), [url]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return; // cancelled
    if (!f.type.startsWith('image/')) return setStatus('failed');
    setFile(f);
    setUrl(URL.createObjectURL(f));
    setStatus('');
  };
  const remove = () => {
    setFile(null);
    setUrl('');
    setStatus('');
  };
  const share = async () => {
    try {
      await navigator.share({ files: [file], text: t('recipe.photo.caption', { dish }) });
      setStatus('shared');
    } catch (e) {
      // closing the share menu is not an error
      setStatus(e?.name === 'AbortError' ? '' : 'failed');
    }
  };
  const save = () => {
    downloadBlob(file, `imperia-${dish.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${(file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')}`);
    setStatus('saved');
  };
  const shareable = file && canShareFiles();

  return (
    <div className="mt-5 rounded-xl bg-cream p-3" data-testid="dish-photo">
      <p className="text-sm font-bold">{t('recipe.photo.title')}</p>
      <p className="mt-0.5 text-xs text-ink/80">{t('recipe.photo.text')}</p>
      <input ref={input} type="file" accept="image/*" className="sr-only" onChange={pick} data-testid="dish-photo-input" />
      {!file ? (
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => input.current?.click()} data-testid="dish-photo-pick">
          <Icon name="upload" /> {t('recipe.photo.pick')}
        </Button>
      ) : (
        <div className="mt-3 flex items-start gap-3">
          <img src={url} alt={dish} className="h-24 w-24 shrink-0 rounded-xl object-cover" data-testid="dish-photo-preview" />
          <div className="flex min-w-0 flex-col gap-1.5">
            {shareable ? (
              <Button size="sm" variant="primary" onClick={share} data-testid="dish-photo-share">
                <Icon name="share" /> {t('recipe.photo.share')}
              </Button>
            ) : (
              <Button size="sm" variant="primary" onClick={save} data-testid="dish-photo-save">
                <Icon name="download" /> {t('recipe.photo.save')}
              </Button>
            )}
            <button type="button" onClick={remove} className="self-start text-xs font-medium underline underline-offset-4">
              {t('recipe.photo.remove')}
            </button>
          </div>
        </div>
      )}
      {file && !shareable && <p className="mt-2 text-xs text-ink/80">{t('recipe.photo.noShare')}</p>}
      {status && (
        <p className={`mt-2 text-xs font-medium ${status === 'failed' ? 'text-brand' : 'text-basil'}`} role="status" data-testid="dish-photo-status">
          {t(`recipe.photo.${status}`)}
        </p>
      )}
      <p className="mt-2 text-[11px] leading-snug text-muted">{t('recipe.photo.privacy')}</p>
    </div>
  );
}
