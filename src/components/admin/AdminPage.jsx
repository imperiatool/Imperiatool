import { useState } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import ImportTab from './ImportTab.jsx';
import AssetsTab from './AssetsTab.jsx';
import CategoriesTab from './CategoriesTab.jsx';
import PaletteTab from './PaletteTab.jsx';
import OrdersTab from './OrdersTab.jsx';
import DataTab from './DataTab.jsx';
import Button from '../ui/Button.jsx';

const TABS = [
  { path: 'import', label: 'Importa SVG' },
  { path: 'assets', label: 'Elementi' },
  { path: 'categories', label: 'Categorie' },
  { path: 'palette', label: 'Palette' },
  { path: 'orders', label: 'Ordini' },
  { path: 'data', label: 'Backup' },
];

const PIN = import.meta.env.VITE_ADMIN_PIN;
const SESSION_KEY = 'sticker-builder:admin-ok';

/**
 * NOTE: the optional PIN is a client-side convenience, not security. For a
 * public deployment put the admin behind real authentication (see README).
 */
function PinGate({ children }) {
  const [ok, setOk] = useState(() => !PIN || sessionStorage.getItem(SESSION_KEY) === '1');
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  if (ok) return children;
  return (
    <form
      className="mx-auto mt-20 max-w-sm rounded-3xl border-2 border-ink bg-paper p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (value === PIN) {
          sessionStorage.setItem(SESSION_KEY, '1');
          setOk(true);
        } else setError(true);
      }}
    >
      <h2 className="font-display text-2xl font-extrabold">Area Admin</h2>
      <label className="mt-4 block text-sm font-medium">
        PIN
        <input type="password" autoFocus value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2" />
      </label>
      {error && <p className="mt-2 text-sm text-brand-dark">PIN errato</p>}
      <Button type="submit" variant="primary" className="mt-4 w-full justify-center">Entra</Button>
    </form>
  );
}

export default function AdminPage() {
  return (
    <PinGate>
      <div className="flex h-full min-h-0 flex-col">
        <nav className="scroll-thin flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-paper px-4 py-2 sm:px-6">
          {TABS.map((t) => (
            <NavLink
              key={t.path}
              to={`/admin/${t.path}`}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-brand text-white' : 'hover:bg-ink/5'}`
              }
            >
              {t.label}
            </NavLink>
          ))}
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
            </Routes>
          </div>
        </div>
      </div>
    </PinGate>
  );
}

export function SectionTitle({ title, children }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{title}</h1>
      {children && <p className="mt-1 max-w-2xl text-sm text-muted">{children}</p>}
    </div>
  );
}

export function Card({ className = '', children }) {
  return <div className={`rounded-3xl border-2 border-ink/10 bg-paper p-5 ${className}`}>{children}</div>;
}
