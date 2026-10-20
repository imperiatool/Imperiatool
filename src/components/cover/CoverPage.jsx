import { Suspense, lazy, useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import PatternIcon from './PatternIcon.jsx';
import MaterialPicker from '../order/MaterialPicker.jsx';
import CheckoutForm from '../order/CheckoutForm.jsx';
import { useCoverStore } from '../../store/useCoverStore.js';
import { useLibrary } from '../../hooks/useLibrary.js';
import { COVER_OPTIONS } from '../../data/defaults.js';
import { COLOR_LABELS } from '../../data/labels.js';
import { submitOrder } from '../../services/orderService.js';
import { useI18n } from '../../i18n/index.js';

const Viewer3D = lazy(() => import('../three/Viewer3D.jsx'));

function Option({ title, value, children }) {
  return (
    <section className="border-t border-line py-4 first:border-t-0">
      <h2 className="mb-3 text-sm">
        <span className="font-bold">{title}</span>
        {value && <span className="text-muted"> · {value}</span>}
      </h2>
      {children}
    </section>
  );
}

/** Round choice with its name underneath (patterns and colours look the same). */
function Circle({ active, onClick, label, children, testid }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="group flex w-16 flex-col items-center gap-1.5 sm:w-[4.5rem]"
      data-testid={testid}
    >
      <span className={`grid rounded-full p-[3px] transition ${active ? 'ring-2 ring-brand' : 'ring-1 ring-transparent group-hover:ring-line'}`}>
        {children}
      </span>
      <span className={`text-center text-xs leading-tight ${active ? 'font-bold text-brand' : 'text-ink/80'}`}>{label}</span>
    </button>
  );
}

