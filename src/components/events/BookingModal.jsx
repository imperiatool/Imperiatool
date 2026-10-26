import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { useEventFormat } from './useEventFormat.js';

const MAX_PER_BOOKING = 6;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Demo booking for the concept events: participants, name and email, summary,
 * confirmation. Front-end only: nothing is reserved, sent or charged, and no
 * payment details are ever asked for.
 */
export default function BookingModal({ open, onClose, event: e, back = '/events' }) {
  const { t } = useI18n();
  const f = useEventFormat();
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'done'
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({});
  const [ref, setRef] = useState('');

  // every opening starts a fresh booking for this event
  useEffect(() => {
    if (!open) return;
    setStep('form');
    setGuests(1);
    setTouched({});
  }, [open, e.id]);

  const max = Math.min(MAX_PER_BOOKING, e.places);
  const total = e.price * guests;
  const errors = {
    name: name.trim().length < 2 ? t('book.nameError') : '',
    email: EMAIL.test(email.trim()) ? '' : t('book.emailError'),
  };
  const valid = !errors.name && !errors.email;

  const submit = (ev) => {
    ev.preventDefault();
    setTouched({ 'book-name': true, 'book-email': true });
    if (!valid) {
      document.getElementById(errors.name ? 'book-name' : 'book-email')?.focus();
      return;
    }
    setRef(`DEMO-${e.number}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
    setStep('done');
  };

  const field = (id, label, value, set, type, err, auto) => (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={auto}
        onChange={(x) => set(x.target.value)}
        onBlur={() => setTouched((s) => ({ ...s, [id]: true }))}
        aria-invalid={Boolean(touched[id] && err)}
        aria-describedby={touched[id] && err ? `${id}-error` : undefined}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-base outline-none transition focus:border-ink ${touched[id] && err ? 'border-brand' : 'border-line'}`}
        data-testid={id}
      />
      {touched[id] && err && (
        <p id={`${id}-error`} className="mt-1 text-xs text-brand" role="alert" data-testid={`${id}-error`}>
          {err}
        </p>
      )}
    </div>
  );

  const summary = (
    <div className="flex gap-4 rounded-2xl bg-cream p-3">
      <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ background: e.visual.bg }}>
        <img src={e.visual.img} alt="" className="h-full w-full object-contain p-2" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand">{f.text(e.kind)}</p>
        <p className="font-bold leading-tight" data-testid="book-event">{f.text(e.title)}</p>
        <p className="mt-1 text-muted">{f.place(e)}</p>
        <p className="text-muted">
          {f.date(e.start)} · {f.time(e.start)} <span className="text-[11px]">({t('events.illustrative').toLowerCase()})</span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={step === 'done' ? t('book.doneTitle') : t('book.title')} size="md">
      <p className="-mt-1 mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-dark" data-testid="book-demo-label">
        <Icon name="sparkle" className="h-3.5 w-3.5" /> {t('book.demo')}
      </p>

      {step === 'form' ? (
        <form onSubmit={submit} noValidate className="space-y-5" data-testid="book-form">
          {summary}

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{t('book.guests')}</p>
              <p className="text-xs text-muted">{t('book.max', { n: max })}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-line p-1">
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label={t('book.less')} data-testid="book-less">
                <Icon name="minus" className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-lg font-bold tabular-nums" aria-live="polite" data-testid="book-guests">
                {guests}
              </span>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30" onClick={() => setGuests((g) => Math.min(max, g + 1))} disabled={guests >= max} aria-label={t('book.more')} data-testid="book-more">
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <dl className="space-y-1.5 border-y border-line py-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t('book.pricePer')}</dt>
              <dd>{f.price(e.price, e.country)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>{t('book.total')}</dt>
              <dd data-testid="book-total">{f.price(total, e.country)}</dd>
            </div>
          </dl>

          {field('book-name', t('book.name'), name, setName, 'text', errors.name, 'name')}
          {field('book-email', t('book.email'), email, setEmail, 'email', errors.email, 'email')}

          <p className="text-xs leading-relaxed text-muted">{t('book.note')}</p>
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" data-testid="book-submit">
            {t('book.submit')}
          </Button>
        </form>
      ) : (
        <div className="space-y-5" data-testid="book-done">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-white">
              <Icon name="check" className="h-6 w-6" strokeWidth={3} />
            </span>
            <p className="text-sm leading-relaxed">{t('book.doneText', { name: name.trim(), email: email.trim() })}</p>
          </div>
          {summary}
          <dl className="space-y-1.5 border-y border-line py-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t('book.ref')}</dt>
              <dd className="font-mono font-semibold" data-testid="book-ref">{ref}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t('book.guests')}</dt>
              <dd>{guests}</dd>
            </div>
            <div className="flex justify-between font-bold">
              <dt>{t('book.total')}</dt>
              <dd>{f.price(total, e.country)}</dd>
            </div>
          </dl>
          <p className="text-xs leading-relaxed text-muted">{t('book.note')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="primary" size="lg" className="justify-center" onClick={() => navigate(back)} data-testid="book-back">
              {t('book.backToEvents')}
            </Button>
            <Button variant="secondary" size="lg" className="justify-center" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
