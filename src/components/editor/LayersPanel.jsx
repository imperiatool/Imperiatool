import { useRef, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import AssetThumb from '../ui/AssetThumb.jsx';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useI18n } from '../../i18n/index.js';

/**
 * Photoshop-style layer list: top row = front-most layer.
 * Drag the grip (mouse or finger) to reorder; eye = show/hide; lock = lock.
 */
export default function LayersPanel({ library }) {
  const { t, label } = useI18n();
  const { assetsById, categoriesById } = library;
  const items = useEditorStore((s) => s.items);
  const selectedId = useEditorStore((s) => s.selectedId);
  const st = useEditorStore.getState;
  const rowRefs = useRef({});
  const [drag, setDrag] = useState(null); // { uid, insertAt }

  const display = [...items].reverse(); // front first

  const insertionFromY = (clientY) => {
    let at = display.length;
    for (let i = 0; i < display.length; i++) {
      const el = rowRefs.current[display[i].uid];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientY < r.top + r.height / 2) {
        at = i;
        break;
      }
    }
    return at;
  };

  const onGripDown = (e, uid) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    st().select(uid);
    setDrag({ uid, insertAt: display.findIndex((d) => d.uid === uid) });
  };
  const onGripMove = (e) => {
    if (!drag) return;
    const insertAt = insertionFromY(e.clientY);
    if (insertAt !== drag.insertAt) setDrag({ ...drag, insertAt });
  };
  const onGripUp = () => {
    if (!drag) return;
    const from = display.findIndex((d) => d.uid === drag.uid);
    let to = drag.insertAt;
    if (to > from) to -= 1;
    if (to !== from && from >= 0) {
      // display index → stack index (0 = bottom)
      st().moveLayerTo(drag.uid, display.length - 1 - to);
    }
    setDrag(null);
  };

  if (!items.length) return <p className="text-xs text-muted">{t('props.emptyCanvas')}</p>;

  return (
    <div>
      <p className="mb-2 text-[11px] text-muted">{t('props.layersHint')}</p>
      <ul className="relative space-y-1" data-testid="layers">
        {display.map((it, i) => {
          const a = assetsById[it.assetId];
          if (!a) return null;
          const active = it.uid === selectedId;
          const dragging = drag?.uid === it.uid;
          return (
            <li key={it.uid} ref={(el) => (rowRefs.current[it.uid] = el)} className="relative" data-layer-row={it.uid}>
              {drag && drag.insertAt === i && <div className="absolute -top-1 left-0 right-0 h-0.5 rounded bg-brand" />}
              <div
                className={`flex items-center gap-1.5 rounded-xl px-1.5 py-1 text-sm transition ${
                  active ? 'bg-ink text-cream' : 'hover:bg-ink/5'
                } ${dragging ? 'opacity-60 ring-2 ring-brand' : ''} ${it.hidden ? 'opacity-50' : ''}`}
              >
                <button
                  type="button"
                  className={`grid h-7 w-5 shrink-0 cursor-grab touch-none place-items-center rounded active:cursor-grabbing ${active ? 'text-cream/70' : 'text-muted'}`}
                  onPointerDown={(e) => onGripDown(e, it.uid)}
                  onPointerMove={onGripMove}
                  onPointerUp={onGripUp}
                  onPointerCancel={() => setDrag(null)}
                  aria-label={t('props.layersHint')}
                  data-grip={it.uid}
                >
                  <Icon name="grip" strokeWidth={3} />
                </button>
                <button type="button" onClick={() => st().select(it.uid)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <AssetThumb asset={a} colors={it.colors} className="h-7 w-7 shrink-0 rounded-md bg-white p-0.5" idPrefix={`l-${it.uid}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate leading-tight">{label(a)}</span>
                    <span className={`block truncate text-[10px] leading-tight ${active ? 'text-cream/60' : 'text-muted'}`}>{label(categoriesById[it.categoryId])}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => st().toggleHidden(it.uid)}
                  title={it.hidden ? t('props.show') : t('props.hide')}
                  aria-label={it.hidden ? t('props.show') : t('props.hide')}
                  aria-pressed={!it.hidden}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg hover:bg-white/10"
                  data-testid="layer-eye"
                >
                  <Icon name={it.hidden ? 'eyeOff' : 'eye'} />
                </button>
                <button
                  type="button"
                  onClick={() => st().toggleLocked(it.uid)}
                  title={it.locked ? t('props.unlock') : t('props.lock')}
                  aria-label={it.locked ? t('props.unlock') : t('props.lock')}
                  aria-pressed={!!it.locked}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg hover:bg-white/10 ${it.locked ? '' : 'opacity-40'}`}
                >
                  <Icon name={it.locked ? 'lock' : 'unlock'} />
                </button>
              </div>
            </li>
          );
        })}
        {drag && drag.insertAt === display.length && <li className="h-0.5 rounded bg-brand" />}
      </ul>
    </div>
  );
}
