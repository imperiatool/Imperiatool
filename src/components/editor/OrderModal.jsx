import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Toggle from '../ui/Toggle.jsx';
import { CHARM_OPTIONS } from '../../data/defaults.js';
import { buildStickerSvg, svgToPngBlob, blobToDataUrl } from '../../lib/exportImage.js';
import { submitOrder } from '../../services/orderService.js';
import { useI18n } from '../../i18n/index.js';

// Three.js is only downloaded when the order window opens.
const Charm3DViewer = lazy(() => import('./Charm3DViewer.jsx'));

// swatch "look" of each material (purely decorative)
const MATERIAL_SWATCH = {
  raw: 'radial-gradient(circle at 30% 30%, #f6e7bd, #dcc58e 70%), repeating-radial-gradient(circle, rgba(0,0,0,.05) 0 1px, transparent 1px 3px)',
  aldente: 'radial-gradient(circle at 30% 25%, #fff 0 8%, #ffb548 22%, #e89a2a 80%)',
  overcooked: 'radial-gradient(circle at 35% 30%, #fff6 0 18%, #ffc56e 40%, #f4a93f 85%)',
};

const EMPTY = { name: '', email: '', phone: '', size: '4cm', material: 'aldente', attachment: 'keyring', quantity: 1, notes: '', privacy: false };

