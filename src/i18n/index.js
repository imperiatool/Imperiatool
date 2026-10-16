// Tiny i18n layer: no dependency, typed by the English dictionary.
import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import en from './en.js';
import it from './it.js';
import es from './es.js';
import fr from './fr.js';

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English', locale: 'en-IE' },
  { code: 'es', label: 'ES', name: 'Español', locale: 'es-ES' },
  { code: 'fr', label: 'FR', name: 'Français', locale: 'fr-FR' },
  { code: 'it', label: 'IT', name: 'Italiano', locale: 'it-IT' },
];
export const DEFAULT_LANG = 'en';
const DICTS = { en, it, es, fr };

export const useLangStore = create(
  persist(
    (set) => ({
      lang: DEFAULT_LANG,
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
  const locale = LANGUAGES.find((l) => l.code === lang)?.locale || 'en-IE';
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
      money: (n) => n.toLocaleString(locale, { style: 'currency', currency: 'EUR' }),
    }),
    [t, lang, setLang, locale],
  );
}

// Colour-zone labels are created in Italian by the importer: map them to roles.
const SLOT_ROLES = { base: 'base', dettagli: 'details', contorno: 'outline', riempimento: 'fill', sfumatura: 'gradient' };
export function slotLabel(slot, t) {
  const m = String(slot.label || '').match(/^(\S+)(?:\s+(\d+))?$/);
  const role = slot.role || (m && SLOT_ROLES[m[1].toLowerCase()]);
  if (!role) return slot.label;
  const n = m?.[2];
  return n ? `${t(`slot.${role}`)} ${n}` : t(`slot.${role}`);
}
