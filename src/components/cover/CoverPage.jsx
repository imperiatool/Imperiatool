import { useRef, useState } from 'react';
import Safe3D from '../three/Safe3D.jsx';
import { lazyRetry } from '../../lib/lazyRetry.js';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import PatternIcon from './PatternIcon.jsx';
import MaterialPicker from '../order/MaterialPicker.jsx';
import SpecList from '../order/SpecList.jsx';
import { useCoverStore } from '../../store/useCoverStore.js';
import { useLibrary } from '../../hooks/useLibrary.js';
import { COVER_OPTIONS } from '../../data/defaults.js';
import { COLOR_LABELS } from '../../data/labels.js';
import PageHeader from '../layout/PageHeader.jsx';
import PreviewHint from '../ui/PreviewHint.jsx';
import { useCartStore } from '../../store/useCartStore.js';
import { useI18n } from '../../i18n/index.js';
import { useMeta } from '../../lib/useMeta.js';

const Viewer3D = lazyRetry(() => import('../three/Viewer3D.jsx'), 'viewer3d');

function Option({ title, value, children }) {
  return (
    <section className="border-t border-line py-4 first:border-t-0">
      <h2 className="mb-3 text-sm">
        <span className="font-semibold">{title}</span>
        {value && <span className="text-ink"> · {value}</span>}
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
      <span className={`text-center text-xs leading-tight ${active ? 'font-semibold text-brand' : 'text-ink'}`}>{label}</span>
    </button>
  );
}

export default function CoverPage() {
  const { t, label, money } = useI18n();
  const { palette } = useLibrary();
  useMeta({
    title: `Imperia® ${t('home.case.title')}`,
    description: t('meta.case.desc'),
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `Imperia® ${t('home.case.title')}`,
      brand: { '@type': 'Brand', name: 'Imperia' },
      description: t('meta.case.desc'),
      category: t('home.case.title'),
      color: palette.map((c) => label(c)),
      material: ['raw', 'aldente', 'overcooked'].map((m) => `${t(`order.materials.${m}.name`)}: ${t(`spec.material.${m}`)}`),
      additionalProperty: COVER_OPTIONS.patterns.map((p) => ({ '@type': 'PropertyValue', name: t('spec.pattern'), value: t(`cover.p.${p}`) })),
    },
  });
  const cover = useCoverStore();
  const addToCart = useCartStore((s) => s.add);
  const viewer = useRef(null);
  const [view, setView] = useState('case'); // 'case' | 'packaging'

  const finish = COVER_OPTIONS.materials.find((m) => m.id === cover.material);
  // EUR parts (converted one by one, see convertPrice)
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

  const summary = `${label(colorEntry) || cover.color} · ${t(`order.materials.${cover.material}.name`)} · ${model.label}`;
  const add = () =>
    addToCart({
      type: 'case',
      title: `Imperia® ${t('cover.productName', { pattern: patternName })}`,
      summary,
      preview: viewer.current?.snapshot?.(0.8, 360) || null,
      price: unitPrice,
      config: { pattern: cover.pattern, color: cover.color, colorName: label(colorEntry), finish: cover.material, model: model.id },
    });

  return (
    <div className="flex min-h-full flex-col pb-24 lg:h-full lg:pb-0">
      <PageHeader title={t('cover.pageTitle')} subtitle={t('cover.subtitle')} className="border-b border-line px-4 py-4 sm:px-6" />
      <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_440px]">
        {/* 3D preview: the product centred, hint underneath */}
        <section className="flex h-[62svh] min-h-[22rem] flex-col bg-studio lg:h-auto lg:min-h-0">
          <div className="flex justify-center pt-3">
            <div className="flex rounded-full border border-line bg-white p-0.5 text-sm" role="tablist" aria-label={t('viewer.show')}>
              {['case', 'packaging'].map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={`rounded-full px-4 py-1.5 font-medium transition ${view === v ? 'bg-brand text-white' : 'text-ink/70 hover:text-ink'}`}
                  data-testid={`view-${v}`}
                >
                  {t(`viewer.${v}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0">
              <Safe3D fallback={<div className="grid h-full place-items-center text-sm text-muted">{t('order.loading3d')}</div>}>
                <Viewer3D kind={view === 'packaging' ? 'packaging' : 'cover'} cover={scene} hint={false} onReady={(api) => (viewer.current = api)} className="h-full w-full" />
              </Safe3D>
            </div>
          </div>
          <PreviewHint className="pb-3">{t('viewer.hint3d')}</PreviewHint>
        </section>

        {/* options */}
        <aside className="flex min-h-0 flex-col bg-white lg:border-l lg:border-line">
          <div className="scroll-thin flex-1 px-4 py-2 sm:px-6 lg:overflow-y-auto">
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
                  <Circle key={c.id} active={c.hex.toLowerCase() === cover.color.toLowerCase()} onClick={() => cover.set({ color: c.hex })} label={label(c)} testid={`color-${c.id}`}>
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
                  className="w-full appearance-none rounded-full border border-line bg-white px-4 py-3 pr-10 text-base font-medium focus:border-brand focus:outline-none"
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
              <div className="mt-4">
                <SpecList
                  testid="case-specs"
                  rows={[
                    ['spec.product', `Imperia® ${t('cover.productName', { pattern: patternName })}`],
                    ['spec.pattern', patternName],
                    ['spec.colour', label(colorEntry) || cover.color],
                    ['spec.finish', t(`order.materials.${cover.material}.name`)],
                    ['spec.material', t(`spec.material.${cover.material}`)],
                    ['spec.compatibility', model.label],
                    ['spec.protection', t(`spec.protection.${cover.material}`)],
                  ]}
                />
              </div>
            </Option>
          </div>

          {/* action bar: fixed at the bottom on phones, end of the panel on desktop */}
          <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-line bg-white/95 p-3 backdrop-blur lg:static lg:p-4">
            <Button size="icon" variant="secondary" onClick={randomize} title={t('editor.randomize')} aria-label={t('editor.randomize')} className="shrink-0">
              <Icon name="dice" className="h-5 w-5" />
            </Button>
            <Button variant="primary" size="lg" className="flex-1 justify-center" onClick={add} data-testid="cover-order">
              <Icon name="bag" /> {t('cart.add')} · {money(unitPrice)}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
