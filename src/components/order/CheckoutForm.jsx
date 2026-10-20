import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';

const EMPTY = { name: '', email: '', phone: '', quantity: 1, notes: '', privacy: false };

/**
 * Customer details + quantity + total. `onSubmit({ customer, quantity, notes })`
 * must return the saved order (or throw). Shows the confirmation afterwards.
 */
export default function CheckoutForm({ unitPrice, onSubmit, onDone, disabled, children }) {
  const { t, price, fmt, currency } = useI18n();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', order: null, error: '' });
  // prices are kept in EUR and shown (and ordered) in the visitor's currency
  const unitLocal = price(unitPrice);
  const total = Math.round(unitLocal * (form.quantity || 0) * 100) / 100;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('order.err.name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('order.err.email');
    if (!(form.quantity >= 1 && form.quantity <= 50)) e.quantity = t('order.err.qty');
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
        quantity: Number(form.quantity),
        notes: form.notes.trim(),
        total,
        unitPrice: unitLocal,
        currency,
      });
      setState({ status: 'done', order, error: '' });
      setForm(EMPTY);
    } catch (e) {
      setState({ status: 'idle', order: null, error: e.status ? t('order.sendFailed', { status: e.status }) : e.message });
    }
  };

  if (state.status === 'done') {
    return (
      <div className="mx-auto max-w-md py-6 text-center" data-testid="order-done">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand text-white">
          <Icon name="check" className="h-7 w-7" strokeWidth={3} />
        </div>
        <h3 className="font-display text-2xl font-bold">{t('order.doneTitle')}</h3>
        <p className="mt-2 text-muted">
          {t('order.doneCode', { code: state.order.id })} {state.order.status === 'sent' ? t('order.doneSent') : t('order.doneLocal')}
        </p>
        {state.order.preview && <img src={state.order.preview} alt="" className="mx-auto mt-4 max-h-56 rounded-2xl" />}
        <Button variant="secondary" className="mt-6" onClick={onDone}>{t('order.back')}</Button>
      </div>
    );
  }

  const field = 'mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-brand sm:text-sm';
  const Err = ({ k }) => (errors[k] ? <span className="mt-1 block text-xs font-semibold text-brand-dark" role="alert">{errors[k]}</span> : null);

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {children}
      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t('order.customer')}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">{t('order.name')}
            <input className={field} value={form.name} onChange={set('name')} autoComplete="name" />
            <Err k="name" />
          </label>
          <label className="text-sm font-medium">{t('order.email')}
            <input type="email" className={field} value={form.email} onChange={set('email')} autoComplete="email" />
            <Err k="email" />
          </label>
          <label className="text-sm font-medium">{t('order.phone')} <span className="font-normal text-muted">{t('order.optional')}</span>
            <input className={field} value={form.phone} onChange={set('phone')} autoComplete="tel" />
          </label>
          <label className="text-sm font-medium">{t('order.quantity')}
            <div className="mt-1 flex items-center gap-2">
              <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-lg font-bold" onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })} aria-label="−">−</button>
              <input type="number" min={1} max={50} className="h-10 w-16 rounded-xl border border-line bg-white text-center text-base" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(0, parseInt(e.target.value || '0', 10)) })} aria-label={t('order.quantity')} />
              <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-lg font-bold" onClick={() => setForm({ ...form, quantity: Math.min(50, form.quantity + 1) })} aria-label="+">+</button>
            </div>
            <Err k="quantity" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">{t('order.notes')} <span className="font-normal text-muted">{t('order.optional')}</span>
            <textarea rows={2} className={field} value={form.notes} onChange={set('notes')} placeholder={t('order.notesPh')} />
          </label>
        </div>
        <label className="mt-3 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={form.privacy} onChange={set('privacy')} className="mt-0.5 h-5 w-5 accent-brand" data-testid="privacy" />
          <span>{t('order.privacy')}<Err k="privacy" /></span>
        </label>
      </fieldset>

      {state.error && <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand-dark">{state.error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-sm text-muted">
          {t('order.total')} <span className="ml-1 font-display text-2xl font-bold text-ink" data-testid="total">{fmt(total)}</span>
        </p>
        <Button type="submit" variant="basil" size="lg" disabled={state.status === 'sending' || disabled} data-testid="order-submit">
          <Icon name="cart" /> {state.status === 'sending' ? t('order.sending') : t('order.submit')}
        </Button>
      </div>
    </form>
  );
}
