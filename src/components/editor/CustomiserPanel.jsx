import { forwardRef } from 'react';
import Slider from '../ui/Slider.jsx';
import Swatches from '../ui/Swatches.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import AssetThumb from '../ui/AssetThumb.jsx';
import LayersPanel from './LayersPanel.jsx';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useI18n } from '../../i18n/index.js';

const pct = (v) => `${Math.round(v * 100)}%`;
const deg = (v) => `${Math.round(v)}°`;

// Mirror is only useful where the pupils sit off-centre (Square Ravioli eyes)
const MIRRORABLE = new Set(['Ravioli quadrati']);

/**
 * One section per part of the character (Body, Eyes, Mouth): choose the shape,
 * then its colours right next to a large preview of it. The part selected on
 * the canvas also shows size, rotation and stretch.
 */
const CustomiserPanel = forwardRef(function CustomiserPanel({ library }, ref) {
  const { t, label, slotLabel } = useI18n();
  const { categories, assets, palette, assetsById } = library;
  const items = useEditorStore((s) => s.items);
  const selectedId = useEditorStore((s) => s.selectedId);
  const st = useEditorStore.getState;

  const sections = categories.filter((c) => assets.some((a) => a.categoryId === c.id));
  const required = sections.filter((c) => c.required);
  const done = (c) => items.some((i) => i.categoryId === c.id);
  const doneCount = required.filter(done).length;
  const allDone = doneCount === required.length;

  return (
    <div ref={ref} className="scroll-thin space-y-3 p-4 lg:h-full lg:overflow-y-auto" data-testid="customiser">
      {/* progress: every part must be chosen */}
      <div className="flex items-center gap-2 px-1 text-xs">
        <div className="flex gap-1" aria-hidden="true">
          {required.map((c) => (
            <span key={c.id} className={`h-1.5 w-6 rounded-full ${done(c) ? 'bg-brand' : 'bg-line'}`} />
          ))}
        </div>
        <span className={allDone ? 'text-brand' : 'text-muted'} data-testid="picker-progress">
          {allDone ? t('editor.allDone') : t('picker.progress', { done: doneCount, total: required.length })}
        </span>
      </div>

      {sections.map((cat, n) => {
        const list = assets.filter((a) => a.categoryId === cat.id);
        const parts = items.filter((i) => i.categoryId === cat.id && assetsById[i.assetId]);
        const activeSection = parts.some((p) => p.uid === selectedId);
        return (
          <section key={cat.id} className={`rounded-2xl border bg-white p-3 transition ${activeSection ? 'border-brand' : 'border-line'}`} data-testid={`section-${cat.id}`}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${done(cat) ? 'bg-brand text-white' : 'border border-ink/30 text-ink/60'}`}>
                {done(cat) ? <Icon name="check" className="h-3 w-3" strokeWidth={3} /> : n + 1}
              </span>
              {label(cat)}
            </h3>

            {/* shapes of this part */}
            <div className="scroll-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="listbox" aria-label={label(cat)}>
              {list.map((a) => {
                const used = parts.some((p) => p.assetId === a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="option"
                    aria-selected={used}
                    onClick={() => st().addAsset(a, library)}
                    title={t(cat.multiple ? 'picker.add' : 'picker.use', { name: label(a) })}
                    className={`flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition ${used ? 'border-brand bg-brand/5' : 'border-line hover:border-brand/50'}`}
                    data-testid={`option-${a.id}`}
                  >
                    <AssetThumb asset={a} className="h-12 w-full" />
                    <span className="w-full truncate text-center text-[11px] leading-tight">{label(a)}</span>
                  </button>
                );
              })}
            </div>

            {/* the chosen shape: large preview on the left, its colours on the right */}
            {parts.map((item) => {
              const asset = assetsById[item.assetId];
              const active = item.uid === selectedId;
              return (
                <div key={item.uid} className="mt-3 border-t border-line pt-3" onPointerDown={() => !active && st().select(item.uid)} data-testid={`part-${cat.id}`}>
                  <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
                    <div>
                      <AssetThumb asset={asset} colors={item.colors} className="h-24 w-24 rounded-xl border border-line bg-cream p-1.5" idPrefix={`cp-${item.uid}`} />
                      <p className="mt-1 truncate text-center text-xs font-medium">{label(asset)}</p>
                    </div>
                    <div className="min-w-0 space-y-2">
                      {asset.slots.map((slot) => {
                        const current = item.colors[slot.id] || slot.original;
                        return (
                          <div key={slot.id}>
                            <p className="mb-1 truncate text-xs">
                              <span className="font-medium">{slotLabel(slot)}</span>
                              <span className="text-muted"> · {label(palette.find((c) => c.hex.toLowerCase() === current.toLowerCase())) || current}</span>
                            </p>
                            <Swatches palette={palette} value={current} onPick={(hex) => st().setColor(item.uid, slot.id, hex)} size="h-7 w-7 sm:h-8 sm:w-8" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {active && !item.locked && (
                    <div className="mt-3 space-y-3 rounded-xl bg-cream p-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted">{t('props.advanced')}</p>
                      <Slider label={t('props.size')} value={item.scale} min={0.1} max={3} step={0.01} format={pct}
                        onStart={() => st().snapshot()} onChange={(v) => st().updateItem(item.uid, { scale: v })}
                        onReset={() => st().commitItem(item.uid, { scale: 1 })} />
                      <Slider label={t('props.rotation')} value={item.rotation} min={-180} max={180} step={1} format={deg}
                        onStart={() => st().snapshot()} onChange={(v) => st().updateItem(item.uid, { rotation: v })}
                        onReset={() => st().commitItem(item.uid, { rotation: 0 })} />
                      <Slider label={t('props.stretchX')} value={item.stretchX} min={0.2} max={3} step={0.01} format={pct}
                        onStart={() => st().snapshot()} onChange={(v) => st().updateItem(item.uid, { stretchX: v })}
                        onReset={() => st().commitItem(item.uid, { stretchX: 1 })} />
                      <Slider label={t('props.stretchY')} value={item.stretchY} min={0.2} max={3} step={0.01} format={pct}
                        onStart={() => st().snapshot()} onChange={(v) => st().updateItem(item.uid, { stretchY: v })}
                        onReset={() => st().commitItem(item.uid, { stretchY: 1 })} />
                      <div className="flex flex-wrap gap-1.5">
                        {MIRRORABLE.has(asset.name) && (
                          <Button size="sm" onClick={() => st().commitItem(item.uid, { flipX: !item.flipX })} title={t('props.flipHTitle')} data-testid="mirror">
                            <Icon name="flipH" /> {t('props.flipH')}
                          </Button>
                        )}
                        <Button size="sm" onClick={() => st().duplicateItem(item.uid)}><Icon name="copy" /> {t('props.duplicate')}</Button>
                        <Button size="sm" variant="danger" onClick={() => st().removeItem(item.uid)}><Icon name="trash" /> {t('props.delete')}</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}

      <details className="group rounded-2xl border border-line bg-white p-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium uppercase tracking-wider text-muted">
          <span className="flex items-center gap-1.5"><Icon name="layers" className="h-3.5 w-3.5" /> {t('props.layers')}</span>
          <Icon name="down" className="h-4 w-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-3">
          <LayersPanel library={library} />
        </div>
      </details>
    </div>
  );
});

export default CustomiserPanel;
