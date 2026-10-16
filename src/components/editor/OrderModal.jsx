import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { CHARM_OPTIONS } from '../../data/defaults.js';
import { buildStickerSvg, svgToPngBlob, blobToDataUrl } from '../../lib/exportImage.js';
import { submitOrder } from '../../services/orderService.js';

const EMPTY = { name: '', email: '', phone: '', size: '4cm', finish: 'lucido', attachment: 'portachiavi', quantity: 1, notes: '', privacy: false };
const eur = (n) => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

export default function OrderModal({ open, onClose, items, library }) {
  const { assetsById, categoriesById, palette } = library;
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', order: null, error: '' });

  useEffect(() => {
    if (!open) return;
    setState({ status: 'idle', order: null, error: '' });
    setErrors({});
    let alive = true;
    const { svg, width, height } = buildStickerSvg(items, assetsById, { outline: { enabled: true, color: '#ffffff', width: 22 } });
    svgToPngBlob(svg, width, height, 600)
      .then(blobToDataUrl)
      .then((url) => alive && setPreview(url))
      .catch(() => alive && setPreview(null));
    return () => {
      alive = false;
    };
  }, [open, items, assetsById]);

  const colorName = (hex) => palette.find((p) => p.hex.toLowerCase() === hex.toLowerCase())?.name || hex;

  // Design summary: what the e-commerce needs to reproduce the charm.
  const design = useMemo(
    () =>
      items
        .filter((it) => assetsById[it.assetId])
        .map((it) => {
          const a = assetsById[it.assetId];
          return {
            category: categoriesById[it.categoryId]?.name || '—',
            assetId: a.id,
            assetName: a.name,
            colors: a.slots.map((s) => ({ slot: s.label, hex: it.colors[s.id] || s.original, name: colorName(it.colors[s.id] || s.original) })),
            transform: { x: it.x, y: it.y, scale: it.scale, rotation: it.rotation, stretchX: it.stretchX, stretchY: it.stretchY, flipX: it.flipX, flipY: it.flipY },
          };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, assetsById, categoriesById, palette],
  );

  const size = CHARM_OPTIONS.sizes.find((s) => s.id === form.size);
  const total = (size?.price || 0) * form.quantity;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Inserisci il nome';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email non valida';
    if (!(form.quantity >= 1 && form.quantity <= 50)) e.quantity = 'Da 1 a 50 pezzi';
    if (!form.privacy) e.privacy = 'Necessario per proseguire';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setState({ status: 'sending', order: null, error: '' });
    try {
      const order = await submitOrder({
        customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
        product: {
          type: 'charm-3d',
          size: form.size,
          finish: form.finish,
          attachment: form.attachment,
          quantity: Number(form.quantity),
          unitPrice: size.price,
          total,
          currency: 'EUR',
          notes: form.notes.trim(),
        },
        design,
        preview,
      });
      setState({ status: 'done', order, error: '' });
      setForm(EMPTY);
    } catch (e) {
      setState({ status: 'idle', order: null, error: e.message });
    }
  };

  const field = 'mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink';
  const Err = ({ k }) => (errors[k] ? <span className="mt-1 block text-xs text-brand-dark">{errors[k]}</span> : null);

  return (
    <Modal open={open} onClose={onClose} title="Ordina Charm 3D" size="xl">
      {state.status === 'done' ? (
        <div className="mx-auto max-w-md py-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-basil text-white">
            <Icon name="check" className="h-7 w-7" strokeWidth={3} />
          </div>
          <h3 className="font-display text-2xl font-extrabold">Richiesta registrata!</h3>
          <p className="mt-2 text-muted">
            Codice ordine <strong className="text-ink">{state.order.id}</strong>. Il checkout e-commerce verrà collegato qui: per ora la richiesta è salvata
            {state.order.status === 'inviato' ? ' e inviata al server.' : ' nel browser (visibile in Admin → Ordini).'}
          </p>
          <Button variant="secondary" className="mt-6" onClick={onClose}>Torna all’editor</Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="checker grid aspect-square place-items-center rounded-2xl border border-line p-4">
              {preview ? <img src={preview} alt="Anteprima charm" className="max-h-full max-w-full drop-shadow-lg" /> : <span className="text-sm text-muted">Anteprima…</span>}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Riepilogo design</h3>
              <ul className="space-y-2 text-sm">
                {design.map((d, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 rounded-xl bg-cream px-3 py-2">
                    <span>
                      <span className="block text-[11px] uppercase tracking-wide text-muted">{d.category}</span>
                      <span className="font-semibold">{d.assetName}</span>
                    </span>
                    <span className="flex flex-wrap justify-end gap-1 pt-1">
                      {d.colors.map((c, j) => (
                        <span key={j} title={`${c.slot}: ${c.name}`} className="h-4 w-4 rounded-full border border-ink/20" style={{ background: c.hex }} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <form onSubmit={submit} noValidate className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Prodotto</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {CHARM_OPTIONS.sizes.map((s) => (
                  <label key={s.id} className={`cursor-pointer rounded-2xl border-2 p-3 text-center transition ${form.size === s.id ? 'border-ink bg-amber/30' : 'border-line bg-white hover:border-ink/40'}`}>
                    <input type="radio" name="size" value={s.id} checked={form.size === s.id} onChange={set('size')} className="sr-only" />
                    <span className="block font-display text-lg font-bold">{s.label}</span>
                    <span className="text-sm text-muted">{eur(s.price)}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-medium">Finitura
                  <select className={field} value={form.finish} onChange={set('finish')}>
                    {CHARM_OPTIONS.finishes.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">Attacco
                  <select className={field} value={form.attachment} onChange={set('attachment')}>
                    {CHARM_OPTIONS.attachments.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">Quantità
                  <input type="number" min={1} max={50} className={field} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(0, parseInt(e.target.value || '0', 10)) })} />
                  <Err k="quantity" />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">I tuoi dati</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Nome e cognome
                  <input className={field} value={form.name} onChange={set('name')} autoComplete="name" />
                  <Err k="name" />
                </label>
                <label className="text-sm font-medium">Email
                  <input type="email" className={field} value={form.email} onChange={set('email')} autoComplete="email" />
                  <Err k="email" />
                </label>
                <label className="text-sm font-medium">Telefono <span className="font-normal text-muted">(facoltativo)</span>
                  <input className={field} value={form.phone} onChange={set('phone')} autoComplete="tel" />
                </label>
                <label className="text-sm font-medium sm:col-span-2">Note
                  <textarea rows={2} className={field} value={form.notes} onChange={set('notes')} placeholder="Es. incisione, richieste particolari…" />
                </label>
              </div>
              <label className="mt-3 flex items-start gap-2 text-sm">
                <input type="checkbox" checked={form.privacy} onChange={set('privacy')} className="mt-0.5 accent-brand" />
                <span>Acconsento al trattamento dei dati per ricevere il preventivo.<Err k="privacy" /></span>
              </label>
            </fieldset>

            {state.error && <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand-dark">{state.error}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-sm text-muted">
                Totale stimato <span className="ml-1 font-display text-2xl font-extrabold text-ink">{eur(total)}</span>
              </p>
              <Button type="submit" variant="basil" size="lg" disabled={state.status === 'sending' || !items.length}>
                <Icon name="cart" /> {state.status === 'sending' ? 'Invio…' : 'Conferma richiesta'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
