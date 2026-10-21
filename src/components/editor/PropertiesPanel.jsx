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

/**
 * Every part of the character stays open here (body, eyes, mouth…): its
 * colours are always visible. The part selected on the canvas also shows
 * size, rotation and stretch. Tap a card to select that part.
 */
export default function PropertiesPanel({ library, mode = 'charm' }) {
  const { t, label, slotLabel } = useI18n();
  const { palette, assetsById, categoriesById } = library;
  const items = useEditorStore((s) => s.items);
  const selectedId = useEditorStore((s) => s.selectedId);
  const st = useEditorStore.getState;
  // body first, like the picker steps
  const parts = items.filter((i) => assetsById[i.assetId]);

  if (!parts.length) return null;

  return (
    <div className="scroll-thin h-full space-y-3 p-4 lg:overflow-y-auto">
      {parts.map((item) => {
        const asset = assetsById[item.assetId];
        const active = item.uid === selectedId;
        return (
          <section
            key={item.uid}
            className={`rounded-2xl border p-3 transition ${active ? 'border-brand' : 'border-line'}`}
            onPointerDown={() => !active && st().select(item.uid)}
            data-testid={`part-${item.categoryId}`}
          >
            <div className="mb-2 flex items-center gap-3">
              <AssetThumb asset={asset} colors={item.colors} className="h-10 w-10 shrink-0 rounded-lg border border-line bg-white p-1" idPrefix={`p-${item.uid}`} />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{label(categoriesById[item.categoryId])}</p>
                <p className="truncate text-sm font-semibold">{label(asset)}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {asset.slots.map((slot) => {
                const current = item.colors[slot.id] || slot.original;
                return (
                  <div key={slot.id}>
                    <p className="mb-1 text-xs">
                      <span className="font-medium">{slotLabel(slot)}</span>
                      <span className="text-muted"> · {label(palette.find((c) => c.hex.toLowerCase() === current.toLowerCase())) || current}</span>
                    </p>
                    <Swatches palette={palette} value={current} onPick={(hex) => st().setColor(item.uid, slot.id, hex)} size="h-9 w-9" />
                  </div>
                );
              })}
            </div>

            {active && !item.locked && (
              <div className="mt-4 space-y-3 border-t border-line pt-3">
                {mode === 'sticker' && asset.slots.some((s) => s.kind === 'stroke') && (
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
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" onClick={() => st().commitItem(item.uid, { flipX: !item.flipX })} title={t('props.flipHTitle')}><Icon name="flipH" /> {t('props.flipH')}</Button>
                  <Button size="sm" onClick={() => st().duplicateItem(item.uid)}><Icon name="copy" /> {t('props.duplicate')}</Button>
                  <Button size="sm" variant="danger" onClick={() => st().removeItem(item.uid)}><Icon name="trash" /> {t('props.delete')}</Button>
                </div>
              </div>
            )}
          </section>
        );
      })}

      <details className="group rounded-2xl border border-line p-3">
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
}
