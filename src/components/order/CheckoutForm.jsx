import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';

/**
 * Customer details for the cart checkout. `onSubmit({ customer, notes })`
 * must return the saved order (or throw). Shows the confirmation afterwards.
 */
export default function CheckoutForm({ total, initial, onSubmit, onDone, disabled }) {
  const { t, fmt } = useI18n();
  const [form, setForm] = useState({ name: initial?.name || '', email: initial?.email || '', phone: initial?.phone || '', notes: '', privacy: false });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', order: null, error: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('order.err.name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('order.err.email');
    if (!form.privacy) e.privacy = t('order.err.privacy');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setState({ status: 'sending', order: null, error: '' });
    try {
      const order = await onSubmit({
        customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
        notes: form.notes.trim(),
      });
      setState({ status: 'done', order, error: '' });
    } catch (e) {
      setState({ status: 'idle', order: null, error: e.status ? t('order.sendFailed', { status: e.status }) : e.message });
    }
  };

  if (state.status === 'done') {
    return (
      <div className="py-6 text-center" data-testid="order-done">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand text-white">
          <Icon name="check" className="h-7 w-7" strokeWidth={3} />
        </div>
        <h3 className="text-xl font-semibold">{t('order.doneTitle')}</h3>
        <p className="mt-2 text-sm text-muted">
          {t('order.doneCode', { code: state.order.id })} {state.order.status === 'sent' ? t('order.doneSent') : t('order.doneLocal')}
        </p>
        <Button variant="secondary" className="mt-6" onClick={onDone}>
          {t('cart.continue')}
        </Button>
      </div>
    );
  }

  const field = 'mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-brand sm:text-sm';
  const Err = ({ k }) => (errors[k] ? <span className="mt-1 block text-xs font-medium text-brand-dark" role="alert">{errors[k]}</span> : null);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <h3 className="text-sm font-semibold">{t('order.customer')}</h3>
      <label className="block text-sm font-medium">
        {t('order.name')}
        <input className={field} value={form.name} onChange={set('name')} autoComplete="name" />
        <Err k="name" />
      </label>
      <label className="block text-sm font-medium">
        {t('order.email')}
        <input type="email" className={field} value={form.email} onChange={set('email')} autoComplete="email" />
        <Err k="email" />
      </label>
      <label className="block text-sm font-medium">
        {t('order.phone')} <span className="font-normal text-muted">{t('order.optional')}</span>
        <input className={field} value={form.phone} onChange={set('phone')} autoComplete="tel" />
      </label>
      <label className="block text-sm font-medium">
        {t('order.notes')} <span className="font-normal text-muted">{t('order.optional')}</span>
        <textarea rows={2} className={field} value={form.notes} onChange={set('notes')} placeholder={t('order.notesPh')} />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={form.privacy} onChange={set('privacy')} className="mt-0.5 h-5 w-5 accent-brand" data-testid="privacy" />
        <span>
          {t('order.privacy')}
          <Err k="privacy" />
        </span>
      </label>
      {state.error && <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand-dark">{state.error}</p>}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-sm text-muted">
          {t('order.total')} <span className="ml-1 text-xl font-semibold text-ink" data-testid="total">{fmt(total)}</span>
        </p>
        <Button type="submit" variant="primary" size="lg" disabled={state.status === 'sending' || disabled} data-testid="order-submit">
          {state.status === 'sending' ? t('order.sending') : t('order.submit')}
        </Button>
      </div>
    </form>
  );
}
