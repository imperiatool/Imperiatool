import { useI18n } from '../../i18n/index.js';

// decorative swatch suggesting each material
export const MATERIAL_SWATCH = {
  raw: 'radial-gradient(circle at 30% 30%, #f6e7bd, #dcc58e 70%), repeating-radial-gradient(circle, rgba(0,0,0,.06) 0 1px, transparent 1px 3px)',
  aldente: 'radial-gradient(circle at 30% 25%, #fff 0 8%, #ffb548 22%, #e89a2a 80%)',
  overcooked: 'radial-gradient(circle at 35% 30%, #fff8 0 18%, #ffc56e 40%, #f4a93f 85%)',
};

/** Big, self-explaining material cards (name, look, short description, price). */
export default function MaterialPicker({ options, value, onChange }) {
  const { t, money } = useI18n();
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('order.finish')}>
      {options.map((m) => (
        <label
          key={m.id}
          className={`min-w-0 cursor-pointer rounded-2xl border-2 p-2.5 transition ${value === m.id ? 'border-brand bg-brand/5' : 'border-line bg-white hover:border-brand/50'}`}
          data-testid={`material-${m.id}`}
        >
          <input type="radio" name="material" value={m.id} checked={value === m.id} onChange={() => onChange(m.id)} className="sr-only" />
          <span className="flex flex-col items-start gap-1.5">
            <span className="h-8 w-8 shrink-0 rounded-full border border-ink/10 shadow-inner" style={{ background: MATERIAL_SWATCH[m.id] }} />
            <span className="min-w-0 break-words font-display text-sm font-bold leading-tight">{t(`order.materials.${m.id}.name`)}</span>
          </span>
          <span className="mt-1.5 block text-xs leading-snug text-ink">{t(`order.materials.${m.id}.desc`)}</span>
          {m.surcharge > 0 && <span className="mt-1 block text-xs font-semibold">{t('order.surcharge', { price: money(m.surcharge) })}</span>}
        </label>
      ))}
    </div>
  );
}
