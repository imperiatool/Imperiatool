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

export default function PropertiesPanel({ library }) {
  const { t, label, slotLabel } = useI18n();
  const { palette, assetsById, categoriesById } = library;
  const items = useEditorStore((s) => s.items);
  const selectedId = useEditorStore((s) => s.selectedId);
  const st = useEditorStore.getState;

  const index = items.findIndex((i) => i.uid === selectedId);
  const item = items[index];
  const asset = item && assetsById[item.assetId];
  const locked = !!item?.locked;

  return (
    <div className="scroll-thin h-full space-y-6 overflow-y-auto p-4">
      {item && asset ? (
        <>
          <section>
            <div className="mb-3 flex items-center gap-3">
              <AssetThumb asset={asset} colors={item.colors} className="h-12 w-12 shrink-0 rounded-xl border border-line bg-white p-1" idPrefix={`p-${item.uid}`} />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label(categoriesById[item.categoryId])}</p>
                <p className="truncate font-display text-lg font-bold leading-tight">{label(asset)}</p>
              </div>
            </div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('props.colors')}</h3>
            <div className="space-y-3">
              {asset.slots.map((slot) => {
                const current = item.colors[slot.id] || slot.original;
                return (
                  <div key={slot.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span>
                        <span className="font-bold">{slotLabel(slot)}</span>
                        <span className="text-muted"> · {label(palette.find((c) => c.hex.toLowerCase() === current.toLowerCase())) || current}</span>
                      </span>
                      {item.colors[slot.id] && (
                        <button type="button" className="text-muted underline-offset-2 hover:text-ink hover:underline" onClick={() => st().setColor(item.uid, slot.id, null)}>
                          {t('props.default')}
                        </button>
                      )}
                    </div>
                    <Swatches palette={palette} value={current} onPick={(hex) => st().setColor(item.uid, slot.id, hex)} size="h-10 w-10" />
                  </div>
                );
              })}
              {!asset.slots.length && <p className="text-xs text-muted">{t('props.noColors')}</p>}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{t('props.advanced')}</h3>
            {locked ? (
              <p className="flex items-start gap-2 rounded-xl bg-ink/5 px-3 py-2 text-xs text-muted">
                <Icon name="lock" className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t('props.locked')}
              </p>
            ) : (
              <>
                {asset.slots.some((s) => s.kind === 'stroke') && (
                  <Slider label={t('props.outlineWidth')} value={item.strokeScale ?? 1} min={0.3} max={2.5} step={0.05} format={pct}
                    onStart={() => st().snapshot()} onChange={(v) => st().updateItem(item.uid, { strokeScale: v })}
                    onReset={() => st().commitItem(item.uid, { strokeScale: 1 })} />
                )}
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
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button size="sm" onClick={() => st().commitItem(item.uid, { flipX: !item.flipX })} title={t('props.flipHTitle')}><Icon name="flipH" /> {t('props.flipH')}</Button>
                  <Button size="sm" onClick={() => st().commitItem(item.uid, { flipY: !item.flipY })} title={t('props.flipVTitle')}><Icon name="flipV" /> {t('props.flipV')}</Button>
                  <Button size="sm" onClick={() => st().commitItem(item.uid, { scale: 1, rotation: 0, stretchX: 1, stretchY: 1, flipX: false, flipY: false, strokeScale: 1 })}><Icon name="reset" /> {t('props.resetAll')}</Button>
                </div>
              </>
            )}
          </section>

          <section className="space-y-1.5">
            <div className="grid grid-cols-4 gap-1.5">
              <Button size="icon" className="w-full" onClick={() => st().bringToFront(item.uid)} disabled={index === items.length - 1} title={t('props.toFront')} aria-label={t('props.toFront')}><Icon name="toFront" /></Button>
              <Button size="icon" className="w-full" onClick={() => st().moveLayer(item.uid, 1)} disabled={index === items.length - 1} title={t('props.forward')} aria-label={t('props.forward')}><Icon name="up" /></Button>
              <Button size="icon" className="w-full" onClick={() => st().moveLayer(item.uid, -1)} disabled={index === 0} title={t('props.backward')} aria-label={t('props.backward')}><Icon name="down" /></Button>
              <Button size="icon" className="w-full" onClick={() => st().sendToBack(item.uid)} disabled={index === 0} title={t('props.toBack')} aria-label={t('props.toBack')}><Icon name="toBack" /></Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" onClick={() => st().duplicateItem(item.uid)}><Icon name="copy" /> {t('props.duplicate')}</Button>
              <Button size="sm" variant="danger" onClick={() => st().removeItem(item.uid)}><Icon name="trash" /> {t('props.delete')}</Button>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
          <p className="font-display text-base font-bold text-ink">{t('props.selectTitle')}</p>
          <p className="mt-1">{items.length ? t('props.tapHint') : t('props.selectHint')}</p>
        </section>
      )}

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><Icon name="layers" className="h-3.5 w-3.5" /> {t('props.layers')}</h3>
        <LayersPanel library={library} />
      </section>

    </div>
  );
}
