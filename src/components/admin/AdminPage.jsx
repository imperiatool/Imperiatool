import { useEffect, useState } from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ImportTab from './ImportTab.jsx';
import AssetsTab from './AssetsTab.jsx';
import CategoriesTab from './CategoriesTab.jsx';
import PaletteTab from './PaletteTab.jsx';
import OrdersTab from './OrdersTab.jsx';
import DataTab from './DataTab.jsx';
import SecurityTab from './SecurityTab.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { hasSession, login, logout, needsSetup, setupPassword, lockRemaining, MIN_PASSWORD_LENGTH } from '../../lib/auth.js';

const TABS = ['import', 'assets', 'categories', 'palette', 'orders', 'data', 'security'];

function AuthGate({ onAuth }) {
  const { t } = useI18n();
  const setup = needsSetup();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lock, setLock] = useState(lockRemaining());

  useEffect(() => {
    if (!lock) return;
    const id = setInterval(() => setLock(lockRemaining()), 1000);
    return () => clearInterval(id);
  }, [lock]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (setup) {
      if (password.length < MIN_PASSWORD_LENGTH) return setError(t('auth.tooShort'));
      if (password !== confirm) return setError(t('auth.mismatch'));
      setBusy(true);
      await setupPassword(password);
      setBusy(false);
      return onAuth();
    }
    setBusy(true);
    const res = await login(password);
    setBusy(false);
    if (res === 'ok') return onAuth();
    setPassword('');
    if (res === 'locked') setLock(lockRemaining());
    else setError(t('auth.wrong'));
  };

  const input = 'mt-1 w-full rounded-xl border border-line bg-white px-3 py-2';
  return (
    <form className="mx-auto mt-16 max-w-sm rounded-3xl border border-line bg-paper p-6" onSubmit={submit} data-testid="auth-form">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-brand text-white"><Icon name="lock" className="h-5 w-5" /></div>
      <h2 className="font-display text-2xl font-bold">{setup ? t('auth.setupTitle') : t('auth.title')}</h2>
      {setup && <p className="mt-1 text-sm text-muted">{t('auth.setupHint')}</p>}
      <label className="mt-4 block text-sm font-medium">
        {t('auth.password')}
        <input type="password" autoFocus autoComplete={setup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className={input} data-testid="auth-password" />
      </label>
      {setup && (
        <label className="mt-3 block text-sm font-medium">
          {t('auth.confirm')}
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} data-testid="auth-confirm" />
        </label>
      )}
      {error && <p className="mt-2 text-sm text-brand-dark" role="alert">{error}</p>}
      {lock > 0 && <p className="mt-2 text-sm text-brand-dark" role="alert">{t('auth.locked', { s: lock })}</p>}
      <Button type="submit" variant="primary" className="mt-5 w-full justify-center" disabled={busy || lock > 0 || !password}>
        {setup ? t('auth.create') : t('auth.enter')}
      </Button>
    </form>
  );
}

export default function AdminPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(hasSession);

  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="scroll-thin flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line bg-paper px-4 py-2 sm:px-6">
        {TABS.map((tab) => (
          <NavLink
            key={tab}
            to={`/admin/${tab}`}
            className={({ isActive }) => `shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-brand text-white' : 'hover:bg-ink/5'}`}
          >
            {t(`admin.tabs.${tab}`)}
          </NavLink>
        ))}
        <span className="flex-1" />
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0"
          onClick={() => {
            logout();
            setAuthed(false);
            navigate('/');
          }}
          data-testid="logout"
        >
          <Icon name="logout" /> {t('admin.logout')}
        </Button>
      </nav>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <Routes>
            <Route index element={<Navigate to="import" replace />} />
            <Route path="import" element={<ImportTab />} />
            <Route path="assets" element={<AssetsTab />} />
            <Route path="categories" element={<CategoriesTab />} />
            <Route path="palette" element={<PaletteTab />} />
            <Route path="orders" element={<OrdersTab />} />
            <Route path="data" element={<DataTab />} />
            <Route path="security" element={<SecurityTab />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({ title, children }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      {children && <p className="mt-1 max-w-2xl text-sm text-muted">{children}</p>}
    </div>
  );
}

export function Card({ className = '', children }) {
  return <div className={`rounded-3xl border border-line/10 bg-paper p-5 ${className}`}>{children}</div>;
}
