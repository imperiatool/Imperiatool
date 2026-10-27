import { useEffect, useMemo } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import PageHeader from '../layout/PageHeader.jsx';
import EventCard from './EventCard.jsx';
import FilterMenu from './FilterMenu.jsx';
import { EVENTS, EVENT_TYPES, EVENT_COUNTRIES, EVENT_FORMATS, EVENT_LEVELS, EVENT_SORTS, filterEvents, sortEvents } from '../../data/events.js';
import { useI18n } from '../../i18n/index.js';
import caseImg from '../../assets/previews/case.png';
import charmImg from '../../assets/previews/charm.png';
import stickerImg from '../../assets/previews/sticker.png';

const SCROLL_KEY = 'imperia:events-scroll';

/** Imperia® Events: filters, sorting and the programme straight away. */
export default function EventsPage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const { search } = useLocation();

  // filter groups: URL key → options ('all' first = no filter)
  const groups = [
    { key: 'type', label: t('events.filter.type'), options: ['all', ...EVENT_TYPES].map((o) => ({ value: o, label: t(`events.type.${o}`) })) },
    { key: 'country', label: t('events.filter.location'), options: ['all', ...EVENT_COUNTRIES].map((o) => ({ value: o, label: t(`events.loc.${o}`) })) },
    { key: 'format', label: t('events.filter.format'), options: ['all', ...EVENT_FORMATS].map((o) => ({ value: o, label: t(`events.format.${o}`) })) },
    {
      key: 'level',
      label: t('events.filter.level'),
      options: [
        { value: 'all', label: t('events.level.all') },
        ...EVENT_LEVELS.map((o) => ({ value: o, label: t(`order.materials.${o}.name`), desc: t(`events.levelDesc.${o}`) })),
      ],
    },
  ];
  const filters = Object.fromEntries(groups.map((g) => [g.key, params.get(g.key) || 'all']));
  const sort = EVENT_SORTS.includes(params.get('sort')) ? params.get('sort') : 'date';
  const active = groups.filter((g) => filters[g.key] !== 'all').length;
  const list = useMemo(
    () => sortEvents(filterEvents(EVENTS, filters), sort),
    [filters.type, filters.country, filters.format, filters.level, sort], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === 'all' || (key === 'sort' && value === 'date')) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };
  const clear = () => {
    const next = new URLSearchParams();
    if (sort !== 'date') next.set('sort', sort);
    setParams(next, { replace: true });
  };

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
      <PageHeader title={`Imperia® ${t('nav.events')}`} className="border-b border-line px-4 py-4 sm:px-6" />

      {/* filters on the left, sorting on the right */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2" aria-label={t('events.filters')}>
            {groups.map((g) => (
              <FilterMenu key={g.key} id={g.key} label={g.label} value={filters[g.key]} options={g.options} onChange={(v) => set(g.key, v)} />
            ))}
            {/* always there; active as soon as a filter is set */}
            <button
              type="button"
              onClick={clear}
              disabled={!active}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-brand px-4 text-sm font-semibold text-brand transition hover:bg-brand/5 disabled:border-line disabled:text-ink/35 disabled:hover:bg-transparent"
              data-testid="filters-clear"
            >
              <Icon name="close" className="h-4 w-4" />
              {t('events.clear')}
              {active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] text-white">{active}</span>}
            </button>
          </div>
          <label className="relative flex items-center gap-2 text-sm">
            <span className="text-muted">{t('events.sort')}</span>
            <span className="relative">
              <select
                value={sort}
                onChange={(e) => set('sort', e.target.value)}
                className="h-10 appearance-none rounded-full border border-line bg-white pl-4 pr-9 text-sm font-semibold outline-none hover:border-ink/40 focus:border-ink"
                data-testid="events-sort"
              >
                {EVENT_SORTS.map((o) => (
                  <option key={o} value={o}>
                    {t(`events.sort.${o}`)}
                  </option>
                ))}
              </select>
              <Icon name="down" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            </span>
          </label>
        </div>
      </div>

      {/* the programme */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-4 sm:px-6">
        <p className="mb-4 text-sm text-muted" aria-live="polite" data-testid="events-count">
          {t('events.count', { n: list.length, total: EVENTS.length })}
        </p>
        {list.length ? (
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3" data-testid="events-grid">
            {list.map((e) => (
              <EventCard key={e.id} event={e} search={search} onOpen={remember} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-cream px-6 py-14 text-center" data-testid="events-empty">
            <p className="text-base font-semibold">{t('events.empty')}</p>
            <button type="button" onClick={clear} className="mt-3 text-sm font-medium text-brand underline underline-offset-4">
              {t('events.clear')}
            </button>
          </div>
        )}
      </section>

      {/* back to the products */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:py-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.08] tracking-tight text-brand sm:text-[30px]">{t('events.bottom.title')}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{t('events.bottom.text')}</p>
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
