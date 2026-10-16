import Slider from '../ui/Slider.jsx';
import Swatches from '../ui/Swatches.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import AssetThumb from '../ui/AssetThumb.jsx';
import { useEditorStore } from '../../store/useEditorStore.js';

const pct = (v) => `${Math.round(v * 100)}%`;
const deg = (v) => `${Math.round(v)}°`;

export default function PropertiesPanel({ library }) {
  const { palette, assetsById, categoriesById } = library;
  const items = useEditorStore((s) => s.items);
  const selectedId = useEditorStore((s) => s.selectedId);
  const background = useEditorStore((s) => s.background);
  const st = useEditorStore.getState;

  const item = items.find((i) => i.uid === selectedId);
  const asset = item && assetsById[item.assetId];

  return (
    <div className="scroll-thin h-full space-y-6 overflow-y-auto p-4">
      {item && asset ? (
        <>
          <section>
            <div className="mb-3 flex items-center gap-3">
              <AssetThumb asset={asset} colors={item.colors} className="h-12 w-12 shrink-0 rounded-xl border border-line bg-white p-1" idPrefix={`p-${item.uid}`} />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{categoriesById[item.categoryId]?.name}</p>
                <p className="truncate font-display text-lg font-bold leading-tight">{asset.name}</p>
              </div>
            </div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Colori</h3>
            <div className="space-y-3">
              {asset.slots.map((slot) => {
                const current = item.colors[slot.id] || slot.original;
                return (
                  <div key={slot.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium">{slot.label}</span>
                      {item.colors[slot.id] && (
                        <button type="button" className="text-muted underline-offset-2 hover:text-ink hover:underline" onClick={() => st().setColor(item.uid, slot.id, null)}>
                          predefinito
                        </button>
                      )}
                    </div>
                    <Swatches palette={palette} value={current} onPick={(hex) => st().setColor(item.uid, slot.id, hex)} size="h-7 w-7" />
                  </div>
                );
              })}
              {!asset.slots.length && <p className="text-xs text-muted">Questo elemento non ha colori modificabili.</p>}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Trasforma</h3>
            <Slider label="Dimensione" value={item.scale} min={0.1} max={3} step={0.01} format={pct}
              onStart={() => st().snapshot()} onChange={(v) => st().updateItem(item.uid, { scale: v })}
              onReset={() => st().commitItem(item.uid, { scale: 1 })} />
            <Slider label="Rotazione" value={item.rotation} min={-180} max={180} step={1} format={deg}
              onStart={() => st().snapshot()} onChange={(v) => st().updateItem(item.uid, { rotation: v })}
              onReset={() => st().commitItem(item.uid, { rotation: 0 })} />
            <Slider label="Stira orizzontale (X)" value={item.stretchX} min={0.2} max={3} step={0.01} format={pct}
              onStart={() => st().snapshot()} onChange={(v) => st().updateItem(item.uid, { stretchX: v })}
              onReset={() => st().commitItem(item.uid, { stretchX: 1 })} />
            <Slider label="Stira verticale (Y)" value={item.stretchY} min={0.2} max={3} step={0.01} format={pct}
              onStart={() => st().snapshot()} onChange={(v) => st().updateItem(item.uid, { stretchY: v })}
              onReset={() => st().commitItem(item.uid, { stretchY: 1 })} />
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Button size="sm" onClick={() => st().commitItem(item.uid, { flipX: !item.flipX })} title="Specchia orizzontalmente"><Icon name="flipH" /> Specchia</Button>
              <Button size="sm" onClick={() => st().commitItem(item.uid, { flipY: !item.flipY })} title="Capovolgi verticalmente"><Icon name="flipV" /> Capovolgi</Button>
              <Button size="sm" onClick={() => st().commitItem(item.uid, { scale: 1, rotation: 0, stretchX: 1, stretchY: 1, flipX: false, flipY: false })}><Icon name="reset" /> Reset</Button>
            </div>
          </section>

          <section className="flex flex-wrap gap-1.5">
            <Button size="sm" onClick={() => st().moveLayer(item.uid, 1)} title="Porta avanti"><Icon name="up" /> Avanti</Button>
            <Button size="sm" onClick={() => st().moveLayer(item.uid, -1)} title="Porta indietro"><Icon name="down" /> Indietro</Button>
            <Button size="sm" onClick={() => st().duplicateItem(item.uid)}><Icon name="copy" /> Duplica</Button>
            <Button size="sm" variant="danger" onClick={() => st().removeItem(item.uid)}><Icon name="trash" /> Elimina</Button>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border-2 border-dashed border-line p-4 text-sm text-muted">
          <p className="font-display text-base font-bold text-ink">Seleziona un elemento</p>
          <p className="mt-1">Trascina per spostare. Angoli: ridimensiona. Quadratini laterali: stira su X o Y. Pallino rosso: ruota (Shift = scatti di 15°).</p>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Sfondo</h3>
        <Swatches
          palette={palette}
          value={background}
          onPick={(hex) => st().setBackground(hex)}
          size="h-7 w-7"
          extra={
            <button
              type="button"
              onClick={() => st().setBackground(null)}
              aria-pressed={!background}
              title="Trasparente"
              className={`checker h-7 w-7 rounded-full border border-ink/20 ${!background ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : ''}`}
            />
          }
        />
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><Icon name="layers" className="h-3.5 w-3.5" /> Livelli</h3>
        {items.length ? (
          <ul className="space-y-1">
            {[...items].reverse().map((it) => {
              const a = assetsById[it.assetId];
              if (!a) return null;
              return (
                <li key={it.uid}>
                  <button
                    type="button"
                    onClick={() => st().select(it.uid)}
                    className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm transition ${it.uid === selectedId ? 'bg-ink text-cream' : 'hover:bg-ink/5'}`}
                  >
                    <AssetThumb asset={a} colors={it.colors} className="h-7 w-7 shrink-0 rounded-md bg-white p-0.5" idPrefix={`l-${it.uid}`} />
                    <span className="truncate">{a.name}</span>
                    <span className={`ml-auto text-[11px] ${it.uid === selectedId ? 'text-cream/70' : 'text-muted'}`}>{categoriesById[it.categoryId]?.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted">La tela è vuota.</p>
        )}
      </section>
    </div>
  );
}
