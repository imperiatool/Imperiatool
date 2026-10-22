import { Link } from 'react-router-dom';
import caseImg from '../../assets/previews/case.png';
import charmImg from '../../assets/previews/charm.png';
import stickerImg from '../../assets/previews/sticker.png';
import { useI18n } from '../../i18n/index.js';

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
      </div>
    </div>
  );
}
