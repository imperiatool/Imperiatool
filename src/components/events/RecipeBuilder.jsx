import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import { useI18n } from '../../i18n/index.js';
import { INGREDIENTS, RECIPE_PASTAS, matchRecipe, suggestRecipe, recipesFor } from '../../data/recipes.js';
import { tx } from '../../data/events.js';
import DishPhoto from './DishPhoto.jsx';

// 3D ingredients (rendered with the app's studio, scripts/render-ingredients.py)
const ING_IMG = Object.fromEntries(
  Object.entries(import.meta.glob('../../assets/ingredients/*.webp', { eager: true, import: 'default' })).map(([k, v]) => [k.split('/').pop().replace('.webp', ''), v]),
);
// places around the pasta on the plate (%, centre of each ingredient)
const SPOTS = [
  [33, 33], [67, 33], [67, 67], [33, 67], [50, 27], [50, 74], [27, 50], [73, 50], [41, 41], [59, 59], [50, 50],
];

/**
 * Free-event extra: choose a pasta and a couple of ingredients (picked like the
 * colours of the configurators and placed in 3D on the plate) and learn a real
 * Italian recipe: the traditional dish they make, or the closest one with what
 * is missing, its ingredients and method. Combinations that are not a
 * recognised dish are called creative variations, never tradition.
 */
