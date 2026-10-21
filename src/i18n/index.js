// Tiny i18n layer: no dependency, typed by the English dictionary.
import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import en from './en.js';
import it from './it.js';
import es from './es.js';
import fr from './fr.js';
import de from './de.js';
import zh from './zh.js';
import hi from './hi.js';

// Each language shows prices in the currency of its country.
export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English', locale: 'en-GB', currency: 'GBP' },
  { code: 'it', label: 'IT', name: 'Italiano', locale: 'it-IT', currency: 'EUR' },
  { code: 'es', label: 'ES', name: 'Español', locale: 'es-ES', currency: 'EUR' },
  { code: 'fr', label: 'FR', name: 'Français', locale: 'fr-FR', currency: 'EUR' },
  { code: 'de', label: 'DE', name: 'Deutsch', locale: 'de-DE', currency: 'EUR' },
  { code: 'zh', label: '中文', name: '中文 (简体)', locale: 'zh-CN', currency: 'CNY' },
  { code: 'hi', label: 'हि', name: 'हिन्दी', locale: 'hi-IN', currency: 'INR' },
];
export const DEFAULT_LANG = 'en';
const DICTS = { en, it, es, fr, de, zh, hi };

/*
 * Prices are set in EUR (src/data/defaults.js) and converted for display.
 * `rate` = units per 1 EUR; prices are rounded to a "shop" price
 * (x.99 for GBP, ending in 9 for CNY, ending in 9 for INR).
 * Update the rates here (or replace with live rates from your shop backend).
 */
export const CURRENCIES = {
  EUR: { rate: 1, round: (v) => Math.round(v * 100) / 100 },
  // small surcharges stay whole pounds, so base (x.99) + surcharge still ends in .99
  GBP: { rate: 0.86, round: (v) => (v < 10 ? Math.ceil(v) : Math.ceil(v) - 0.01) },
  CNY: { rate: 8.3, round: (v) => Math.max(9, Math.ceil(v / 10) * 10 - 1) },
  INR: { rate: 97, round: (v) => Math.max(99, Math.ceil(v / 100) * 100 - 1) },
};

/**
 * EUR amount → amount in `currency`, rounded to a shop price.
 * Pass an array (base price + surcharges) to convert each part and add them,
 * so the total always matches the prices shown on the options.
 */
export function convertPrice(eur, currency = 'EUR') {
  if (Array.isArray(eur)) return Math.round(eur.reduce((s, v) => s + convertPrice(v, currency), 0) * 100) / 100;
  const c = CURRENCIES[currency] || CURRENCIES.EUR;
  if (!eur) return 0;
  return c.round(eur * c.rate);
}

/** First visit: use the device/browser language when we have it, else English. */
export function detectLang() {
  try {
    const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const l of prefs) {
      const code = String(l || '').slice(0, 2).toLowerCase();
      if (DICTS[code]) return code;
    }
  } catch {
    /* no navigator (tests) */
  }
  return DEFAULT_LANG;
}

export const useLangStore = create(
  persist(
    (set) => ({
      lang: detectLang(),
      setLang: (lang) => set({ lang: DICTS[lang] ? lang : DEFAULT_LANG }),
    }),
    { name: 'imperia:lang', storage: createJSONStorage(() => localStorage) },
  ),
);

export function translate(lang, key, vars) {
  let s = DICTS[lang]?.[key] ?? en[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
  return s;
}

/** const { t, lang, setLang, label, money } = useI18n() */
export function useI18n() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  const info = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const { locale, currency } = info;
  return useMemo(
    () => ({
      t,
      lang,
      setLang,
      locale,
      /** Localised name of a category, element or colour (falls back to `name`). */
      label: (entity) => (entity ? entity.labels?.[lang] || entity.name : ''),
      /** Localised colour-zone label: "Base", "Details 2"… */
      slotLabel: (slot) => slotLabel(slot, t),
      currency,
      /** EUR list price → number in the visitor's currency */
      price: (eur) => convertPrice(eur, currency),
      /** format an amount already in `cur` (default: the visitor's currency) */
      fmt: (n, cur = currency) => formatMoney(n, cur, locale),
      /** EUR list price → formatted in the visitor's currency */
      money: (eur) => formatMoney(convertPrice(eur, currency), currency, locale),
    }),
    [t, lang, setLang, locale, currency],
  );
}

export function formatMoney(n, currency, locale) {
  const whole = currency === 'INR' || currency === 'CNY';
  return Number(n || 0).toLocaleString(locale, { style: 'currency', currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
}

// Colour-zone labels are created in Italian by the importer: map them to roles.
const SLOT_ROLES = { base: 'base', dettagli: 'details', contorno: 'outline', riempimento: 'fill', sfumatura: 'gradient' };
// slot.role (set for eyes: 'eye' / 'pupil') wins over the imported label
export function slotLabel(slot, t) {
  const m = String(slot.label || '').match(/^(\S+)(?:\s+(\d+))?$/);
  const role = slot.role || (m && SLOT_ROLES[m[1].toLowerCase()]);
  if (!role) return slot.label;
  const n = m?.[2];
  return n ? `${t(`slot.${role}`)} ${n}` : t(`slot.${role}`);
}
