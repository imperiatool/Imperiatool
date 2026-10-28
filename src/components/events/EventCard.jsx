import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';
import { useEventFormat } from './useEventFormat.js';

/** Event in the programme grid: the pasta object on its colour, then the essentials. */
export default function EventCard({ event: e, search = '', onOpen }) {
  const { t } = useI18n();
  const f = useEventFormat();
  // number and pasta name: identical size and weight
  const tag = 'absolute top-3.5 text-[11px] font-semibold uppercase tracking-[0.12em]';
  return (
    <Link to={`/events/${e.id}`} state={{ from: search }} onClick={onOpen} className="group flex flex-col focus-visible:outline-none" data-testid={`event-${e.id}`}>
      <div className={`relative aspect-[5/2] overflow-hidden rounded-2xl ring-brand ring-offset-2 group-focus-visible:ring-2 ${e.visual.bg === '#ffffff' ? 'border border-line' : ''}`} style={{ background: e.visual.bg, color: e.visual.ink }}>
        <img
          src={e.visual.img}
          alt={t(`events.shape.${e.visual.shape}`)}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain px-[18%] py-[10%] transition duration-700 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04]"
        />
        <span className={`${tag} left-4 tabular-nums`}>{e.number}</span>
        <span className={`${tag} right-4`}>{t(`events.shape.${e.visual.shape}`)}</span>
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[15px] font-bold uppercase leading-tight tracking-[-0.01em] text-brand">{f.kind(e)}</p>
          <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-ink/75" title={t(`events.levelDesc.${e.level}`)}>
            {t('events.level')}: <span className="font-semibold text-ink" data-testid="event-card-level">{f.level(e)}</span>
          </span>
        </div>
        <h3 className="mt-1 text-xl font-bold leading-tight tracking-tight" data-testid="event-card-title">
          {f.text(e.title)}
        </h3>
        <ul className="mt-2 space-y-0.5 text-sm text-ink/80">
          <li>
            {f.when(e)}
          </li>
          <li>
            {f.place(e)} · {f.duration(e.minutes)}
          </li>
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <span className="text-lg font-bold" data-testid="event-card-price">
            {f.price(e.price, e.country)}
            {e.price > 0 && <span className="text-xs font-normal text-muted"> {t('events.perPerson')}</span>}
          </span>
          <span className="inline-flex items-center gap-1 text-[15px] font-medium underline underline-offset-4 group-hover:text-brand">
            {t('events.view')} <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
