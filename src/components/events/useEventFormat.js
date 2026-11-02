import { useMemo } from 'react';
import { useI18n } from '../../i18n/index.js';
import { formatExperiencePrice, tx } from '../../data/events.js';

/** Dates, durations and prices of an event, in the visitor's language. */
export function useEventFormat() {
  const { t, lang, locale } = useI18n();
  return useMemo(() => {
    const date = (iso) => new Date(iso).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const time = (iso) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    // when: date and time, "start anytime" for the online club, nothing when no date was published
    const when = (e) => (e.start ? `${date(e.start)} · ${time(e.start)}` : e.online ? t('events.anytime') : null);
    const duration = (min) => {
      if (!min) return t('events.ownPace');
      const h = Math.floor(min / 60);
      const m = min % 60;
      if (!h) return t('events.minutes', { m });
      return m ? t('events.hoursMin', { h, m }) : t('events.hours', { h });
    };
    // the same amount in £ (English) or € (Italian…): shared by cards, detail
    // pages, booking buttons and summaries, so they always agree
    const price = (amount) => formatExperiencePrice(amount, lang, locale);
    // what the price covers: one person, or the whole access period (The Pasta Match)
    const per = (e) => (e.accessWeeks ? t('events.forWeeks', { n: e.accessWeeks }) : t('events.perPerson'));
    // length: the access period, the session's duration, or nothing when it was never published
    const length = (e) => (e.accessWeeks ? t('events.accessWeeks', { n: e.accessWeeks }) : e.minutes || e.online ? duration(e.minutes) : null);
    // (a venue that is the point of the experience is named first: "Cecconi’s, London")
    const place = (e) => (e.online ? t('events.online') : e.venueFirst ? `${e.venue}, ${tx(e.city, lang)}` : `${tx(e.city, lang)}, ${t(`events.loc.${e.country}`)}`);
    const places = (e) => (e.places ? t('events.places', { n: e.places }) : e.online ? t('events.unlimited') : null);
    const kind = (e) => t(`events.kind.${e.kindKey || e.type}`);
    // experience levels: the Imperia term first, its plain equivalent after it,
    // e.g. "Raw — Beginner"; levelParts keeps the two apart for display
    const levelParts = (lv) => [t(`events.lvl.${lv}`), t(`events.lvlSub.${lv}`)];
    const level = (e) => {
      const [main, sub] = levelParts(e.level);
      return `${main} — ${sub}`;
    };
    return { date, time, when, duration, length, price, per, place, places, kind, level, levelParts, text: (f) => tx(f, lang), lang };
  }, [t, lang, locale]);
}
