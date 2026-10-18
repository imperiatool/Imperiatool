import AssetThumb from '../ui/AssetThumb.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useI18n } from '../../i18n/index.js';

/**
 * Guided element picker: numbered steps (Bodies → Eyes → Mouths…), a check
 * when a step is done, and automatic move to the next step after a choice.
 */
export default function AssetPicker({ library, step = 0, onStepChange }) {
  const { t, label } = useI18n();
  const { categories, assets } = library;
  const steps = categories.filter((c) => assets.some((a) => a.categoryId === c.id));
  const items = useEditorStore((s) => s.items);
  const addAsset = useEditorStore((s) => s.addAsset);

  if (!steps.length) return <p className="p-4 text-sm text-muted">{t('picker.empty')}</p>;
  const index = Math.min(step, steps.length - 1);
  const current = steps[index];
  const list = assets.filter((a) => a.categoryId === current.id);
  const usedIds = new Set(items.map((i) => i.assetId));
  const done = (c) => items.some((i) => i.categoryId === c.id);
  const next = steps[index + 1];
  const allDone = steps.filter((c) => c.required).every(done);

  const choose = (a) => {
    addAsset(a, library);
    if (!current.multiple && next) onStepChange?.(index + 1); // go on by itself
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="scroll-thin flex gap-1 overflow-x-auto border-b border-line p-2" role="tablist">
        {steps.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => onStepChange?.(i)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-bold transition ${
              i === index ? 'bg-ink text-cream' : 'text-ink hover:bg-ink/5'
            }`}
          >
            <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${done(c) ? 'bg-basil text-white' : i === index ? 'bg-cream/20' : 'bg-ink/10'}`}>
              {done(c) ? <Icon name="check" className="h-3 w-3" strokeWidth={3} /> : i + 1}
            </span>
            {label(c)}
          </button>
        ))}
      </div>
      <div className="scroll-thin grid flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto p-3 lg:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => choose(a)}
            title={t(current.multiple ? 'picker.add' : 'picker.use', { name: label(a) })}
            className={`group relative flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition hover:-translate-y-0.5 hover:border-ink ${
              usedIds.has(a.id) ? 'border-brand bg-brand/5' : 'border-line bg-white'
            }`}
          >
            {usedIds.has(a.id) && (
              <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                <Icon name="check" className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
            <AssetThumb asset={a} className="h-16 w-full" />
            <span className="w-full text-center text-xs font-semibold leading-tight text-ink">{label(a)}</span>
          </button>
        ))}
      </div>
      <div className="border-t border-line p-2.5">
        {next ? (
          <Button variant={done(current) ? 'secondary' : 'outline'} className="w-full justify-center" onClick={() => onStepChange?.(index + 1)}>
            {t('editor.next', { name: label(next) })} <Icon name="arrowRight" />
          </Button>
        ) : (
          <p className="px-1 text-xs text-muted">{allDone ? t('editor.allDone') : t(current.multiple ? 'picker.hintMultiple' : 'picker.hintSingle')}</p>
        )}
      </div>
    </div>
  );
}