export default function CoverPage() {
  const { t, label, money } = useI18n();
  const { palette } = useLibrary();
  const cover = useCoverStore();
  const viewer = useRef(null);
  const [ordering, setOrdering] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [view, setView] = useState('case'); // 'case' | 'packaging'

  const finish = COVER_OPTIONS.materials.find((m) => m.id === cover.material);
  // EUR parts: base + finish surcharge (converted one by one, see convertPrice)
  const unitPrice = [COVER_OPTIONS.basePrice, finish?.surcharge || 0];
  const colorEntry = palette.find((p) => p.hex.toLowerCase() === cover.color.toLowerCase());
  const model = COVER_OPTIONS.models.find((m) => m.id === cover.model) || COVER_OPTIONS.models[0];
  const patternName = t(`cover.p.${cover.pattern}`);

  const scene = {
    pattern: cover.pattern,
    color: cover.color,
    material: cover.material,
    model: model.id,
    // printed on the box (in English, like the real packaging)
    colorId: colorEntry?.id,
    colorName: colorEntry?.labels?.en || COLOR_LABELS[colorEntry?.id]?.en || colorEntry?.name || cover.color,
    modelLabel: model.label,
  };

  const randomize = () => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    cover.set({ pattern: pick(COVER_OPTIONS.patterns), color: pick(palette).hex, material: pick(COVER_OPTIONS.materials).id });
  };

  const openOrder = () => {
    setSnapshot(viewer.current?.snapshot?.() || null);
    setOrdering(true);
  };

  const summary = `${patternName} · ${label(colorEntry) || cover.color} · ${t(`order.materials.${cover.material}.name`)} · ${model.label}`;

  return (
    <div className="grid lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_460px]">
      {/* 3D preview: title above, hint below, the product centred between them */}
      <section className="flex h-[68svh] min-h-[26rem] flex-col bg-studio lg:h-auto lg:min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 sm:px-6 sm:pt-5">
          <h1 className="font-display text-lg font-bold leading-tight sm:text-xl">{t('cover.title')}</h1>
          <div className="flex rounded-full border border-line bg-white p-0.5 text-sm" role="tablist" aria-label={t('viewer.show')}>
            {['case', 'packaging'].map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-full px-3.5 py-1.5 font-bold transition ${view === v ? 'bg-brand text-white' : 'text-ink/70 hover:text-ink'}`}
                data-testid={`view-${v}`}
              >
                {t(`viewer.${v}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0">
            <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted">{t('order.loading3d')}</div>}>
              <Viewer3D
                kind={view === 'packaging' ? 'packaging' : 'cover'}
                cover={scene}
                hint={false}
                onReady={(api) => (viewer.current = api)}
                className="h-full w-full"
              />
            </Suspense>
          </div>
        </div>
        <p className="pb-4 text-center text-xs font-medium text-muted sm:pb-5">{t('order.preview3d')}</p>
      </section>

      {/* product page */}
      <aside className="flex min-h-0 flex-col bg-white lg:border-l lg:border-line">
        <div className="scroll-thin flex-1 overflow-y-auto px-4 pb-4 pt-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('cover.kicker')}</p>
          <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-brand sm:text-[28px]" data-testid="case-title">
            Imperia® {t('cover.productName', { pattern: patternName })}
          </h2>
          <p className="mt-2 font-display text-2xl font-bold" data-testid="case-price">
            {money(unitPrice)}
          </p>
          <p className="mt-1 text-sm text-muted">{t('cover.subtitle')}</p>

          <div className="mt-4">
            <Option title={t('cover.step.pattern')} value={patternName}>
              <div className="flex flex-wrap gap-x-2 gap-y-3" role="radiogroup" aria-label={t('cover.step.pattern')}>
                {COVER_OPTIONS.patterns.map((p) => (
                  <Circle key={p} active={cover.pattern === p} onClick={() => cover.set({ pattern: p })} label={t(`cover.p.${p}`)} testid={`pattern-${p}`}>
                    <PatternIcon pattern={p} color={cover.color} className="h-12 w-12 sm:h-14 sm:w-14" />
                  </Circle>
                ))}
              </div>
            </Option>

            <Option title={t('cover.step.color')} value={label(colorEntry)}>
              <div className="flex flex-wrap gap-x-2 gap-y-3" role="radiogroup" aria-label={t('cover.step.color')}>
                {palette.map((c) => (
                  <Circle
                    key={c.id}
                    active={c.hex.toLowerCase() === cover.color.toLowerCase()}
                    onClick={() => cover.set({ color: c.hex })}
                    label={label(c)}
                    testid={`color-${c.id}`}
                  >
                    <span className="block h-12 w-12 rounded-full border border-ink/10 sm:h-14 sm:w-14" style={{ background: c.hex }} />
                  </Circle>
                ))}
              </div>
            </Option>

            <Option title={t('cover.step.finish')} value={t(`order.materials.${cover.material}.name`)}>
              <MaterialPicker options={COVER_OPTIONS.materials} value={cover.material} onChange={(m) => cover.set({ material: m })} />
            </Option>

            <Option title={t('cover.step.model')}>
              <div className="relative">
                <select
                  value={model.id}
                  onChange={(e) => cover.set({ model: e.target.value })}
                  className="w-full appearance-none rounded-full border border-line bg-white px-4 py-3 pr-10 text-base font-semibold focus:border-brand focus:outline-none"
                  data-testid="phone-model"
                >
                  {COVER_OPTIONS.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <Icon name="down" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
            </Option>
          </div>
        </div>

        {/* sticky CTA */}
        <div className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-white/95 p-3 backdrop-blur sm:p-4">
          <Button size="icon" variant="secondary" onClick={randomize} title={t('editor.randomize')} aria-label={t('editor.randomize')} className="shrink-0">
            <Icon name="dice" className="h-5 w-5" />
          </Button>
          <Button variant="primary" size="lg" className="flex-1 justify-center" onClick={openOrder} data-testid="cover-order">
            {t('cover.order')} · {money(unitPrice)}
          </Button>
        </div>
      </aside>

      <Modal open={ordering} onClose={() => setOrdering(false)} title={t('cover.orderTitle')} size="lg">
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div>
            {snapshot && <img src={snapshot} alt="" className="w-full rounded-2xl" />}
            <p className="mt-2 text-sm font-bold text-brand">Imperia® {t('cover.productName', { pattern: patternName })}</p>
            <p className="text-sm text-muted">{summary}</p>
          </div>
          <CheckoutForm
            unitPrice={unitPrice}
            onDone={() => setOrdering(false)}
            onSubmit={({ customer, quantity, notes, total, unitPrice: unitLocal, currency }) =>
              submitOrder({
                customer,
                product: {
                  type: 'phone-case',
                  pattern: cover.pattern,
                  color: cover.color,
                  colorName: label(colorEntry),
                  finish: cover.material,
                  model: cover.model,
                  quantity,
                  unitPrice: unitLocal,
                  total,
                  currency,
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
