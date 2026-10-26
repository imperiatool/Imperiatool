import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import EventCard from './EventCard.jsx';
import { EVENTS, EVENT_TYPES, EVENT_COUNTRIES, EVENT_FORMATS, PRICE_BANDS, filterEvents } from '../../data/events.js';
import { useI18n } from '../../i18n/index.js';
import sculptureImg from '../../assets/events/sculpture.webp';
import fusilliImg from '../../assets/events/fusilli.webp';
import gnocchiImg from '../../assets/events/gnocchi.webp';
import caseImg from '../../assets/previews/case.png';
import charmImg from '../../assets/previews/charm.png';
import stickerImg from '../../assets/previews/sticker.png';

// filter groups: URL key → options (the first one, 'all', means no filter)
const GROUPS = [
  { key: 'type', label: 'events.filter.type', options: ['all', ...EVENT_TYPES], text: (o) => `events.type.${o}` },
  { key: 'country', label: 'events.filter.location', options: ['all', ...EVENT_COUNTRIES], text: (o) => `events.loc.${o}` },
  { key: 'format', label: 'events.filter.format', options: ['all', ...EVENT_FORMATS], text: (o) => `events.format.${o}` },
  { key: 'price', label: 'events.filter.price', options: ['all', ...PRICE_BANDS], text: (o) => `events.price.${o}` },
];

const SCROLL_KEY = 'imperia:events-scroll';

function FilterGroup({ group, value, onChange }) {
  const { t } = useI18n();
  return (
    <div className="min-w-0" role="radiogroup" aria-label={t(group.label)}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{t(group.label)}</p>
      <div className="scroll-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
        {group.options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o)}
              className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-medium transition ${
                active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink/75 hover:border-ink/40 hover:text-ink'
              }`}
              data-testid={`filter-${group.key}-${o}`}
            >
              {t(group.text(o))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Imperia® Events: concept programme of bookable experiences (illustrative). */
export default function EventsPage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const { search } = useLocation();
  const [open, setOpen] = useState(false); // filters panel on phones
  const filters = Object.fromEntries(GROUPS.map((g) => [g.key, params.get(g.key) || 'all']));
  const active = GROUPS.filter((g) => filters[g.key] !== 'all').length;
  const list = useMemo(() => filterEvents(EVENTS, filters), [filters.type, filters.country, filters.format, filters.price]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };
  const clear = () => setParams(new URLSearchParams(), { replace: true });

  // coming back from an event: same scroll position as before
  useEffect(() => {
    let y = 0;
    try {
      y = Number(sessionStorage.getItem(SCROLL_KEY)) || 0;
      sessionStorage.removeItem(SCROLL_KEY);
    } catch {
      /* storage blocked */
    }
    if (!y) return;
    const id = requestAnimationFrame(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = y;
    });
    return () => cancelAnimationFrame(id);
  }, []);
  const remember = () => {
    try {
      sessionStorage.setItem(SCROLL_KEY, String(document.querySelector('main')?.scrollTop || 0));
    } catch {
      /* storage blocked */
    }
  };

  return (
    <div className="min-h-full bg-white" data-testid="events-page">
      {/* intro */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 lg:pb-16">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand" data-testid="page-title">
            {t('events.kicker')}
          </p>
          <h1 className="mt-3 text-[44px] font-bold leading-[0.98] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[72px]">{t('events.title')}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">{t('events.intro')}</p>
          <p className="mt-6 flex max-w-xl items-start gap-2 text-xs leading-relaxed text-muted" data-testid="events-concept">
            <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            {t('events.concept')}
          </p>
        </div>
        <div className="relative aspect-[5/4] overflow-hidden rounded-3xl bg-[#f8eabe]" aria-hidden="true">
          <img src={sculptureImg} alt="" className="ev-float absolute left-[24%] top-[4%] w-[54%]" />
          <img src={gnocchiImg} alt="" className="ev-float ev-float-2 absolute bottom-[12%] right-[4%] w-[30%]" />
          <img src={fusilliImg} alt="" className="ev-float ev-float-3 absolute bottom-[14%] left-[3%] w-[38%]" />
          <span className="absolute bottom-4 left-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">Imperia® Shape Lab</span>
        </div>
      </section>

      {/* filters */}
      <section className="border-y border-line bg-white" aria-label={t('events.filters')}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold"
              data-testid="filters-toggle"
            >
              {t('events.filters')}
              {active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] text-white">{active}</span>}
              <Icon name="down" className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            <span className="text-sm text-muted" data-testid="events-count-mobile">{t('events.count', { n: list.length, total: EVENTS.length })}</span>
          </div>
          <div className={`${open ? 'grid' : 'hidden'} gap-5 pb-5 lg:grid lg:grid-cols-[1.35fr_0.85fr_0.95fr_1.25fr] lg:gap-6 lg:py-6`}>
            {GROUPS.map((g) => (
              <FilterGroup key={g.key} group={g} value={filters[g.key]} onChange={(v) => set(g.key, v)} />
            ))}
          </div>
        </div>
      </section>

      {/* programme */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:pb-24">
        <div className="mb-6 hidden items-baseline justify-between lg:flex">
          <span className="text-sm text-muted" data-testid="events-count">{t('events.count', { n: list.length, total: EVENTS.length })}</span>
          {active > 0 && (
            <button type="button" onClick={clear} className="text-sm font-medium underline underline-offset-4 hover:text-brand" data-testid="filters-clear">
              {t('events.clear')}
            </button>
          )}
        </div>
        {active > 0 && (
          <button type="button" onClick={clear} className="mb-5 text-sm font-medium underline underline-offset-4 lg:hidden" data-testid="filters-clear-mobile">
            {t('events.clear')}
          </button>
        )}
        {list.length ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" data-testid="events-grid">
            {list.map((e) => (
              <EventCard key={e.id} event={e} search={search} onOpen={remember} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-cream px-6 py-16 text-center" data-testid="events-empty">
            <p className="text-lg font-semibold">{t('events.empty')}</p>
            <button type="button" onClick={clear} className="mt-4 text-sm font-medium text-brand underline underline-offset-4">
              {t('events.clear')}
            </button>
          </div>
        )}
      </section>

      {/* back to the products */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:py-20">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-brand sm:text-[40px]">{t('events.bottom.title')}</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink/75">{t('events.bottom.text')}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { to: '/case', img: caseImg, key: 'case' },
              { to: '/charm', img: charmImg, key: 'charm' },
              { to: '/sticker', img: stickerImg, key: 'sticker' },
            ].map((c) => (
              <Link key={c.key} to={c.to} className="group rounded-2xl bg-white p-3 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] sm:p-4" data-testid={`events-link-${c.key}`}>
                <div className="aspect-square">
                  <img src={c.img} alt="" className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]" />
                </div>
                <p className="mt-2 text-[13px] font-bold leading-tight text-brand sm:text-[15px]">
                  Imperia®
                  <br />
                  {t(`home.${c.key}.title`)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
