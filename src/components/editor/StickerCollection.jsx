import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useStickerCollection, sameDesign, copyItems, MAX_STICKERS } from '../../store/useStickerCollection.js';
import { renderStickerCanvas } from '../../lib/exportImage.js';

const thumbOf = async (items, assetsById) => (await renderStickerCanvas(items, assetsById, { border: { width: 30, color: '#ffffff' }, maxSide: 220 })).toDataURL('image/png');

/** Puts a saved design back in the editor (its own copy: editing never touches the saved one until saved). */
export function loadInEditor(items) {
  useEditorStore.setState({ items: copyItems(items), selectedId: null, past: [], future: [] });
}

/**
 * Under the sticker canvas: the collection of designs. Save the sticker on
 * the canvas, start a new one, reopen any saved one (the design on the canvas
 * is kept in the collection first, so nothing is lost when moving between
 * stickers) and go to the review to order them.
 */
export default function StickerCollection({ library, onReview }) {
  const { t } = useI18n();
  const items = useEditorStore((s) => s.items);
  const { stickers, editingId, add, update, setEditing } = useStickerCollection();
  const [note, setNote] = useState('');
  const editing = stickers.find((s) => s.id === editingId);
  const saved = editing && sameDesign(editing.items, items);
  const full = !editing && stickers.length >= MAX_STICKERS;

  // a fresh visit starts from a new design (the editor itself is not kept)
  useEffect(() => {
    setEditing(null);
  }, [setEditing]);
  useEffect(() => {
    if (!note) return undefined;
    const id = setTimeout(() => setNote(''), 3500);
    return () => clearTimeout(id);
  }, [note]);

  /** Keeps the design on the canvas in the collection; returns false if it could not. */
  const keep = async () => {
    if (!items.length || saved) return true;
    const thumb = await thumbOf(items, library.assetsById);
    if (editing) {
      update(editing.id, items, thumb);
      return true;
    }
    return add(items, thumb) != null;
  };
  const save = async () => {
    if (await keep()) setNote(t('editor.coll.savedNote'));
    else setNote(t('editor.coll.full', { max: MAX_STICKERS }));
  };
  const switchTo = async (id) => {
    const hadUnsaved = items.length && !saved;
    const ok = await keep();
    const target = useStickerCollection.getState().stickers.find((s) => s.id === id);
    if (id && !target) return;
    if (id) loadInEditor(target.items);
    else useEditorStore.setState({ items: [], selectedId: null, past: [], future: [] });
    useStickerCollection.getState().setEditing(id);
    if (hadUnsaved) setNote(ok ? t('editor.coll.kept') : t('editor.coll.full', { max: MAX_STICKERS }));
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-line bg-white px-3 py-2.5" data-testid="sticker-collection">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-bold uppercase tracking-[-0.01em] text-brand">
          {t('editor.coll.title')} <span className="font-semibold tabular-nums text-ink">{t('editor.coll.count', { n: stickers.length, max: MAX_STICKERS })}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="secondary" onClick={save} disabled={!items.length || saved || full} data-testid="collection-save">
            <Icon name={saved ? 'check' : 'plus'} /> {saved ? t('editor.coll.saved') : editing ? t('editor.coll.update') : t('editor.coll.save')}
          </Button>
          <Button size="sm" variant="primary" onClick={async () => (await keep(), onReview())} disabled={!stickers.length && !items.length} data-testid="collection-review">
            <Icon name="cart" /> {t('editor.coll.review')}
          </Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5" role="list" aria-label={t('editor.coll.title')}>
        {stickers.map((s, n) => (
          <button
            key={s.id}
            type="button"
            role="listitem"
            onClick={() => s.id !== editingId && switchTo(s.id)}
            aria-current={s.id === editingId ? 'true' : undefined}
            aria-label={t('editor.coll.open', { n: n + 1 })}
            title={t('editor.coll.open', { n: n + 1 })}
            className={`checker grid h-12 w-12 place-items-center rounded-xl border-2 p-0.5 transition ${s.id === editingId ? 'border-brand' : 'border-line hover:border-ink/40'}`}
            data-testid={`collection-item-${n}`}
          >
            <img src={s.thumb} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => switchTo(null)}
          disabled={!items.length && !editingId}
          className="grid h-12 w-12 place-items-center rounded-xl border-2 border-dashed border-line text-ink transition hover:border-ink/40 disabled:opacity-40"
          aria-label={t('editor.coll.new')}
          title={t('editor.coll.new')}
          data-testid="collection-new"
        >
          <Icon name="plus" />
        </button>
        {!stickers.length && <span className="ml-1 text-xs text-ink/70">{t('editor.coll.empty')}</span>}
      </div>
      {note && (
        <p role="status" className="mt-1.5 text-xs text-ink" data-testid="collection-note">
          {note}
        </p>
      )}
    </div>
  );
}
