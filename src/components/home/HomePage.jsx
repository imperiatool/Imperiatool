import { Link } from 'react-router-dom';
import caseImg from '../../assets/previews/case.png';
import charmImg from '../../assets/previews/charm.png';
import stickerImg from '../../assets/previews/sticker.png';
import eventsImg from '../../assets/previews/events.png';
import { useI18n } from '../../i18n/index.js';

// one card per Imperia line; each image has its own small, slow movement
const CARDS = [
  { to: '/case', img: caseImg, key: 'case', title: 'home.case.title', anim: 'home-sway' },
  { to: '/charm', img: charmImg, key: 'charm', title: 'home.charm.title', anim: 'home-float' },
  { to: '/sticker', img: stickerImg, key: 'sticker', title: 'home.sticker.title', anim: 'home-tilt' },
  { to: '/events', img: eventsImg, key: 'events', title: 'nav.events', anim: 'home-breathe' },
];

/** Home: the four Imperia lines as white rounded cards, like imperia.com. */
export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="min-h-full bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="sr-only">Imperia®</h1>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {CARDS.map((c) => (
            <Link
              key={c.key}
              to={c.to}
              className="group flex flex-col rounded-[20px] bg-white px-7 pb-8 pt-8 shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition hover:shadow-[0_6px_28px_rgba(0,0,0,0.11)]"
              data-testid={`home-${c.key}`}
            >
              <div className="relative mx-auto aspect-square w-full max-w-[18rem]">
                <img src={c.img} alt="" className={`absolute inset-0 h-full w-full object-contain ${c.anim}`} />
              </div>
              <h2 className="mt-6 text-[28px] font-bold leading-[1.08] tracking-tight text-brand sm:text-[30px]">
                Imperia®
                <br />
                {t(c.title)}
              </h2>
              <p className="mt-3 min-h-[2.5rem] text-sm text-muted">{t(`home.${c.key}.text`)}</p>
              <span className="mt-auto inline-block self-start pt-4 text-[15px] text-ink underline underline-offset-4 group-hover:text-brand">{t(`home.${c.key}.cta`)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
