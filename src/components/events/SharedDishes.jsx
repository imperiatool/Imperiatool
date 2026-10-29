import { useI18n } from '../../i18n/index.js';
import Icon from '../ui/Icon.jsx';
import { RECIPES, RECIPE_PASTAS, SAMPLE_POSTS, hashtagsFor } from '../../data/recipes.js';
import { tx } from '../../data/events.js';
import { SPOTS } from '../../lib/recipeCard.js';

/** The dish as on the builder's plate: the pasta and its ingredients in 3D. */
function MiniPlate({ recipe, ingImg }) {
  const pasta = RECIPE_PASTAS.find((p) => p.id === recipe.pasta);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[220px] rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_0_0_10px_#f6f6f6]">
      {pasta && <img src={pasta.img} alt="" loading="lazy" className="absolute inset-[24%] h-[52%] w-[52%] object-contain" />}
      {recipe.need.map((id, n) => {
        const [x, y] = SPOTS[n % SPOTS.length];
        return <img key={id} src={ingImg[id]} alt="" loading="lazy" className="absolute h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 object-contain" style={{ left: `${x}%`, top: `${y}%` }} />;
      })}
    </div>
  );
}

/**
 * Shared Dishes: how the Recipe Club could become a pasta community. Only
 * illustrative sample posts by clearly marked demo accounts: no real people,
 * no engagement numbers, no posting or commenting that pretends to work.
 * "View the recipe" opens that dish in the builder above.
 */
export default function SharedDishes({ ingImg, onView }) {
  const { t, lang } = useI18n();
  return (
    <section className="mt-8 border-t border-line pt-6" aria-labelledby="shared-dishes-title" data-testid="shared-dishes">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="shared-dishes-title" className="text-lg font-bold tracking-tight">
          {t('recipe.shared.title')}
        </h3>
        <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">{t('recipe.shared.sample')}</span>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-ink/80">{t('recipe.shared.intro')}</p>
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
        {SAMPLE_POSTS.map((post) => {
          const r = RECIPES.find((x) => x.id === post.recipe);
          if (!r) return null;
          return (
            <article key={post.id} className="flex min-w-0 flex-col rounded-2xl border border-line bg-white p-3" data-testid={`shared-post-${post.id}`}>
              <header className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{post.handle}</span>
                  <span className="block text-[11px] text-muted">{t('recipe.shared.demoAccount')}</span>
                </span>
                <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/70">{t('recipe.shared.sample')}</span>
              </header>
              <div className="mt-3 rounded-xl bg-brand p-4">
                <MiniPlate recipe={r} ingImg={ingImg} />
              </div>
              <h4 className="mt-3 text-[15px] font-bold leading-tight">{r.name}</h4>
              {lang !== 'it' && <p className="text-xs text-ink/70">{tx(r.title, lang)}</p>}
              <p className="mt-1.5 text-sm">{tx(post.caption, lang)}</p>
              <p className="mt-1 break-words text-xs font-semibold text-brand">{hashtagsFor(r, r.pasta).join(' ')}</p>
              <div className="mt-2 border-t border-line pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{t('recipe.shared.comments')}</p>
                <ul className="mt-1 space-y-1 text-xs">
                  {post.comments.map((c, i) => (
                    <li key={i}>
                      <span className="font-semibold">{c.handle}</span> {tx(c.text, lang)}
                    </li>
                  ))}
                </ul>
              </div>
              <button type="button" onClick={() => onView(r)} className="mt-auto self-start pt-3 text-sm font-semibold text-brand underline underline-offset-4" data-testid={`shared-view-${post.id}`}>
                {t('recipe.shared.view')}
              </button>
            </article>
          );
        })}
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
        <Icon name="help" className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t('recipe.shared.note')}
      </p>
    </section>
  );
}
