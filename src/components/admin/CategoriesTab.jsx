import { useState } from 'react';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Toggle from '../ui/Toggle.jsx';
import Slider from '../ui/Slider.jsx';
import Swatches from '../ui/Swatches.jsx';
import ConfirmButton from '../ui/ConfirmButton.jsx';
import { useLibrary } from '../../hooks/useLibrary.js';
import { useLibraryStore } from '../../store/useLibraryStore.js';

export default function CategoriesTab() {
  const { categories, assets, palette } = useLibrary();
  const { addCategory, updateCategory, deleteCategory, moveCategory } = useLibraryStore.getState();
  const [newName, setNewName] = useState('');

  return (
    <>
      <SectionTitle title="Categorie">
        Le categorie organizzano gli elementi (Corpi, Occhi, Bocche, Accessori, Materiali…) e definiscono come si comportano sulla tela.
      </SectionTitle>

      <form
        className="mb-5 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          addCategory({ name: newName.trim() });
          setNewName('');
        }}
      >
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome nuova categoria" className="min-w-64 flex-1 rounded-xl border border-line bg-white px-3 py-2" aria-label="Nome nuova categoria" />
        <Button type="submit" variant="primary"><Icon name="plus" /> Aggiungi categoria</Button>
      </form>

      <div className="space-y-4">
        {categories.map((c, i) => {
          const count = assets.filter((a) => a.categoryId === c.id).length;
          const up = (patch) => updateCategory(c.id, patch);
          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-center gap-3">
                <input value={c.name} onChange={(e) => up({ name: e.target.value })} className="min-w-48 flex-1 rounded-xl border border-line bg-white px-3 py-2 font-display text-lg font-bold" aria-label="Nome categoria" />
                <span className="text-sm text-muted">{count} elementi</span>
                <Button size="icon" variant="ghost" onClick={() => moveCategory(c.id, -1)} disabled={i === 0} aria-label="Sposta su"><Icon name="up" /></Button>
                <Button size="icon" variant="ghost" onClick={() => moveCategory(c.id, 1)} disabled={i === categories.length - 1} aria-label="Sposta giù"><Icon name="down" /></Button>
                <ConfirmButton size="sm" onConfirm={() => deleteCategory(c.id)} confirmLabel={count ? `Elimina con ${count} elementi?` : 'Confermi?'}>
                  <Icon name="trash" /> Elimina
                </ConfirmButton>
              </div>

              <div className="mt-4 grid gap-x-8 gap-y-2 md:grid-cols-3">
                <div>
                  <Toggle label="Forma base" hint="Gli altri elementi si posizionano e si ridimensionano su di essa" checked={c.isBase} onChange={(v) => up({ isBase: v })} />
                  <Toggle label="Più elementi" hint="Se spento, un nuovo elemento sostituisce il precedente" checked={c.multiple} onChange={(v) => up({ multiple: v })} />
                </div>
                <div>
                  <Toggle label="Usa in Randomizza" checked={c.inRandom} onChange={(v) => up({ inRandom: v })} />
                  <Toggle label="Sempre presente" hint="In Randomizza viene sempre scelto un elemento" checked={c.required} onChange={(v) => up({ required: v })} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Ordine di sovrapposizione
                    <input type="number" value={c.zIndex} onChange={(e) => up({ zIndex: parseInt(e.target.value || '0', 10) })} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-1.5" />
                  </label>
                </div>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-ink">Posizione e importazione</summary>
                <div className="mt-3 grid gap-5 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-xs text-muted">Punto di inserimento (relativo alla forma base, o alla tela se non c’è).</p>
                    <Slider label="Orizzontale" value={c.anchor?.x ?? 0.5} min={0} max={1} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => up({ anchor: { ...c.anchor, x: v } })} />
                    <Slider label="Verticale" value={c.anchor?.y ?? 0.5} min={0} max={1} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => up({ anchor: { ...c.anchor, y: v } })} />
                    <Slider
                      label={c.isBase ? 'Dimensione (rispetto alla tela)' : 'Larghezza (rispetto alla forma base)'}
                      value={c.size ?? 0.5} min={0.1} max={1.5} step={0.01} format={(v) => `${Math.round(v * 100)}%`}
                      onChange={(v) => up({ size: v })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Toggle label="Riempi forme a contorno all’importazione" checked={c.fillOutlines} onChange={(v) => up({ fillOutlines: v })} />
                    <p className="text-xs text-muted">Colore base predefinito</p>
                    <Swatches palette={palette} value={c.outlineFill} onPick={(hex) => up({ outlineFill: hex })} size="h-6 w-6" />
                  </div>
                </div>
              </details>
            </Card>
          );
        })}
      </div>
    </>
  );
}
