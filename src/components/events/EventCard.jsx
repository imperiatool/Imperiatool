import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { useEventFormat } from './useEventFormat.js';

/** Event in the programme grid: the pasta object on its colour, then the facts. */
export default function EventCard({ event: e, search = '', onOpen }) {
  const { t } = useI18n();
  const f = useEventFormat();
  const ink = e.visual.ink;
  return (
    <Link
      to={`/events/${e.id}`}
      state={{ from: search }}
      onClick={onOpen}
      className="group flex flex-col focus-visible:outline-none"
      data-testid={`event-${e.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[4/5] rounded-2xl ring-brand ring-offset-2 group-focus-visible:ring-2" style={{ background: e.visual.bg, color: ink }}>
        <img
          src={e.visual.img}
          alt={t(`events.shape.${e.visual.shape}`)}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-[9%] sm:p-[10%] transition duration-700 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04]"
        />
        <span className="absolute left-5 top-4 text-sm font-bold tabular-nums tracking-wide">{e.number}</span>
        <span className="absolute right-5 top-4 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">{t(`events.shape.${e.visual.shape}`)}</span>
        <span className="absolute bottom-4 left-5 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">{f.place(e)}</span>
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand">{f.text(e.kind)}</p>
        <h3 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight">{f.text(e.title)}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{f.text(e.short)}</p>
        <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 border-t border-line pt-3 text-[13px]">
          <dt className="text-muted">{t('events.date')}</dt>
          <dd className="font-medium">
            {f.date(e.start)} · {f.time(e.start)} <span className="text-[11px] font-normal text-muted">({t('events.illustrative').toLowerCase()})</span>
          </dd>
          <dt className="text-muted">{t('events.duration')}</dt>
          <dd className="font-medium">{f.duration(e.minutes)}</dd>
          <dt className="text-muted">{t('events.placesLabel')}</dt>
          <dd className="font-medium">
            {t('events.places', { n: e.places })} <span className="text-[11px] font-normal text-muted">({t('events.illustrative').toLowerCase()})</span>
          </dd>
        </dl>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span>
            <span className="text-xl font-bold">{f.price(e.price, e.country)}</span>
            <span className="text-xs text-muted"> {t('events.perPerson')}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[15px] font-medium underline underline-offset-4 group-hover:text-brand">
            {t('events.view')} <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
