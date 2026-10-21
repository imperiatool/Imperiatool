import { useMemo, useState } from 'react';
import Drawer from '../ui/Drawer.jsx';
import Button from '../ui/Button.jsx';
import { useCartStore } from '../../store/useCartStore.js';
import { listOrders } from '../../services/orderService.js';
import { useI18n } from '../../i18n/index.js';

/**
 * Account panel: the visitor's details (used to fill the checkout) and the
 * orders sent from this device. Real accounts come with the shop backend.
 */
export default function AccountDrawer() {
  const { t, fmt, locale } = useI18n();
  const open = useCartStore((s) => s.open === 'account');
  const { profile, setProfile, show } = useCartStore();
  const [form, setForm] = useState(null);
  const data = form || profile || { name: '', email: '', phone: '' };
  const orders = useMemo(
    () => (open ? listOrders().filter((o) => !profile?.email || o.customer?.email === profile.email) : []),
    [open, profile],
  );
  const field = 'mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-brand sm:text-sm';
  const set = (k) => (e) => setForm({ ...data, [k]: e.target.value });

  return (
    <Drawer open={open} onClose={() => show(null)} title={t('account.title')} testid="account-drawer">
      <p className="text-sm text-muted">{profile ? t('account.hello', { name: profile.name.split(' ')[0] }) : t('account.intro')}</p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!data.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return;
          setProfile({ name: data.name.trim(), email: data.email.trim(), phone: data.phone.trim() });
          setForm(null);
        }}
      >
        <label className="block text-sm font-medium">
          {t('order.name')}
          <input className={field} value={data.name} onChange={set('name')} autoComplete="name" />
        </label>
        <label className="block text-sm font-medium">
          {t('order.email')}
          <input type="email" className={field} value={data.email} onChange={set('email')} autoComplete="email" />
        </label>
        <label className="block text-sm font-medium">
          {t('order.phone')} <span className="font-normal text-muted">{t('order.optional')}</span>
          <input className={field} value={data.phone} onChange={set('phone')} autoComplete="tel" />
        </label>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={!form}>
            {t('account.save')}
          </Button>
          {profile && (
            <Button variant="ghost" onClick={() => setProfile(null)}>
              {t('account.logout')}
            </Button>
          )}
        </div>
      </form>

      <h3 className="mb-2 mt-8 text-sm font-semibold">{t('account.orders')}</h3>
      {orders.length ? (
        <ul className="divide-y divide-line text-sm">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
              <span>
                <span className="block font-medium">{o.id}</span>
                <span className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString(locale)}</span>
              </span>
              {typeof o.total === 'number' && <span className="font-semibold">{fmt(o.total, o.currency || 'EUR')}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t('account.noOrders')}</p>
      )}
    </Drawer>
  );
}
