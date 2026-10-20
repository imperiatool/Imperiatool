import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Flag from '../ui/Flag.jsx';
import logoUrl from '../../assets/imperia-logo.svg';
import { useI18n, LANGUAGES } from '../../i18n/index.js';

// Product order requested: Case first, then Charm, then Sticker.
const PRODUCTS = [
  { to: '/case', key: 'nav.case', icon: 'phone' },
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
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-3 text-sm font-semibold hover:border-brand/50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('nav.language')}
        data-testid="lang-button"
      >
        <Flag code={lang} />
        <span className="hidden sm:inline">{current?.label}</span>
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-paper py-1 shadow-xl">
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
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${l.code === lang ? 'bg-brand text-white' : 'hover:bg-ink/5'}`}
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
  // Minimal tabs: red text + red underline on the active one, nothing else.
  const tab = ({ isActive }) =>
    `relative flex h-11 flex-1 items-center justify-center px-2 text-[15px] tracking-tight transition sm:flex-none sm:px-5 ${
      isActive
        ? 'font-bold text-brand after:absolute after:inset-x-3 after:-bottom-px after:h-[3px] after:rounded-full after:bg-brand'
        : 'font-semibold text-ink/60 hover:text-ink'
    }`;
  return (
    <header className="shrink-0 border-b border-line bg-white">
      <div className="flex items-center gap-3 px-4 pt-3 sm:px-6 sm:py-0">
        <NavLink to="/case" className="shrink-0 sm:py-3" aria-label="Imperia">
          <img src={logoUrl} alt="Imperia dal 1932" className="h-7 w-auto sm:h-8" />
        </NavLink>
        <nav className="hidden flex-1 justify-center gap-2 sm:flex" aria-label="Products">
          {PRODUCTS.map((p) => (
            <NavLink key={p.to} to={p.to} className={tab} data-testid={`tab-${p.to.slice(1)}`}>
              {t(p.key)}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto sm:ml-0">
          <LanguageMenu />
        </div>
      </div>
      <nav className="mt-1 flex sm:hidden" aria-label="Products">
        {PRODUCTS.map((p) => (
          <NavLink key={p.to} to={p.to} className={tab} data-testid={`mtab-${p.to.slice(1)}`}>
            {t(p.key)}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
