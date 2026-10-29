import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useStickerCollection, sameDesign, copyItems, MAX_STICKERS } from '../../store/useStickerCollection.js';
import { renderStickerCanvas } from '../../lib/exportImage.js';

const thumbOf = async (items, assetsById) => (items.length ? (await renderStickerCanvas(items, assetsById, { border: { width: 30, color: '#ffffff' }, maxSide: 220 })).toDataURL('image/png') : null);

/** Puts a saved design back in the editor (its own copy). */
export function loadInEditor(items) {
  useEditorStore.setState({ items: copyItems(items), selectedId: null, past: [], future: [] });
}

/**
 * Under the sticker canvas: the collection of designs.
 *   - the first sticker goes in with "Add to collection";
 *   - after that, + adds the next one (a new sticker, or the design on the
 *     canvas if it is not in the collection yet);
 *   - the sticker being edited is kept up to date in the collection by
 *     itself, so moving between stickers never loses a design;
 *   - tapping a sticker reopens it; "Review and order" opens the review.
 * Repeated taps cannot add duplicates: + does nothing while the current
 * sticker is still empty or while the previous tap is being handled.
 */
export default function StickerCollection({ library, onReview }) {
  const { t } = useI18n();
  const items = useEditorStore((s) => s.items);
  const { stickers, editingId, add, update, remove, setEditing } = useStickerCollection();
  const [note, setNote] = useState('');
  const busy = useRef(false);
  const editing = stickers.find((s) => s.id === editingId);
  const full = stickers.length >= MAX_STICKERS;

  // a fresh visit starts from a new design (the editor itself is not kept);
  // an empty sticker left from last time is dropped
  useEffect(() => {
    const st = useStickerCollection.getState();
    st.stickers.filter((s) => !s.items.length).forEach((s) => st.remove(s.id));
    setEditing(null);
  }, [setEditing]);
  useEffect(() => {
    if (!note) return undefined;
    const id = setTimeout(() => setNote(''), 3500);
    return () => clearTimeout(id);
  }, [note]);

  // the sticker being edited follows the canvas (a moment after the last change)
  useEffect(() => {
    if (!editing || sameDesign(editing.items, items)) return undefined;
    const id = setTimeout(async () => {
      const thumb = await thumbOf(items, library.assetsById);
      const cur = useStickerCollection.getState();
      if (cur.editingId === editing.id) cur.update(editing.id, items, thumb);
    }, 500);
    return () => clearTimeout(id);
  }, [items, editing, library.assetsById]);

  /** Saves the canvas into the sticker being edited right away (before switching). */
  const flush = async () => {
    const cur = useStickerCollection.getState();
    const ed = cur.stickers.find((s) => s.id === cur.editingId);
    const now = useEditorStore.getState().items;
    if (ed && !sameDesign(ed.items, now)) update(ed.id, now, await thumbOf(now, library.assetsById));
  };
  const run = async (fn) => {
    if (busy.current) return;
    busy.current = true;
    try {
      await fn();
    } finally {
      busy.current = false;
    }
  };

  // the first sticker
  const addFirst = () =>
    run(async () => {
      if (!items.length) return;
      add(items, await thumbOf(items, library.assetsById));
      setNote(t('editor.coll.savedNote'));
    });
  // + : the next sticker
  const addNext = () =>
    run(async () => {
      if (full) return setNote(t('editor.coll.full', { max: MAX_STICKERS }));
      if (!editing) {
        // the design on the canvas is not in the collection yet: add it
        if (!items.length) return;
        add(items, await thumbOf(items, library.assetsById));
        return setNote(t('editor.coll.added'));
      }
      if (!items.length) return; // the current sticker is still empty
      await flush();
      useEditorStore.setState({ items: [], selectedId: null, past: [], future: [] });
      add([], null);
      setNote(t('editor.coll.newNote'));
    });
  const open = (id) =>
    run(async () => {
      await flush();
      const cur = useStickerCollection.getState();
      const leaving = cur.stickers.find((s) => s.id === cur.editingId);
      if (leaving && !leaving.items.length) remove(leaving.id); // an empty sticker is not kept
      const target = useStickerCollection.getState().stickers.find((s) => s.id === id);
      if (!target) return;
      loadInEditor(target.items);
      setEditing(id);
    });

  const plusDisabled = full || (editing ? !items.length : !items.length);

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-line bg-white px-3 py-2.5" data-testid="sticker-collection">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-bold uppercase tracking-[-0.01em] text-brand">
          {t('editor.coll.title')} <span className="font-semibold tabular-nums text-ink">{t('editor.coll.count', { n: stickers.filter((s) => s.items.length).length, max: MAX_STICKERS })}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {!stickers.length && (
            <Button size="sm" variant="secondary" onClick={addFirst} disabled={!items.length} data-testid="collection-save">
              <Icon name="plus" /> {t('editor.coll.save')}
            </Button>
          )}
          <Button size="sm" variant="primary" onClick={() => run(async () => (await flush(), onReview()))} disabled={!stickers.some((s) => s.items.length)} data-testid="collection-review">
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
            onClick={() => s.id !== editingId && open(s.id)}
            aria-current={s.id === editingId ? 'true' : undefined}
            aria-label={t('editor.coll.open', { n: n + 1 })}
            title={t('editor.coll.open', { n: n + 1 })}
            className={`checker grid h-12 w-12 place-items-center rounded-xl border-2 p-0.5 transition ${s.id === editingId ? 'border-brand' : 'border-line hover:border-ink/40'}`}
            data-testid={`collection-item-${n}`}
          >
            {s.thumb ? <img src={s.thumb} alt="" className="h-full w-full object-contain" /> : <span className="text-xs font-semibold tabular-nums text-ink/50">{n + 1}</span>}
          </button>
        ))}
        {stickers.length > 0 && (
          <button
            type="button"
            onClick={addNext}
            disabled={plusDisabled}
            className="grid h-12 w-12 place-items-center rounded-xl border-2 border-dashed border-brand/60 text-brand transition hover:border-brand hover:bg-brand/5 disabled:border-line disabled:text-ink/30 disabled:hover:bg-transparent"
            aria-label={t('editor.coll.addNext')}
            title={t('editor.coll.addNext')}
            data-testid="collection-new"
          >
            <Icon name="plus" className="h-5 w-5" />
          </button>
        )}
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
