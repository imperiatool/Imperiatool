import { Link } from 'react-router-dom';
import caseImg from '../../assets/previews/case.png';
import charmImg from '../../assets/previews/charm.png';
import stickerImg from '../../assets/previews/sticker.png';
import eventsImg from '../../assets/previews/events.png';
import { useI18n } from '../../i18n/index.js';
import { useMeta } from '../../lib/useMeta.js';
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
  useMeta({
    title: t('meta.home.title'),
    description: t('meta.home.desc'),
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('meta.home.title'),
      description: t('meta.home.desc'),
      hasPart: CARDS.map((c) => ({ '@type': 'WebPage', name: `Imperia® ${t(`home.${c.key}.title`)}`, description: t(`home.${c.key}.text`), url: `#${c.to}` })),
    },
  });
  return (
    <div className="min-h-full bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* hero: white, with the same soft shadow as the category cards, in the
            approved silhouette; red headline, black paragraph */}
        <section
          className="relative mb-8 flex items-center overflow-hidden rounded-[22px] rounded-br-[96px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] sm:mb-10 sm:rounded-br-[140px]"
          data-testid="home-hero"
        >
          <div className="relative max-w-[46rem] px-6 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
            <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.01em] text-brand sm:text-[32px] lg:text-[38px]" data-testid="home-hero-title">
              {t('home.bottom.title')}
            </h1>
            <p className="mt-3 text-[17px] leading-snug text-black sm:mt-4 sm:text-[20px] lg:text-[23px]">{t('home.bottom.text')}</p>
          </div>
        </section>

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

      </div>
    </div>
  );
}