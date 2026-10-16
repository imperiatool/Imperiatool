import { useState } from 'react';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import ConfirmButton from '../ui/ConfirmButton.jsx';
import { useLibrary } from '../../hooks/useLibrary.js';
import { useLibraryStore } from '../../store/useLibraryStore.js';
import { normalizeColor, isHex, hexToRgb } from '../../lib/colors.js';

export default function PaletteTab() {
  const { palette } = useLibrary();
  const { addColor, updateColor, deleteColor, moveColor } = useLibraryStore.getState();
  const [hex, setHex] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const add = (e) => {
    e.preventDefault();
    const n = normalizeColor(hex.startsWith('#') || hex.startsWith('rgb') ? hex : `#${hex}`);
    if (!n || n === 'none') return setError('Inserisci un colore HEX (#e3201b) o RGB (rgb(227,32,27)).');
    if (palette.some((p) => p.hex.toLowerCase() === n)) return setError('Colore già presente.');
    addColor({ hex: n, name: name.trim() || n.toUpperCase() });
    setHex('');
    setName('');
    setError('');
  };

  return (
    <>
      <SectionTitle title="Palette del brand">
        Gli utenti possono ricolorare gli elementi solo con questi colori: non esiste un selettore libero. L’ordine qui è quello mostrato nell’editor.
      </SectionTitle>

      <Card className="mb-5">
        <form onSubmit={add} className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">
            HEX / RGB
            <div className="mt-1 flex items-center gap-2">
              <span className="h-9 w-9 rounded-full border border-ink/20" style={{ background: normalizeColor(hex.startsWith('#') || hex.startsWith('rgb') ? hex : `#${hex}`) || '#fff' }} />
              <input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#e3201b" className="w-40 rounded-xl border border-line bg-white px-3 py-2 font-mono" />
            </div>
          </label>
          <label className="flex-1 text-sm font-medium">
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rosso Pomodoro" className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2" />
          </label>
          <Button type="submit" variant="primary"><Icon name="plus" /> Aggiungi colore</Button>
        </form>
        {error && <p className="mt-2 text-sm text-brand-dark">{error}</p>}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {palette.map((c, i) => (
          <Card key={c.id} className="!p-0 overflow-hidden">
            <div className="h-24" style={{ background: c.hex }} />
            <div className="space-y-2 p-4">
              <input value={c.name} onChange={(e) => updateColor(c.id, { name: e.target.value })} className="w-full rounded-lg border border-line bg-white px-2 py-1 font-semibold" aria-label="Nome colore" />
              <HexField value={c.hex} onChange={(v) => updateColor(c.id, { hex: v })} />
              <p className="font-mono text-xs text-muted">RGB {hexToRgb(c.hex).join(', ')}</p>
              <div className="flex items-center gap-1 pt-1">
                <Button size="icon" variant="ghost" onClick={() => moveColor(c.id, -1)} disabled={i === 0} aria-label="Sposta prima"><Icon name="up" className="h-4 w-4 -rotate-90" /></Button>
                <Button size="icon" variant="ghost" onClick={() => moveColor(c.id, 1)} disabled={i === palette.length - 1} aria-label="Sposta dopo"><Icon name="down" className="h-4 w-4 -rotate-90" /></Button>
                <span className="flex-1" />
                <ConfirmButton size="sm" onConfirm={() => deleteColor(c.id)}><Icon name="trash" /> Elimina</ConfirmButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">Suggerimento: puoi importare i colori direttamente da un SVG con la palette (Importa SVG → seleziona il livello → “Importa colori del livello nella palette”).</p>
    </>
  );
}

function HexField({ value, onChange }) {
  const [draft, setDraft] = useState(value);
  const commit = () => {
    const n = normalizeColor(draft.startsWith('#') ? draft : `#${draft}`);
    if (n && isHex(n)) onChange(n);
    else setDraft(value);
  };
  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
      className="w-full rounded-lg border border-line bg-white px-2 py-1 font-mono text-sm"
      aria-label="Codice HEX"
    />
  );
}
