import { Suspense, lazy, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import BookingModal from './BookingModal.jsx';
import { eventById, EVENTS } from '../../data/events.js';
import { useI18n } from '../../i18n/index.js';
import { useEventFormat } from './useEventFormat.js';

const Viewer3D = lazy(() => import('../three/Viewer3D.jsx'));

function Fact({ label, children, note }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-t border-line py-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">
        {children}
        {note && <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-muted">{note}</span>}
      </dd>
    </div>
  );
}

/** One event: the pasta object in live 3D, the facts and the demo booking. */
export default function EventDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const { t } = useI18n();
  const f = useEventFormat();
  const [booking, setBooking] = useState(false);
  const e = eventById(id);
  if (!e) return <Navigate to="/events" replace />;
  const back = `/events${state?.from || ''}`;
  const others = EVENTS.filter((x) => x.id !== e.id && (x.type === e.type || x.country === e.country)).slice(0, 2);

  return (
    <div className="min-h-full bg-white pb-24 lg:pb-0" data-testid="event-detail">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link to={back} className="inline-flex items-center gap-1.5 py-4 text-sm font-medium text-ink/70 hover:text-brand" data-testid="event-back">
          <Icon name="arrowLeft" className="h-4 w-4" /> {t('events.back')}
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          {/* the shape, live in 3D (picture while it loads) */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="relative aspect-square overflow-hidden rounded-3xl" style={{ background: e.visual.bg, color: e.visual.ink }}>
              <Suspense fallback={<img src={e.visual.img} alt="" className="absolute inset-0 h-full w-full object-contain p-[14%]" />}>
                <div className="absolute inset-0">
                  <Viewer3D kind="pasta" pasta={{ shape: e.visual.shape, color: e.visual.color, finish: e.visual.finish }} transparent hint={false} className="h-full w-full" />
                </div>
              </Suspense>
              <span className="pointer-events-none absolute left-5 top-4 text-sm font-bold tabular-nums">{e.number}</span>
              <span className="pointer-events-none absolute bottom-4 left-5 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">
                {t(`events.shape.${e.visual.shape}`)} · {t(`order.materials.${e.visual.finish}.name`)}
              </span>
            </div>
            <p className="mt-2 text-center text-xs text-muted">{t('events.visualNote')}</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
              Imperia® Events · {f.text(e.kind)}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-5xl" data-testid="event-title">
              {f.text(e.title)}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink/75">{f.text(e.short)}</p>

            <dl className="mt-6 border-b border-line">
              <Fact label={t('events.location')}>
                {f.place(e)}
                <span className="block text-xs font-normal text-muted">{t('events.venue', { venue: e.venue })}</span>
              </Fact>
              <Fact label={t('events.date')} note={t('events.illustrative')}>
                {f.date(e.start)} · {f.time(e.start)}
              </Fact>
              <Fact label={t('events.duration')}>{f.duration(e.minutes)}</Fact>
              <Fact label={t('events.price')}>
                {f.price(e.price, e.country)} <span className="font-normal text-muted">{t('events.perPerson')}</span>
              </Fact>
              <Fact label={t('events.placesLabel')} note={t('events.illustrative')}>
                {t('events.places', { n: e.places })}
              </Fact>
              <Fact label={t('events.level')}>{t(`events.level.${e.level}`)}</Fact>
            </dl>

            <div className="mt-6 hidden lg:block">
              <Button variant="primary" size="lg" className="w-full justify-center" onClick={() => setBooking(true)} data-testid="book-open">
                {t('events.book')} · {f.price(e.price, e.country)}
              </Button>
              <p className="mt-2 text-center text-xs text-muted">{t('book.demo')}</p>
            </div>

            <section className="mt-10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{t('events.about')}</h2>
              <p className="mt-3 text-base leading-relaxed">{f.text(e.description)}</p>
            </section>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{t('events.included')}</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {f.text(e.included).map((x) => (
                    <li key={x} className="flex gap-2">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} />
                      {x}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{t('events.make')}</h2>
                <ol className="mt-3 space-y-2 text-sm">
                  {f.text(e.make).map((x, i) => (
                    <li key={x} className="flex gap-2.5">
                      <span className="w-5 shrink-0 font-bold tabular-nums text-brand">{String(i + 1).padStart(2, '0')}</span>
                      {x}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
            <p className="mt-10 flex items-start gap-2 text-xs leading-relaxed text-muted">
              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              {t('events.concept')}
            </p>
          </div>
        </div>

        {/* more from the programme */}
        {others.length > 0 && (
          <div className="mt-16 border-t border-line py-10 lg:mb-10">
            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((o) => (
                <Link key={o.id} to={`/events/${o.id}`} state={state} className="group flex items-center gap-4 rounded-2xl border border-line p-3 transition hover:border-ink/30">
                  <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ background: o.visual.bg }}>
                    <img src={o.visual.img} alt="" className="h-full w-full object-contain p-2" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-brand">{f.text(o.kind)}</span>
                    <span className="block truncate text-lg font-bold tracking-tight group-hover:text-brand">{f.text(o.title)}</span>
                    <span className="block text-sm text-muted">{f.place(o)} · {f.price(o.price, o.country)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* phones: booking bar at the bottom, like the product pages */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
        <Button variant="primary" size="lg" className="w-full justify-center" onClick={() => setBooking(true)} data-testid="book-open-mobile">
          {t('events.book')} · {f.price(e.price, e.country)}
        </Button>
      </div>

      <BookingModal open={booking} onClose={() => setBooking(false)} event={e} back={back} />
    </div>
  );
}
