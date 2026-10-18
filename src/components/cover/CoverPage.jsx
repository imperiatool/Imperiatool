import { Suspense, lazy, useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Swatches from '../ui/Swatches.jsx';
import PatternIcon from './PatternIcon.jsx';
import MaterialPicker from '../order/MaterialPicker.jsx';
import CheckoutForm from '../order/CheckoutForm.jsx';
import { useCoverStore } from '../../store/useCoverStore.js';
import { useLibrary } from '../../hooks/useLibrary.js';
import { COVER_OPTIONS } from '../../data/defaults.js';
import { submitOrder } from '../../services/orderService.js';
import { useI18n } from '../../i18n/index.js';

const Viewer3D = lazy(() => import('../three/Viewer3D.jsx'));

function Step({ n, title, children }) {
  return (
    <section className="rounded-3xl border-2 border-ink/10 bg-paper p-4">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-sm text-cream">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function CoverPage() {
  const { t, label, money } = useI18n();
  const { palette } = useLibrary();
  const cover = useCoverStore();
  const viewer = useRef(null);
  const [ordering, setOrdering] = useState(false);
  const [snapshot, setSnapshot] = useState(null);

  const material = COVER_OPTIONS.materials.find((m) => m.id === cover.material);
  const unitPrice = COVER_OPTIONS.basePrice + (material?.surcharge || 0);
  const colorEntry = palette.find((p) => p.hex.toLowerCase() === cover.color.toLowerCase());
  const model = COVER_OPTIONS.models.find((m) => m.id === cover.model);

  const randomize = () => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    cover.set({ pattern: pick(COVER_OPTIONS.patterns), color: pick(palette).hex, material: pick(COVER_OPTIONS.materials).id });
  };

  const openOrder = () => {
    setSnapshot(viewer.current?.snapshot?.() || null);
    setOrdering(true);
  };

  const summary = `${t(`cover.p.${cover.pattern}`)} · ${label(colorEntry) || cover.color} · ${t(`order.materials.${cover.material}.name`)}`;

  return (
    <div className="grid lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_440px]">
      {/* 3D preview */}
      <section className="relative h-[58vh] min-h-80 bg-[#efe9df] lg:h-auto">
        <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted">{t('order.loading3d')}</div>}>
          <Viewer3D kind="cover" cover={{ pattern: cover.pattern, color: cover.color, material: cover.material }} onReady={(api) => (viewer.current = api)} className="h-full w-full" />
        </Suspense>
        <div className="pointer-events-none absolute left-4 top-4 max-w-xs sm:left-6 sm:top-6">
          <h1 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{t('cover.title')}</h1>
          <p className="mt-1 hidden text-sm text-muted sm:block">{t('cover.subtitle')}</p>
        </div>
      </section>

      {/* options */}
      <aside className="flex min-h-0 flex-col border-ink/10 bg-cream lg:border-l-2">
        <div className="scroll-thin flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
          <Step n={1} title={t('cover.step.pattern')}>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('cover.step.pattern')}>
              {COVER_OPTIONS.patterns.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={cover.pattern === p}
                  onClick={() => cover.set({ pattern: p })}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-center transition ${cover.pattern === p ? 'border-ink bg-white shadow-[0_3px_0_0_#3a1f1b]' : 'border-line bg-white/60 hover:border-ink/40'}`}
                  data-testid={`pattern-${p}`}
                >
                  <PatternIcon pattern={p} color={cover.color} className="h-16 w-9" />
                  <span className="text-sm font-bold leading-tight">{t(`cover.p.${p}`)}</span>
                  <span className="text-[11px] leading-tight text-muted">{t(`cover.pd.${p}`)}</span>
                </button>
              ))}
            </div>
          </Step>

          <Step n={2} title={t('cover.step.color')}>
            <Swatches palette={palette} value={cover.color} onPick={(hex) => cover.set({ color: hex })} size="h-11 w-11" />
            <p className="mt-2 text-sm font-semibold">{label(colorEntry)}</p>
          </Step>

          <Step n={3} title={t('cover.step.material')}>
            <MaterialPicker options={COVER_OPTIONS.materials} value={cover.material} onChange={(m) => cover.set({ material: m })} />
          </Step>

          <Step n={4} title={t('cover.step.model')}>
            <select
              value={cover.model}
              onChange={(e) => cover.set({ model: e.target.value })}
              className="w-full rounded-xl border-2 border-line bg-white px-3 py-3 text-base font-semibold"
              data-testid="phone-model"
            >
              {COVER_OPTIONS.models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </Step>
        </div>

        {/* sticky price + CTA */}
        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t-2 border-ink/10 bg-paper p-3 sm:flex-nowrap sm:p-4">
          <Button size="icon" variant="outline" onClick={randomize} title={t('editor.randomize')} aria-label={t('editor.randomize')}>
            <Icon name="dice" className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{summary}</p>
            <p className="font-display text-2xl font-extrabold leading-none">{money(unitPrice)}</p>
          </div>
          <Button variant="basil" size="lg" className="w-full justify-center sm:w-auto" onClick={openOrder} data-testid="cover-order">
            <Icon name="cart" /> {t('cover.order')}
          </Button>
        </div>
      </aside>

      <Modal open={ordering} onClose={() => setOrdering(false)} title={t('cover.orderTitle')} size="lg">
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div>
            {snapshot && <img src={snapshot} alt="" className="w-full rounded-2xl" />}
            <p className="mt-2 text-sm font-semibold">{summary}</p>
            <p className="text-sm text-muted">{model?.label}</p>
          </div>
          <CheckoutForm
            unitPrice={unitPrice}
            onDone={() => setOrdering(false)}
            onSubmit={({ customer, quantity, notes, total }) =>
              submitOrder({
                customer,
                product: {
                  type: 'phone-cover',
                  pattern: cover.pattern,
                  color: cover.color,
                  colorName: label(colorEntry),
                  material: cover.material,
                  model: cover.model,
                  quantity,
                  unitPrice,
                  total,
                  currency: 'EUR',
                  notes,
                },
                preview: snapshot,
              })
            }
          />
        </div>
      </Modal>
    </div>
  );
}
