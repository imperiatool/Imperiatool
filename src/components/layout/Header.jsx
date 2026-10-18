import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Flag from '../ui/Flag.jsx';
import logoUrl from '../../assets/imperia-logo.svg';
import { useI18n, LANGUAGES } from '../../i18n/index.js';

// Product order requested: Cover first, then Charm, then Sticker.
const PRODUCTS = [
  { to: '/cover', key: 'nav.cover', icon: 'phone' },
  { to: '/charm', key: 'nav.charm', icon: 'cube' },
  { to: '/sticker', key: 'nav.sticker', icon: 'sticker' },
];

function LanguageMenu() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);
  const current = LANGUAGES.find((l) => l.code === lang);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-2.5 text-sm font-semibold hover:border-ink/40"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('nav.language')}
        data-testid="lang-button"
      >
        <Icon name="globe" className="h-4 w-4 text-muted" />
        <Flag code={lang} />
        <span className="hidden sm:inline">{current?.label}</span>
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-2xl border-2 border-ink bg-paper py-1 shadow-xl">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${l.code === lang ? 'bg-ink text-cream' : 'hover:bg-ink/5'}`}
                data-testid={`lang-${l.code}`}
              >
                <Flag code={l.code} />
                <span className="font-medium">{l.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Header() {
  const { t } = useI18n();
  const tab = ({ isActive }) =>
    `inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold transition sm:px-4 ${
      isActive ? 'bg-brand text-white shadow-[0_3px_0_0_#8f100b]' : 'text-ink hover:bg-ink/5'
    }`;
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b-2 border-ink bg-paper px-3 py-2.5 sm:px-6">
      <NavLink to="/cover" className="order-1 shrink-0" aria-label="Imperia">
        <img src={logoUrl} alt="Imperia" className="h-8 w-auto sm:h-9" />
      </NavLink>
      <nav className="order-3 flex w-full justify-center gap-1 sm:order-2 sm:w-auto sm:flex-1" aria-label="Products">
        {PRODUCTS.map((p) => (
          <NavLink key={p.to} to={p.to} className={tab} data-testid={`tab-${p.to.slice(1)}`}>
            <Icon name={p.icon} className="h-4 w-4" /> {t(p.key)}
          </NavLink>
        ))}
      </nav>
      <div className="order-2 ml-auto flex items-center gap-1.5 sm:order-3 sm:ml-0">
        <NavLink
          to="/admin"
          className={({ isActive }) => `grid h-10 w-10 place-items-center rounded-xl transition ${isActive ? 'bg-ink text-cream' : 'text-muted hover:bg-ink/5 hover:text-ink'}`}
          title={t('nav.admin')}
          aria-label={t('nav.admin')}
        >
          <Icon name="lock" />
        </NavLink>
        <LanguageMenu />
      </div>
    </header>
  );
}
