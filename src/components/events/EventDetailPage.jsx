import { useState } from 'react';
import Safe3D from '../three/Safe3D.jsx';
import { lazyRetry } from '../../lib/lazyRetry.js';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import BookingModal from './BookingModal.jsx';
import RecipeBuilder from './RecipeBuilder.jsx';
import PreviewHint from '../ui/PreviewHint.jsx';
import { eventById, EVENTS } from '../../data/events.js';
import { useI18n } from '../../i18n/index.js';
import { useMeta } from '../../lib/useMeta.js';
import { useEventFormat } from './useEventFormat.js';

const Viewer3D = lazyRetry(() => import('../three/Viewer3D.jsx'), 'viewer3d');

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
  useMeta({ title: e ? `${f.text(e.title)} · Imperia® ${t('nav.events')}` : `Imperia® ${t('nav.events')}`, description: e ? f.text(e.short) : t('meta.events.desc') });
  if (!e) return <Navigate to="/events" replace />;
  const back = `/events${state?.from || ''}`;
  // online, self-paced: nothing to book, the button goes straight to the recipes
  const cta = () => (e.online ? document.getElementById('recipe-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) : setBooking(true));
  const ctaLabel = e.online ? t('events.join') : `${t('events.book')} · ${f.price(e.price, e.country)}`;
  const others = EVENTS.filter((x) => x.id !== e.id && (x.type === e.type || x.country === e.country)).slice(0, 2);

  return (
    <div className="min-h-full bg-white pb-24 lg:pb-0" data-testid="event-detail">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link to={back} className="inline-flex items-center gap-1.5 py-4 text-sm font-medium text-ink/70 hover:text-brand" data-testid="event-back">
          <Icon name="arrowLeft" className="h-4 w-4" /> {t('events.back')}
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          {/* the shape, live in 3D (picture while it loads) */}
          <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <div className={`relative aspect-square overflow-hidden rounded-3xl ${e.visual.bg === '#ffffff' ? 'border border-line' : ''}`} style={{ background: e.visual.bg, color: e.visual.ink }}>
              <Safe3D fallback={<img src={e.visual.img} alt="" className="absolute inset-0 h-full w-full object-contain p-[14%]" />}>
                <div className="absolute inset-0">
                  <Viewer3D kind="pasta" pasta={{ shape: e.visual.shape, color: e.visual.color, finish: e.visual.finish }} transparent hint={false} className="h-full w-full" />
                </div>
              </Safe3D>
              <span className="pointer-events-none absolute left-5 top-4 text-[11px] font-semibold uppercase tracking-[0.12em] tabular-nums">{e.number}</span>
              <span className="pointer-events-none absolute bottom-4 left-5 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">
                {t(`events.shape.${e.visual.shape}`)} · {t(`order.materials.${e.visual.finish}.name`)}
              </span>
            </div>
            <PreviewHint>{t('viewer.hint3d')}</PreviewHint>
          </div>

          <div className="min-w-0">
            {/* same style as "Product specifications" */}
            <p className="text-[15px] font-bold uppercase leading-tight tracking-[-0.01em] text-brand" data-testid="event-kind">
              {f.kind(e)}
            </p>
            <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight sm:text-[28px]" data-testid="event-title">
              {f.text(e.title)}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.text(e.short)}</p>

            <dl className="mt-6 border-b border-line">
              <Fact label={t('events.location')}>
                {f.place(e)}
                {e.venue && <span className="block text-xs font-normal text-muted">{t('events.venue', { venue: e.venue })}</span>}
              </Fact>
              <Fact label={t('events.date')} note={e.start ? t('events.illustrative') : null}>
                {f.when(e)}
              </Fact>
              <Fact label={t('events.duration')}>{f.duration(e.minutes)}</Fact>
              <Fact label={t('events.price')}>
                {f.price(e.price, e.country)} {e.price > 0 && <span className="font-normal text-muted">{t('events.perPerson')}</span>}
              </Fact>
              <Fact label={t('events.placesLabel')} note={e.places ? t('events.illustrative') : null}>
                {f.places(e)}
              </Fact>
              <Fact label={t('events.level')}>
                {f.level(e)} <span className="font-normal text-muted">· {t(`events.levelDesc.${e.level}`)}</span>
              </Fact>
            </dl>

            <div className="mt-6 hidden lg:block">
              <Button variant="primary" size="lg" className="w-full justify-center" onClick={cta} data-testid="book-open">
                {ctaLabel}
              </Button>
              {!e.online && <p className="mt-2 text-center text-xs text-muted">{t('book.demo')}</p>}
            </div>

            <section className="mt-10">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{t('events.about')}</h2>
              <p className="mt-3 text-sm leading-relaxed">{f.text(e.description)}</p>
            </section>

            {/* the experience described with the same words as the products
                (pasta shape, finish = level…), as plain text people, search
                engines and assistants can read */}
            <section className="mt-8" aria-labelledby="event-glance" data-testid="event-glance">
              <h2 id="event-glance" className="text-xs font-semibold uppercase tracking-wider text-muted">
                {t('events.glance')}
              </h2>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {[
                  [t('events.attr.type'), f.kind(e)],
                  [t('events.attr.formats'), e.formats.map((x) => t(`events.format.${x}`)).join(', ')],
                  [t('events.attr.shapes'), f.text(e.shapes)],
                  [t('events.attr.level'), `${f.level(e)} · ${t(`events.levelDesc.${e.level}`)}`],
                  [t('events.attr.mode'), e.online ? t('events.mode.online') : t('events.mode.inperson')],
                  [t('events.location'), f.place(e)],
                  [t('events.duration'), f.duration(e.minutes)],
                  [t('events.attr.booking'), e.online ? t('events.booking.none') : t('events.booking.demo')],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="min-w-0">
                      <dt className="text-xs text-muted">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
              </dl>
            </section>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{t('events.included')}</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {e.included.map((x) => f.text(x)).map((x) => (
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
                  {e.make.map((x) => f.text(x)).map((x, i) => (
                    <li key={x} className="flex gap-2.5">
                      <span className="w-5 shrink-0 font-bold tabular-nums text-brand">{String(i + 1).padStart(2, '0')}</span>
                      {x}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
            {e.recipes && <RecipeBuilder />}
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
                <Link key={o.id} to={`/events/${o.id}`} state={state} className="group flex min-w-0 items-center gap-4 rounded-2xl border border-line p-3 transition hover:border-ink/30">
                  <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ background: o.visual.bg }}>
                    <img src={o.visual.img} alt="" className="h-full w-full object-contain p-2" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">{f.kind(o)}</span>
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
        <Button variant="primary" size="lg" className="w-full justify-center" onClick={cta} data-testid="book-open-mobile">
          {ctaLabel}
        </Button>
      </div>

      <BookingModal open={booking} onClose={() => setBooking(false)} event={e} back={back} />
    </div>
  );
}
