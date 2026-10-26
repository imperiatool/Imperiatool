import { useMemo } from 'react';
import { useI18n } from '../../i18n/index.js';
import { CURRENCY_OF, tx } from '../../data/events.js';

/** Dates, durations and prices of an event, in the visitor's language. */
export function useEventFormat() {
  const { t, lang, locale } = useI18n();
  return useMemo(() => {
    const date = (iso) => new Date(iso).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const time = (iso) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const duration = (min) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      if (!h) return t('events.minutes', { m });
      return m ? t('events.hoursMin', { h, m }) : t('events.hours', { h });
    };
    // in the event's own currency (no conversion): £ in England, € in Italy
    const price = (amount, country) =>
      !amount ? t('events.free') : Number(amount).toLocaleString(locale, { style: 'currency', currency: CURRENCY_OF[country], minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 });
    const place = (e) => `${tx(e.city, lang)}, ${t(`events.loc.${e.country}`)}`;
    const kind = (e) => t(`events.kind.${e.kindKey || e.type}`);
    // experience levels have the names of the finishes (Raw, Al Dente, Overcooked)
    const level = (e) => t(`order.materials.${e.level}.name`);
    return { date, time, duration, price, place, kind, level, text: (f) => tx(f, lang), lang };
  }, [t, lang, locale]);
}
