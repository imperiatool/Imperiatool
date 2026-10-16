import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import logoUrl from '../../assets/imperia-logo.svg';
import { useI18n, LANGUAGES } from '../../i18n/index.js';

const link = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold transition sm:px-3 ${
    isActive ? 'bg-ink text-cream' : 'text-ink hover:bg-ink/5'
  }`;

export default function Header() {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b-2 border-ink bg-paper px-4 sm:px-6">
      <NavLink to="/" className="shrink-0" aria-label="Imperia">
        <img src={logoUrl} alt="Imperia" className="h-8 w-auto sm:h-9" />
      </NavLink>
      <nav className="flex items-center gap-1 sm:gap-2">
        <NavLink to="/" end className={link}>
          <Icon name="sparkle" /> <span className="hidden sm:inline">{t('nav.editor')}</span>
        </NavLink>
        <NavLink to="/admin" className={link} title={t('nav.admin')}>
          <Icon name="lock" /> <span className="hidden sm:inline">{t('nav.admin')}</span>
        </NavLink>
        <label className="relative ml-1 inline-flex items-center">
          <span className="sr-only">{t('nav.language')}</span>
          <Icon name="globe" className="pointer-events-none absolute left-2 h-4 w-4 text-muted" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="h-9 appearance-none rounded-xl border border-line bg-white pl-7 pr-2.5 text-sm font-semibold"
            data-testid="lang-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </label>
      </nav>
    </header>
  );
}
