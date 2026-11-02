import { forwardRef, useEffect, useState } from 'react';
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
 * Accordion: one section per part of the character (Body, Eyes, Mouth). The
 * three headers are always visible with their state; one section is open at a
 * time. Inside: the shapes, then the chosen one with a large preview on the
 * left and its colours on the right. Choices are kept when switching section.
 */
const CustomiserPanel = forwardRef(function CustomiserPanel({ library }, ref) {
  const { t, label, slotLabel } = useI18n();
  const { categories, assets, palette, assetsById } = library;
  const items = useEditorStore((s) => s.items);
  const selectedId = useEditorStore((s) => s.selectedId);
  const st = useEditorStore.getState;
  const [openId, setOpenId] = useState(null); // all closed at first

  const sections = categories.filter((c) => assets.some((a) => a.categoryId === c.id));
  const required = sections.filter((c) => c.required);
  const done = (c) => items.some((i) => i.categoryId === c.id && assetsById[i.assetId]);
  const doneCount = required.filter(done).length;
  const allDone = doneCount === required.length;

  // a part selected on the canvas (or just added) opens its section
  useEffect(() => {
    const it = items.find((i) => i.uid === selectedId);
    if (it) setOpenId(it.categoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));
  const nextOf = (cat) => {
    const i = sections.indexOf(cat);
    return sections.slice(i + 1).find((c) => c.required && !done(c)) || sections.find((c) => c !== cat && c.required && !done(c));
  };

  return (
    <div ref={ref} className="scroll-thin space-y-3 p-4 lg:h-full lg:overflow-y-auto" data-testid="customiser">
      {/* progress: one labelled step per part, all needed */}
      <div>
        <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${required.length}, minmax(0, 1fr))` }} aria-label={t('picker.progress', { done: doneCount, total: required.length })}>
          {required.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setOpenId(c.id)} className="group block w-full text-left" data-testid={`step-${c.id}`}>
                <span className={`block h-1.5 rounded-full transition ${done(c) ? 'bg-brand' : openId === c.id ? 'bg-ink/40' : 'bg-line'}`} />
                <span className={`mt-1.5 flex items-center gap-1 truncate text-[11px] font-semibold uppercase tracking-wide ${done(c) ? 'text-brand' : 'text-muted group-hover:text-ink'}`}>
                  {done(c) && <Icon name="check" className="h-3 w-3 shrink-0" strokeWidth={3} />}
                  {label(c)}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className={`mt-2 text-xs ${allDone ? 'text-brand' : 'text-muted'}`} data-testid="picker-progress">
          {allDone ? t('editor.allDone') : t('picker.progress', { done: doneCount, total: required.length })}
        </p>
      </div>

      {sections.map((cat, n) => {
        const list = assets.filter((a) => a.categoryId === cat.id);
        const parts = items.filter((i) => i.categoryId === cat.id && assetsById[i.assetId]);
        const open = openId === cat.id;
        const chosen = parts.map((p) => label(assetsById[p.assetId])).join(', ');
        const next = open && parts.length ? nextOf(cat) : null;
        return (
          <section key={cat.id} className={`overflow-hidden rounded-2xl border bg-white transition ${open ? 'border-brand' : 'border-line'}`} data-testid={`section-${cat.id}`}>
            <h3>
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                aria-expanded={open}
                aria-controls={`panel-${cat.id}`}
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
                data-testid={`toggle-${cat.id}`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${done(cat) ? 'bg-brand text-white' : 'border border-ink/30 text-ink/60'}`}>
                  {done(cat) ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} /> : n + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{label(cat)}</span>
                  <span className={`block truncate text-xs ${parts.length ? 'text-ink/70' : 'text-muted'}`}>{parts.length ? chosen : t('picker.choose')}</span>
                </span>
                {parts[0] && <AssetThumb asset={assetsById[parts[0].assetId]} colors={parts[0].colors} className="h-9 w-9 shrink-0" idPrefix={`hd-${parts[0].uid}`} />}
                <Icon name="down" className={`h-4 w-4 shrink-0 text-muted transition ${open ? 'rotate-180' : ''}`} />
              </button>
            </h3>

            {open && (
              <div id={`panel-${cat.id}`} className="border-t border-line px-3 pb-3 pt-3">
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
                        <details className="group mt-3 rounded-xl bg-cream p-3">
                          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium uppercase tracking-wider text-muted">
                            {t('props.advanced')}
                            <Icon name="down" className="h-4 w-4 transition group-open:rotate-180" />
                          </summary>
                          <div className="mt-3 space-y-3">
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
                          </div>
                        </details>
                      )}
                      {active && !item.locked && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {MIRRORABLE.has(asset.name) && (
                            <Button size="sm" onClick={() => st().commitItem(item.uid, { flipX: !item.flipX })} title={t('props.flipHTitle')} data-testid="mirror">
                              <Icon name="flipH" /> {t('props.flipH')}
                            </Button>
                          )}
                          <Button size="sm" onClick={() => st().duplicateItem(item.uid)}><Icon name="copy" /> {t('props.duplicate')}</Button>
                          <Button size="sm" variant="danger" onClick={() => st().removeItem(item.uid)}><Icon name="trash" /> {t('props.delete')}</Button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {next && (
                  <div className="mt-3 flex justify-end border-t border-line pt-3">
                    <Button size="sm" variant="secondary" onClick={() => setOpenId(next.id)} data-testid={`next-${cat.id}`}>
                      {t('picker.next', { name: label(next) })} <Icon name="arrowRight" className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
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
