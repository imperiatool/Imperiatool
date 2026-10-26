import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Flag from '../ui/Flag.jsx';
import Drawer from '../ui/Drawer.jsx';
import logoUrl from '../../assets/imperia-logo.svg';
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

/**
 * imperia.com style: red round menu button on the left, logo in the centre,
 * account and cart on the right. Product tabs underneath on product pages.
 */
export default function Header() {
  const { t, lang } = useI18n();
  const [menu, setMenu] = useState(false);
  const items = useCartStore((s) => s.items);
  const show = useCartStore((s) => s.show);
  const count = cartCount(items);
  const { pathname } = useLocation();
  const onProduct = PRODUCTS.some((p) => pathname.startsWith(p.to));
  const iconBtn = 'relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-ink/5';

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
          <button type="button" onClick={() => setMenu(true)} className="ml-1 hidden items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-ink/70 hover:bg-ink/5 sm:flex" aria-label={t('nav.language')} data-testid="lang-button">
            <Flag code={lang} /> {LANGUAGES.find((l) => l.code === lang)?.label}
          </button>
        </div>
        <Link to="/" className="justify-self-center" aria-label="Imperia">
          <img src={logoUrl} alt="Imperia" className="h-8 w-auto sm:h-9" />
        </Link>
        <div className="flex items-center justify-end gap-1">
          <button type="button" className={iconBtn} onClick={() => show('account')} aria-label={t('account.title')} data-testid="account-button">
            <Icon name="user" className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </button>
          <button type="button" className={iconBtn} onClick={() => show('cart')} aria-label={t('cart.title')} data-testid="cart-button">
            <Icon name="bag" className="h-[22px] w-[22px]" strokeWidth={1.8} />
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
    </header>
  );
}
