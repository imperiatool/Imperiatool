import { useMemo, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Flag from '../ui/Flag.jsx';
import Drawer from '../ui/Drawer.jsx';
import logoUrl from '../../assets/imperia-logo-1932.svg';
import { EVENTS, tx } from '../../data/events.js';
import { useI18n, LANGUAGES } from '../../i18n/index.js';
import { useCartStore, cartCount } from '../../store/useCartStore.js';

export const PRODUCTS = [
  { to: '/case', key: 'nav.case' },
  { to: '/charm', key: 'nav.charm' },
  { to: '/sticker', key: 'nav.sticker' },
  { to: '/events', key: 'nav.events' },
];

function MenuDrawer({ open, onClose }) {
  const { t, lang, setLang } = useI18n();
  const link = ({ isActive }) => `block rounded-xl px-3 py-3 text-lg font-semibold ${isActive ? 'text-brand' : 'text-ink hover:bg-ink/5'}`;
  return (
    <Drawer open={open} onClose={onClose} side="left" title="Menu" testid="menu-drawer">
      <nav className="space-y-1" aria-label="Menu">
        <NavLink to="/" end className={link} onClick={onClose}>
          {t('nav.home')}
        </NavLink>
        {PRODUCTS.map((p) => (
          <NavLink key={p.to} to={p.to} className={link} onClick={onClose}>
            {t(p.key)}
          </NavLink>
        ))}
      </nav>
      <h3 className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-muted">{t('nav.language')}</h3>
      <ul className="space-y-0.5" role="listbox" aria-label={t('nav.language')}>
        {LANGUAGES.map((l) => (
          <li key={l.code}>
            <button
              type="button"
              role="option"
              aria-selected={l.code === lang}
              onClick={() => setLang(l.code)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${l.code === lang ? 'font-semibold text-brand' : 'hover:bg-ink/5'}`}
              data-testid={`lang-${l.code}`}
            >
              <Flag code={l.code} />
              {l.name}
              {l.code === lang && <Icon name="check" className="ml-auto h-4 w-4" />}
            </button>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

/** Search across the four lines and the events, in the current language. */
function SearchDrawer({ open, onClose }) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState('');
  const pages = [
    { to: '/case', title: `Imperia® ${t('home.case.title')}`, text: t('home.case.text') },
    { to: '/charm', title: `Imperia® ${t('home.charm.title')}`, text: t('home.charm.text') },
    { to: '/sticker', title: `Imperia® ${t('home.sticker.title')}`, text: t('home.sticker.text') },
    { to: '/events', title: `Imperia® ${t('nav.events')}`, text: t('home.events.text') },
  ];
  const events = EVENTS.map((e) => ({ to: `/events/${e.id}`, title: tx(e.title, lang), text: `${tx(e.city, lang)} · ${t(`events.kind.${e.kindKey || e.type}`)}` }));
  const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = norm(q.trim()).split(/\s+/).filter(Boolean);
  const hit = (r) => words.every((w) => norm(`${r.title} ${r.text}`).includes(w));
  const found = useMemo(() => ({ pages: pages.filter(hit), events: words.length ? events.filter(hit) : events }), [q, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const row = (r) => (
    <li key={r.to}>
      <Link to={r.to} onClick={onClose} className="block rounded-xl px-3 py-2.5 hover:bg-ink/5">
        <span className="block text-[15px] font-semibold">{r.title}</span>
        <span className="block text-sm text-muted">{r.text}</span>
      </Link>
    </li>
  );
  return (
    <Drawer open={open} onClose={onClose} side="left" title={t('search.title')} testid="search-drawer">
      <label className="relative block">
        <span className="sr-only">{t('search.title')}</span>
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search.placeholder')}
          className="h-12 w-full rounded-full border border-line bg-white pl-12 pr-4 text-base outline-none focus:border-ink"
          data-testid="search-input"
        />
      </label>
      {found.pages.length > 0 && (
        <>
          <h3 className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted">{t('search.products')}</h3>
          <ul>{found.pages.map(row)}</ul>
        </>
      )}
      {found.events.length > 0 && (
        <>
          <h3 className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted">{t('nav.events')}</h3>
          <ul data-testid="search-events">{found.events.map(row)}</ul>
        </>
      )}
      {!found.pages.length && !found.events.length && <p className="mt-6 px-3 text-sm text-muted" data-testid="search-empty">{t('search.empty', { q: q.trim() })}</p>}
    </Drawer>
  );
}

/**
 * imperia.com style: red round menu button on the left, logo in the centre,
 * account and cart on the right. Product tabs underneath on product pages.
 */
export default function Header() {
  const { t } = useI18n();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const items = useCartStore((s) => s.items);
  const show = useCartStore((s) => s.show);
  const count = cartCount(items);
  const { pathname } = useLocation();
  const onProduct = PRODUCTS.some((p) => pathname.startsWith(p.to));
  // red outline icons, as on imperia.com
  const iconBtn = 'relative grid h-10 w-10 place-items-center rounded-full text-brand transition hover:bg-brand/5';

  const tab = ({ isActive }) =>
    `relative flex h-11 flex-1 items-center justify-center px-2 text-[15px] transition sm:flex-none sm:px-6 ${
      isActive ? 'font-semibold text-brand after:absolute after:inset-x-3 after:-bottom-px after:h-[2px] after:rounded-full after:bg-brand' : 'font-medium text-ink/55 hover:text-ink'
    }`;

  return (
    <header className="shrink-0 border-b border-line bg-white">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMenu(true)} className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark" aria-label="Menu" data-testid="menu-button">
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setSearch(true)} className={`${iconBtn} ml-1`} aria-label={t('search.title')} data-testid="search-button">
            <Icon name="search" className="h-[23px] w-[23px]" strokeWidth={2} />
          </button>
        </div>
        <Link to="/" className="justify-self-center" aria-label="Imperia">
          <img src={logoUrl} alt="Imperia, dal 1932" className="h-9 w-auto sm:h-10" />
        </Link>
        <div className="flex items-center justify-end gap-1">
          <button type="button" className={iconBtn} onClick={() => show('account')} aria-label={t('account.title')} data-testid="account-button">
            <Icon name="account" className="h-[23px] w-[23px]" strokeWidth={2} />
          </button>
          <button type="button" className={iconBtn} onClick={() => show('cart')} aria-label={t('cart.title')} data-testid="cart-button">
            <Icon name="shopBag" className="h-[23px] w-[23px]" strokeWidth={2} />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-white" data-testid="cart-count">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      {onProduct && (
        <nav className="flex justify-center border-t border-line" aria-label="Products">
          <NavLink to="/" end className={tab} data-testid="tab-home" aria-label={t('nav.home')}>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="home" className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">{t('nav.home')}</span>
            </span>
          </NavLink>
          {PRODUCTS.map((p) => (
            <NavLink key={p.to} to={p.to} className={tab} data-testid={`tab-${p.to.slice(1)}`}>
              {t(p.key)}
            </NavLink>
          ))}
        </nav>
      )}
      <MenuDrawer open={menu} onClose={() => setMenu(false)} />
      <SearchDrawer open={search} onClose={() => setSearch(false)} />
    </header>
  );
}
