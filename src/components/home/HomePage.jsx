import { Link } from 'react-router-dom';
import caseImg from '../../assets/previews/case.png';
import charmImg from '../../assets/previews/charm.png';
import stickerImg from '../../assets/previews/sticker.png';
import eventsImg from '../../assets/previews/events.png';
import { useI18n } from '../../i18n/index.js';
import SpaghettiTwirl from './SpaghettiTwirl.jsx';
import StickerPeel from './StickerPeel.jsx';

// Experiences first, then the three product lines; each image has its own small, slow movement
// (the spaghetti twirl and the sticker's lifting corner are components of their own)
const CARDS = [
  { to: '/events', img: eventsImg, key: 'events', anim: 'twirl' },
  { to: '/case', img: caseImg, key: 'case', anim: 'home-sway' },
  { to: '/charm', img: charmImg, key: 'charm', anim: 'home-float' },
  { to: '/sticker', img: stickerImg, key: 'sticker', anim: 'peel' },
];

/**
 * Home, like the imperia.com product grid: cards sit on the grey page and, on
 * hover (mouse only), the one under the pointer turns white, grows and lifts.
 * On touch screens the cards stay white with a soft shadow.
 */
export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="min-h-full bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="sr-only">Imperia®</h1>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {CARDS.map((c) => (
            <Link key={c.key} to={c.to} className="home-card group flex flex-col rounded-[20px] px-7 pb-8 pt-8" data-testid={`home-${c.key}`}>
              <div className="relative mx-auto aspect-square w-full max-w-[18rem]">
                {c.anim === 'twirl' ? (
                  <SpaghettiTwirl src={c.img} />
                ) : c.anim === 'peel' ? (
                  <StickerPeel src={c.img} />
                ) : (
                  <img src={c.img} alt="" className={`absolute inset-0 h-full w-full object-contain ${c.anim}`} />
                )}
              </div>
              <h2 className="mt-6 text-[28px] font-bold leading-[1.08] tracking-tight text-brand sm:text-[30px]">
                Imperia®
                <br />
                {t(`home.${c.key}.title`)}
              </h2>
              <p className="mt-3 min-h-[2.5rem] text-sm text-ink">{t(`home.${c.key}.text`)}</p>
              <span className="home-link mt-auto self-start pt-4 text-[15px] text-ink">{t(`home.${c.key}.cta`)}</span>
            </Link>
          ))}
        </div>

        {/* closing message */}
        <section className="mx-auto mt-14 max-w-3xl pb-6 text-center sm:mt-20" data-testid="home-bottom">
          <h2 className="text-[28px] font-bold leading-[1.1] tracking-tight text-brand sm:text-[34px]">{t('home.bottom.title')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink">{t('home.bottom.text')}</p>
        </section>
      </div>
    </div>
  );
}