export default function OrderModal({ open, onClose, items, library }) {
  const { t, label, slotLabel, money } = useI18n();
  const { assetsById, categoriesById, palette } = library;
  const [form, setForm] = useState(EMPTY);
  const [autoRotate, setAutoRotate] = useState(true);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', order: null, error: '' });
  const viewer = useRef(null);

  useEffect(() => {
    if (!open) return;
    setState({ status: 'idle', order: null, error: '' });
    setErrors({});
  }, [open]);

  const visibleItems = useMemo(() => items.filter((it) => !it.hidden && assetsById[it.assetId]), [items, assetsById]);
  const colorName = (hex) => label(palette.find((p) => p.hex.toLowerCase() === hex.toLowerCase())) || hex;

  // What the e-commerce needs to reproduce the charm.
  const design = useMemo(
    () =>
      visibleItems.map((it) => {
        const a = assetsById[it.assetId];
        return {
          category: label(categoriesById[it.categoryId]) || '—',
          assetId: a.id,
          assetName: label(a),
          colors: a.slots.map((s) => ({ slot: slotLabel(s), hex: it.colors[s.id] || s.original, name: colorName(it.colors[s.id] || s.original) })),
          transform: { x: it.x, y: it.y, scale: it.scale, rotation: it.rotation, stretchX: it.stretchX, stretchY: it.stretchY, flipX: it.flipX, flipY: it.flipY },
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleItems, assetsById, categoriesById, palette, label],
  );

  const size = CHARM_OPTIONS.sizes.find((s) => s.id === form.size);
  const material = CHARM_OPTIONS.materials.find((m) => m.id === form.material);
  const unitPrice = (size?.price || 0) + (material?.surcharge || 0);
  const total = unitPrice * form.quantity;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('order.err.name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('order.err.email');
    if (!(form.quantity >= 1 && form.quantity <= 50)) e.quantity = t('order.err.qty');
    if (!form.privacy) e.privacy = t('order.err.privacy');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const previewImage = async () => {
    try {
      const shot = viewer.current?.snapshot();
      if (shot && shot.length > 1000) return shot;
    } catch {
      /* fall back to 2D */
    }
    const { svg, width, height } = buildStickerSvg(visibleItems, assetsById, { outline: { enabled: true, color: '#ffffff', width: 22 } });
    return blobToDataUrl(await svgToPngBlob(svg, width, height, 600));
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
          material: form.material,
          attachment: form.attachment,
          quantity: Number(form.quantity),
          unitPrice,
          total,
          currency: 'EUR',
          notes: form.notes.trim(),
        },
        design,
        preview: await previewImage(),
      });
      setState({ status: 'done', order, error: '' });
      setForm(EMPTY);
    } catch (e) {
      setState({ status: 'idle', order: null, error: e.status ? t('order.sendFailed', { status: e.status }) : e.message });
    }
  };

  const field = 'mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink';
  const Err = ({ k }) => (errors[k] ? <span className="mt-1 block text-xs text-brand-dark">{errors[k]}</span> : null);

  return (
    <Modal open={open} onClose={onClose} title={t('order.title')} size="xl">
      {state.status === 'done' ? (
        <div className="mx-auto max-w-md py-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-basil text-white">
            <Icon name="check" className="h-7 w-7" strokeWidth={3} />
          </div>
          <h3 className="font-display text-2xl font-extrabold">{t('order.doneTitle')}</h3>
          <p className="mt-2 text-muted">
            {t('order.doneCode', { code: state.order.id })} {state.order.status === 'sent' ? t('order.doneSent') : t('order.doneLocal')}
          </p>
          {state.order.preview && <img src={state.order.preview} alt="" className="mx-auto mt-4 max-h-56 rounded-2xl" />}
          <Button variant="secondary" className="mt-6" onClick={onClose}>{t('order.back')}</Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-[#ecebe7]">
              <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted">{t('order.loading3d')}</div>}>
                {open && (
                  <Charm3DViewer
                    items={visibleItems}
                    assetsById={assetsById}
                    material={form.material}
                    autoRotate={autoRotate}
                    onReady={(api) => (viewer.current = api)}
                    className="h-full w-full"
                  />
                )}
              </Suspense>
              <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-muted">{t('order.preview3d')}</p>
            </div>
            <Toggle label={t('order.autoRotate')} checked={autoRotate} onChange={setAutoRotate} />

            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('order.material')}</legend>
              <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
                {CHARM_OPTIONS.materials.map((m) => (
                  <label
                    key={m.id}
                    className={`cursor-pointer rounded-2xl border-2 p-3 transition ${form.material === m.id ? 'border-ink bg-amber/25' : 'border-line bg-white hover:border-ink/40'}`}
                    data-testid={`material-${m.id}`}
                  >
                    <input type="radio" name="material" value={m.id} checked={form.material === m.id} onChange={set('material')} className="sr-only" />
                    <span className="flex items-center gap-2">
                      <span className="h-7 w-7 shrink-0 rounded-full border border-ink/15 shadow-inner" style={{ background: MATERIAL_SWATCH[m.id] }} />
                      <span className="font-display text-base font-bold leading-tight">{t(`order.materials.${m.id}.name`)}</span>
                    </span>
                    <span className="mt-1.5 block text-xs leading-snug text-muted">{t(`order.materials.${m.id}.desc`)}</span>
                    {m.surcharge > 0 && <span className="mt-1 block text-xs font-semibold">{t('order.surcharge', { price: money(m.surcharge) })}</span>}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('order.summary')}</h3>
              <ul className="space-y-1.5 text-sm">
                {design.map((d, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-1.5">
                    <span className="min-w-0">
                      <span className="text-[11px] uppercase tracking-wide text-muted">{d.category} · </span>
                      <span className="font-semibold">{d.assetName}</span>
                    </span>
                    <span className="flex shrink-0 gap-1">
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
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('order.product')} · {t('order.size')}</legend>
              <div className="grid grid-cols-3 gap-2">
                {CHARM_OPTIONS.sizes.map((s) => (
                  <label key={s.id} className={`cursor-pointer rounded-2xl border-2 p-3 text-center transition ${form.size === s.id ? 'border-ink bg-amber/30' : 'border-line bg-white hover:border-ink/40'}`}>
                    <input type="radio" name="size" value={s.id} checked={form.size === s.id} onChange={set('size')} className="sr-only" />
                    <span className="block font-display text-lg font-bold">{s.label}</span>
                    <span className="text-sm text-muted">{money(s.price)}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-sm font-medium">{t('order.attachment')}
                  <select className={field} value={form.attachment} onChange={set('attachment')}>
                    {CHARM_OPTIONS.attachments.map((a) => <option key={a.id} value={a.id}>{t(`order.attachments.${a.id}`)}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">{t('order.quantity')}
                  <input type="number" min={1} max={50} className={field} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(0, parseInt(e.target.value || '0', 10)) })} />
                  <Err k="quantity" />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('order.customer')}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">{t('order.name')}
                  <input className={field} value={form.name} onChange={set('name')} autoComplete="name" />
                  <Err k="name" />
                </label>
                <label className="text-sm font-medium">{t('order.email')}
                  <input type="email" className={field} value={form.email} onChange={set('email')} autoComplete="email" />
                  <Err k="email" />
                </label>
                <label className="text-sm font-medium sm:col-span-2">{t('order.phone')} <span className="font-normal text-muted">{t('order.optional')}</span>
                  <input className={field} value={form.phone} onChange={set('phone')} autoComplete="tel" />
                </label>
                <label className="text-sm font-medium sm:col-span-2">{t('order.notes')}
                  <textarea rows={2} className={field} value={form.notes} onChange={set('notes')} placeholder={t('order.notesPh')} />
                </label>
              </div>
              <label className="mt-3 flex items-start gap-2 text-sm">
                <input type="checkbox" checked={form.privacy} onChange={set('privacy')} className="mt-0.5 accent-brand" data-testid="privacy" />
                <span>{t('order.privacy')}<Err k="privacy" /></span>
              </label>
            </fieldset>

            {state.error && <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand-dark">{state.error}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-sm text-muted">
                {t('order.total')} <span className="ml-1 font-display text-2xl font-extrabold text-ink" data-testid="total">{money(total)}</span>
              </p>
              <Button type="submit" variant="basil" size="lg" disabled={state.status === 'sending' || !visibleItems.length} data-testid="order-submit">
                <Icon name="cart" /> {state.status === 'sending' ? t('order.sending') : t('order.submit')}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
