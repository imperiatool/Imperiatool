import AssetThumb from '../ui/AssetThumb.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useI18n } from '../../i18n/index.js';

/**
 * Guided element picker: numbered steps (Bodies → Eyes → Mouths…) with a
 * check when a step is done. It never jumps ahead by itself: people can try
 * every option of a step and move on with "Next" when they are ready.
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

  const required = steps.filter((c) => c.required);
  const doneCount = required.filter(done).length;
  const choose = (a) => addAsset(a, library);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="scroll-thin flex overflow-x-auto border-b border-line px-1" role="tablist">
        {steps.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => onStepChange?.(i)}
            className={`relative flex flex-1 shrink-0 items-center justify-center gap-1.5 px-2.5 py-3 text-sm transition ${
              i === index ? 'font-bold text-brand after:absolute after:inset-x-2 after:-bottom-px after:h-[3px] after:rounded-full after:bg-brand' : 'font-semibold text-ink/60 hover:text-ink'
            }`}
            data-testid={`step-${c.id}`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${
                done(c) ? 'bg-brand text-white' : i === index ? 'border-2 border-brand text-brand' : 'border border-ink/30 text-ink/60'
              }`}
            >
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
            className={`group relative flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition hover:-translate-y-0.5 hover:border-brand ${
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
      <div className="space-y-2 border-t border-line p-2.5">
        <div className="flex items-center gap-2 px-1 text-xs">
          <div className="flex gap-1" aria-hidden="true">
            {required.map((c) => (
              <span key={c.id} className={`h-1.5 w-6 rounded-full ${done(c) ? 'bg-brand' : 'bg-line'}`} />
            ))}
          </div>
          <span className={allDone ? 'font-bold text-brand' : 'text-muted'} data-testid="picker-progress">
            {allDone ? t('editor.allDone') : t('picker.progress', { done: doneCount, total: required.length })}
          </span>
        </div>
        {next ? (
          <Button variant={done(current) ? 'primary' : 'secondary'} className="w-full justify-center" onClick={() => onStepChange?.(index + 1)} data-testid="picker-next">
            {t('editor.next', { name: label(next) })} <Icon name="arrowRight" />
          </Button>
        ) : (
          !allDone && (
            <Button variant="secondary" className="w-full justify-center" onClick={() => onStepChange?.(steps.findIndex((c) => c.required && !done(c)))}>
              {t('picker.missing', { name: label(required.find((c) => !done(c))) })} <Icon name="arrowRight" />
            </Button>
          )
        )}
      </div>
    </div>
  );
}
