import { Link } from 'react-router-dom';
import caseImg from '../../assets/previews/case.png';
import charmImg from '../../assets/previews/charm.png';
import stickerImg from '../../assets/previews/sticker.png';
import { useI18n } from '../../i18n/index.js';
import { EVENTS } from '../../data/events.js';

const CARDS = [
  { to: '/case', img: caseImg, key: 'case' },
  { to: '/charm', img: charmImg, key: 'charm' },
  { to: '/sticker', img: stickerImg, key: 'sticker' },
];

/** Home: one white rounded card per product, like the imperia.com product lines. */
export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="min-h-full bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-center text-2xl font-bold tracking-tight text-brand sm:text-[28px]">{t('home.title')}</h1>
        <p className="mt-1 text-center text-sm text-muted">{t('home.subtitle')}</p>
        <div className="mt-8 grid gap-6 sm:mt-10 md:grid-cols-3 md:gap-8">
          {CARDS.map((c) => (
            <Link
              key={c.key}
              to={c.to}
              className="group flex flex-col rounded-[20px] bg-white px-8 pb-10 pt-12 shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition hover:shadow-[0_6px_28px_rgba(0,0,0,0.11)]"
              data-testid={`home-${c.key}`}
            >
              <div className="relative mx-auto aspect-[5/4] w-full">
                <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <h2 className="mt-12 text-[30px] font-bold leading-[1.08] tracking-tight text-brand sm:text-[34px]">
                Imperia®
                <br />
                {t(`home.${c.key}.title`)}
              </h2>
              <p className="mt-3 text-sm text-muted">{t(`home.${c.key}.text`)}</p>
              <span className="mt-4 inline-block self-start text-[15px] text-ink underline underline-offset-4 group-hover:text-brand">{t(`home.${c.key}.cta`)}</span>
            </Link>
          ))}
        </div>

        {/* the fourth line: experiences */}
        <Link
          to="/events"
          className="group mt-6 grid overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition hover:shadow-[0_6px_28px_rgba(0,0,0,0.11)] md:mt-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
          data-testid="home-events"
        >
          <div className="flex flex-col justify-center px-8 py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t('home.events.kicker')}</p>
            <h2 className="mt-2 text-[30px] font-bold leading-[1.08] tracking-tight text-brand sm:text-[34px]">
              Imperia®
              <br />
              {t('nav.events')}
            </h2>
            <p className="mt-3 text-sm text-muted">{t('home.events.text')}</p>
            <span className="mt-4 inline-block self-start text-[15px] text-ink underline underline-offset-4 group-hover:text-brand">{t('home.events.cta')}</span>
          </div>
          <div className="grid grid-cols-3">
            {EVENTS.slice(0, 3).map((e) => (
              <div key={e.id} className="relative aspect-[3/4]" style={{ background: e.visual.bg }}>
                <img src={e.visual.img} alt="" className="absolute inset-0 h-full w-full object-contain p-[10%] transition duration-700 group-hover:scale-[1.05]" />
              </div>
            ))}
          </div>
        </Link>
      </div>
    </div>
  );
}
