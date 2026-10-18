import { Suspense, lazy, useMemo, useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import CheckoutForm from '../order/CheckoutForm.jsx';
import MaterialPicker from '../order/MaterialPicker.jsx';
import { CHARM_OPTIONS } from '../../data/defaults.js';
import { buildStickerSvg, svgToPngBlob, blobToDataUrl } from '../../lib/exportImage.js';
import { submitOrder } from '../../services/orderService.js';
import { useI18n } from '../../i18n/index.js';

// Three.js is only downloaded when a 3D view opens.
const Viewer3D = lazy(() => import('../three/Viewer3D.jsx'));

export default function OrderModal({ open, onClose, items, library }) {
  const { t, label, slotLabel, money } = useI18n();
  const { assetsById, categoriesById, palette } = library;
  const [material, setMaterial] = useState('aldente');
  const [size, setSize] = useState('4cm');
  const [attachment, setAttachment] = useState('keyring');
  const viewer = useRef(null);

  const visibleItems = useMemo(() => items.filter((it) => !it.hidden && assetsById[it.assetId]), [items, assetsById]);
  const colorName = (hex) => label(palette.find((p) => p.hex.toLowerCase() === hex.toLowerCase())) || hex;

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

  const sizeOpt = CHARM_OPTIONS.sizes.find((s) => s.id === size);
  const matOpt = CHARM_OPTIONS.materials.find((m) => m.id === material);
  const unitPrice = (sizeOpt?.price || 0) + (matOpt?.surcharge || 0);

  const previewImage = async () => {
    const shot = viewer.current?.snapshot?.();
    if (shot && shot.length > 1000) return shot;
    const { svg, width, height } = buildStickerSvg(visibleItems, assetsById, { outline: { enabled: false } });
    return blobToDataUrl(await svgToPngBlob(svg, width, height, 600));
  };

  const onSubmit = async ({ customer, quantity, notes, total }) =>
    submitOrder({
      customer,
      product: { type: 'charm-3d', size, material, attachment, quantity, unitPrice, total, currency: 'EUR', notes },
      design,
      preview: await previewImage(),
    });

  return (
    <Modal open={open} onClose={onClose} title={t('order.title')} size="xl">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-[#efe9df]">
            <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted">{t('order.loading3d')}</div>}>
              {open && (
                <Viewer3D kind="charm" items={visibleItems} assetsById={assetsById} material={material} onReady={(api) => (viewer.current = api)} className="h-full w-full" />
              )}
            </Suspense>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('order.material')}</h3>
            <MaterialPicker options={CHARM_OPTIONS.materials} value={material} onChange={setMaterial} />
          </div>
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

        <CheckoutForm unitPrice={unitPrice} onSubmit={onSubmit} onDone={onClose} disabled={!visibleItems.length}>
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('order.size')}</legend>
            <div className="grid grid-cols-3 gap-2">
              {CHARM_OPTIONS.sizes.map((s) => (
                <label key={s.id} className={`cursor-pointer rounded-2xl border-2 p-3 text-center transition ${size === s.id ? 'border-ink bg-amber/30' : 'border-line bg-white hover:border-ink/40'}`}>
                  <input type="radio" name="size" value={s.id} checked={size === s.id} onChange={() => setSize(s.id)} className="sr-only" />
                  <span className="block font-display text-lg font-bold">{s.label}</span>
                  <span className="text-sm text-muted">{money(s.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-medium">{t('order.attachment')}
            <select className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5" value={attachment} onChange={(e) => setAttachment(e.target.value)}>
              {CHARM_OPTIONS.attachments.map((a) => <option key={a.id} value={a.id}>{t(`order.attachments.${a.id}`)}</option>)}
            </select>
          </label>
        </CheckoutForm>
      </div>
    </Modal>
  );
}
