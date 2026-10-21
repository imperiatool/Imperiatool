import { Link } from 'react-router-dom';
import caseImg from '../../assets/previews/case.png';
import charmImg from '../../assets/previews/charm.png';
import stickerImg from '../../assets/previews/sticker.png';
import { useI18n } from '../../i18n/index.js';

const CARDS = [
  { to: '/case', img: caseImg, key: 'case' },
  { to: '/charm', img: charmImg, key: 'charm' },
  { to: '/sticker', img: stickerImg, key: 'sticker', fit: 'object-contain p-8' },
];

/** Home: one rounded white card per product, like the imperia.com product lines. */
export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="min-h-full bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="text-center text-2xl font-bold tracking-tight text-brand sm:text-[28px]">{t('home.title')}</h1>
        <p className="mt-1 text-center text-sm text-muted">{t('home.subtitle')}</p>
        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
          {CARDS.map((c) => (
            <Link
              key={c.key}
              to={c.to}
              className="group flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
              data-testid={`home-${c.key}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-studio">
                <img src={c.img} alt="" className={`absolute inset-0 h-full w-full transition duration-500 group-hover:scale-[1.03] ${c.fit || 'object-cover'}`} />
              </div>
              <div className="px-7 pb-8 pt-2">
                <h2 className="text-[34px] font-bold leading-[1.05] tracking-tight text-brand">{t(`home.${c.key}.title`)}</h2>
                <p className="mt-2 text-sm text-muted">{t(`home.${c.key}.text`)}</p>
                <span className="mt-4 inline-block text-[15px] font-medium text-ink underline underline-offset-4 group-hover:text-brand">
                  {t(`home.${c.key}.cta`)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
