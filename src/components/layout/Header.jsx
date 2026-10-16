import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

const link = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
    isActive ? 'bg-ink text-cream' : 'text-ink hover:bg-ink/5'
  }`;

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b-2 border-ink bg-paper px-4 sm:px-6">
      <NavLink to="/" className="flex items-center gap-2.5">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
          <path d="M20 3 37 34H3Z" fill="#e3201b" stroke="#3a1f1b" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="15" cy="23" r="3.5" fill="#f8eabe" />
          <circle cx="25" cy="23" r="3.5" fill="#f8eabe" />
          <circle cx="15" cy="23" r="1.6" fill="#3a1f1b" />
          <circle cx="25" cy="23" r="1.6" fill="#3a1f1b" />
        </svg>
        <span className="font-display text-xl font-extrabold tracking-tight">
          Sticker<span className="text-brand">Lab</span>
        </span>
      </NavLink>
      <nav className="flex items-center gap-1">
        <NavLink to="/" end className={link}>
          <Icon name="sparkle" /> Editor
        </NavLink>
        <NavLink to="/admin" className={link}>
          <Icon name="settings" /> Admin
        </NavLink>
      </nav>
    </header>
  );
}