export default function RecipeBuilder() {
  const { t, lang } = useI18n();
  const [pasta, setPasta] = useState(null);
  const [chosen, setChosen] = useState([]);
  const toggle = (id) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const use = (r) => {
    setPasta(r.pasta);
    setChosen([...r.need]);
  };
  const result = matchRecipe(pasta, chosen);
  const exact = result?.kind === 'traditional' ? result.recipe : null;
  const suggestion = !exact && pasta ? suggestRecipe(pasta, chosen) : null;
  const pastaInfo = RECIPE_PASTAS.find((p) => p.id === pasta);
  const name = (id) => tx(INGREDIENTS.find((i) => i.id === id)?.name, lang);
  // inside a sentence: lower case, except names of protected cheeses
  const inText = (id) => (['pecorino', 'parmigiano'].includes(id) || lang === 'de' ? name(id) : name(id).toLocaleLowerCase(lang));
  const list = (ids) => ids.map(inText).join(', ');
  // culturally specific ingredients get a short explanation (Italian readers know them)
  const withNote = (id) => {
    const n = INGREDIENTS.find((i) => i.id === id)?.note;
    return n && lang !== 'it' ? `${name(id)} (${tx(n, lang)})` : name(id);
  };
  // the dish in the visitor's language (Italian keeps its own name)
  const dish = (r) => tx(r.title, lang) || r.name;
  const pastaName = (id) => tx(RECIPE_PASTAS.find((p) => p.id === id)?.name, lang);
  const shown = exact || (chosen.length ? suggestion?.recipe : null);
  const extras = shown ? chosen.filter((i) => !shown.need.includes(i) && !shown.may.includes(i)) : [];

  const method = (r) => (
    <>
      {r.history && (
        <p className="mt-3 text-sm leading-relaxed" data-testid="recipe-history">
          <span className="font-bold">{t('recipe.history')}:</span> {tx(r.history, lang)}
        </p>
      )}
      <p className="mt-3 text-sm">
        <span className="font-bold">{t('recipe.ingredients')}:</span>{' '}
        {[pastaName(r.pasta), ...r.need.map((i) => (chosen.includes(i) || r.pasta !== pasta ? withNote(i) : `${withNote(i)}, ${t('recipe.toAdd')}`)), ...r.may.filter((i) => chosen.includes(i)).map(withNote)].join('; ')}
      </p>
      <h4 className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">{t('recipe.method')}</h4>
      <ol className="mt-1.5 space-y-1.5 text-sm">
        {r.steps.map((s, n) => (
          <li key={n} className="flex gap-2.5">
            <span className="w-5 shrink-0 font-bold tabular-nums text-brand">{String(n + 1).padStart(2, '0')}</span>
            {tx(s, lang)}
          </li>
        ))}
      </ol>
    </>
  );

  return (
    <section id="recipe-builder" className="mt-10 scroll-mt-28 rounded-2xl border border-line p-4 sm:p-5" data-testid="recipe-builder">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{t('recipe.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('recipe.intro')}</p>
        </div>
        {(pasta || chosen.length > 0) && (
          <button type="button" onClick={() => (setPasta(null), setChosen([]))} className="shrink-0 text-sm font-medium underline underline-offset-4 hover:text-brand" data-testid="recipe-reset">
            {t('recipe.reset')}
          </button>
        )}
      </div>

      {/* 1 · pasta */}
      <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">{t('recipe.step.pasta')}</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2" role="radiogroup" aria-label={t('recipe.step.pasta')}>
        {RECIPE_PASTAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={pasta === p.id}
            onClick={() => setPasta(p.id)}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition ${pasta === p.id ? 'border-brand bg-brand/5' : 'border-line hover:border-brand/50'}`}
            data-testid={`recipe-pasta-${p.id}`}
          >
            <img src={p.img} alt="" className="h-12 w-full object-contain" />
            <span className="w-full truncate text-center text-[11px] leading-tight">{tx(p.name, lang)}</span>
          </button>
        ))}
      </div>

      {/* 2 · ingredients as colours */}
      <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">{t('recipe.step.ingredients')}</h3>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('recipe.step.ingredients')}>
        {INGREDIENTS.map((i) => {
          const on = chosen.includes(i.id);
          return (
            <button
              key={i.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(i.id)}
              className={`inline-flex h-9 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[13px] transition ${on ? 'border-brand bg-brand/5 font-semibold' : 'border-line hover:border-ink/40'}`}
              data-testid={`recipe-ing-${i.id}`}
            >
              <span className={`h-7 w-7 rounded-full border border-ink/10 ${on ? 'ring-2 ring-brand ring-offset-1' : ''}`} style={{ background: i.hex }} />
              {tx(i.name, lang)}
            </button>
          );
        })}
      </div>

      {/* 3 · the plate (3D ingredients appear as they are picked) and the recipe */}
      <div className="mt-6 grid gap-5 sm:grid-cols-[190px_minmax(0,1fr)]" aria-live="polite">
        <div className="relative mx-auto aspect-square w-[190px] rounded-full bg-white shadow-[0_8px_28px_rgba(0,0,0,0.13),inset_0_0_0_12px_#f6f6f6]" data-testid="recipe-plate">
          {pastaInfo && <img src={pastaInfo.img} alt={tx(pastaInfo.name, lang)} className="absolute inset-[24%] h-[52%] w-[52%] object-contain" />}
          {chosen.map((id, n) => {
            const [x, y] = SPOTS[n % SPOTS.length];
            return (
              <img
                key={id}
                src={ING_IMG[id]}
                alt={name(id)}
                title={name(id)}
                className="recipe-pop absolute h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-sm"
                style={{ left: `${x}%`, top: `${y}%` }}
                data-testid={`plate-${id}`}
              />
            );
          })}
        </div>

        <div className="min-w-0" data-testid="recipe-result">
          {!pasta ? (
            <p className="text-sm text-muted">{t('recipe.pick')}</p>
          ) : !chosen.length ? (
            // just a pasta: the recipes to learn with it
            <>
              <p className="text-sm text-muted">{recipesFor(pasta)[0].pasta === pasta ? t('recipe.withPasta', { pasta: pastaName(pasta) }) : t('recipe.otherPasta', { pasta: pastaName(pasta) })}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recipesFor(pasta).map((r) => (
                  <button key={r.id} type="button" onClick={() => use(r)} className="rounded-full border border-line px-3 py-1.5 text-[13px] font-semibold hover:border-brand hover:text-brand" data-testid={`recipe-try-${r.id}`}>
                    {dish(r)}
                  </button>
                ))}
              </div>
            </>
          ) : shown ? (
            <>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${exact && !extras.length ? 'bg-brand text-white' : 'bg-cream text-ink/70'}`}
                data-testid="recipe-kind"
              >
                {exact ? t('recipe.traditional') : !suggestion.missing.length && extras.length ? t('recipe.variation') : t('recipe.suggested')}
              </span>
              <h3 className="mt-2 text-lg font-bold leading-tight" data-testid="recipe-name">
                {shown.name}
              </h3>
              {lang !== 'it' && <p className="text-sm text-ink/80" data-testid="recipe-title">{dish(shown)}</p>}
              {!exact && (
                <div className="mt-1 text-sm text-muted">
                  {suggestion.missing.length > 0 && <p>{t('recipe.missing', { list: list(suggestion.missing) })}</p>}
                  {!suggestion.samePasta && <p>{t('recipe.usesPasta', { pasta: pastaName(shown.pasta) })}</p>}
                  {extras.length > 0 && <p>{t('recipe.extras', { list: list(extras) })}</p>}
                  <Button size="sm" variant="secondary" className="mt-2" onClick={() => use(shown)} data-testid="recipe-complete">
                    <Icon name="check" /> {t('recipe.complete')}
                  </Button>
                </div>
              )}
              {method(shown)}
              <DishPhoto dish={dish(shown)} />
            </>
          ) : (
            <>
              <span className="inline-block rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink/70" data-testid="recipe-kind">
                {t('recipe.variation')}
              </span>
              <p className="mt-2 text-sm text-muted">{t('recipe.variationText')}</p>
            </>
          )}
        </div>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
        <Icon name="help" className="h-3.5 w-3.5" /> {t('recipe.note')}
      </p>
    </section>
  );
}
