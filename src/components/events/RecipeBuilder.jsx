import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { INGREDIENTS, RECIPE_PASTAS, matchRecipe } from '../../data/recipes.js';
import { tx } from '../../data/events.js';

// fixed spots on the plate for the ingredient "drops" (no randomness: stable layout)
const SPOTS = [
  [22, 30], [72, 26], [80, 62], [28, 74], [52, 16], [60, 82], [14, 52], [86, 42], [40, 86], [66, 44], [36, 40],
];

/**
 * Free-event extra: choose a pasta and some ingredients (shown as colours, like
 * the configurators) and see which traditional dish they make, with its recipe.
 * Anything that is not a recognised dish is clearly called a creative variation.
 */
export default function RecipeBuilder() {
  const { t, lang } = useI18n();
  const [pasta, setPasta] = useState(null);
  const [chosen, setChosen] = useState([]);
  const toggle = (id) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const result = matchRecipe(pasta, chosen);
  const pastaInfo = RECIPE_PASTAS.find((p) => p.id === pasta);
  const ingName = (id) => tx(INGREDIENTS.find((i) => i.id === id)?.name, lang);

  return (
    <section className="mt-10 rounded-2xl border border-line p-4 sm:p-5" data-testid="recipe-builder">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('recipe.title')}</h2>
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
      <div className="scroll-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label={t('recipe.step.pasta')}>
        {RECIPE_PASTAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={pasta === p.id}
            onClick={() => setPasta(p.id)}
            className={`flex w-[84px] shrink-0 flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition ${pasta === p.id ? 'border-brand bg-brand/5' : 'border-line hover:border-brand/50'}`}
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

      {/* 3 · the dish */}
      <div className="mt-6 grid gap-5 sm:grid-cols-[150px_minmax(0,1fr)]" aria-live="polite">
        <div className="relative mx-auto aspect-square w-[150px] rounded-full bg-white shadow-[0_6px_24px_rgba(0,0,0,0.12),inset_0_0_0_10px_#f6f6f6]" aria-hidden="true">
          {pastaInfo && <img src={pastaInfo.img} alt="" className="absolute inset-[22%] h-[56%] w-[56%] object-contain" />}
          {chosen.map((id, n) => {
            const [x, y] = SPOTS[n % SPOTS.length];
            return (
              <span
                key={id}
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/10 shadow-sm"
                style={{ left: `${x}%`, top: `${y}%`, background: INGREDIENTS.find((i) => i.id === id)?.hex }}
              />
            );
          })}
        </div>
        <div data-testid="recipe-result">
          {!result ? (
            <p className="text-sm text-muted">{t('recipe.pick')}</p>
          ) : (
            <>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${result.kind === 'traditional' ? 'bg-brand text-white' : 'bg-cream text-ink/70'}`}
                data-testid="recipe-kind"
              >
                {t(result.kind === 'traditional' ? 'recipe.traditional' : 'recipe.variation')}
              </span>
              <h3 className="mt-2 text-lg font-bold leading-tight" data-testid="recipe-name">
                {result.kind === 'traditional'
                  ? result.recipe.name
                  : result.recipe
                    ? t('recipe.variationOf', { name: result.recipe.name })
                    : `${tx(pastaInfo.name, lang)} · ${chosen.map(ingName).join(', ')}`}
              </h3>
              {result.kind === 'variation' && <p className="mt-1 text-sm text-muted">{t('recipe.variationText')}</p>}
              {result.recipe && (
                <>
                  <p className="mt-3 text-sm">
                    <span className="font-bold">{t('recipe.ingredients')}:</span> {tx(pastaInfo.name, lang)}, {[...result.recipe.need, ...result.recipe.may.filter((i) => chosen.includes(i))].map(ingName).join(', ')}
                  </p>
                  <h4 className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">{t('recipe.method')}</h4>
                  <ol className="mt-1.5 space-y-1.5 text-sm">
                    {result.recipe.steps.map((s, n) => (
                      <li key={n} className="flex gap-2.5">
                        <span className="w-5 shrink-0 font-bold tabular-nums text-brand">{String(n + 1).padStart(2, '0')}</span>
                        {tx(s, lang)}
                      </li>
                    ))}
                  </ol>
                </>
              )}
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
