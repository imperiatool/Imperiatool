import { describe, it, expect } from 'vitest';
import { EVENTS, filterEvents, sortEvents, EVENT_TYPES, EVENT_COUNTRIES, EVENT_FORMATS, EVENT_LEVELS, CURRENCY_OF } from '../data/events.js';
import { matchRecipe, suggestRecipe, recipesFor, RECIPES, INGREDIENTS, RECIPE_PASTAS } from '../data/recipes.js';

const LANGS = ['en', 'it', 'es', 'fr', 'de', 'zh', 'hi'];

describe('events programme', () => {
  it('has six distinct experiences (online, Italy, England), fully translated, Recipe Club first', () => {
    expect(EVENTS).toHaveLength(6);
    expect(new Set(EVENTS.map((e) => e.title.en)).size).toBe(6);
    expect(EVENTS.filter((e) => e.country === 'it').length).toBe(2);
    expect(EVENTS.filter((e) => e.country === 'uk').length).toBe(3);
    const club = EVENTS[0];
    expect(club.id).toBe('recipe-club');
    expect([club.number, club.online, club.price, club.places, club.minutes]).toEqual(['01', true, 0, null, null]);
    expect(sortEvents(EVENTS, 'date')[0].id).toBe('recipe-club');
    // no em dashes in the copy
    expect(JSON.stringify(EVENTS)).not.toMatch(/—/);
    expect(EVENTS.find((e) => e.id === 'make-shoot-share').title.en).toBe('Make, Shoot and Share: Sunday Edition');
    for (const e of EVENTS) {
      expect(CURRENCY_OF[e.country]).toBeTruthy();
      expect(EVENT_TYPES).toContain(e.type);
      expect(EVENT_LEVELS).toContain(e.level);
      for (const f of e.formats) expect(EVENT_FORMATS).toContain(f);
      for (const lang of LANGS) {
        for (const k of ['title', 'short', 'description', 'city']) expect(e[k][lang], `${e.id}.${k}.${lang}`).toBeTruthy();
        for (const x of [...e.included, ...e.make]) expect(x[lang], `${e.id} list ${lang}`).toBeTruthy();
      }
      if (e.start) expect(new Date(e.start).toString()).not.toBe('Invalid Date');
    }
    // names asked for: no "Shape Lab" and no "Al dente" event; Shape of Pasta translated in Italian
    expect(EVENTS.some((e) => /shape lab/i.test(e.title.en) || /^al dente$/i.test(e.title.en))).toBe(false);
    expect(EVENTS.find((e) => e.id === 'shape-of-pasta').title.it).not.toBe('Shape of Pasta');
    expect(EVENTS.some((e) => e.price === 0)).toBe(true);
  });
  it('filters by every field and by any combination', () => {
    expect(filterEvents(EVENTS, {})).toHaveLength(6);
    expect(filterEvents(EVENTS, { country: 'uk' }).every((e) => e.country === 'uk')).toBe(true);
    expect(filterEvents(EVENTS, { level: 'raw' }).every((e) => e.level === 'raw')).toBe(true);
    for (const type of ['all', ...EVENT_TYPES])
      for (const country of ['all', ...EVENT_COUNTRIES])
        for (const format of ['all', ...EVENT_FORMATS])
          for (const level of ['all', ...EVENT_LEVELS]) {
            const out = filterEvents(EVENTS, { type, country, format, level });
            expect(new Set(out.map((e) => e.id)).size).toBe(out.length);
            for (const e of out) {
              if (type !== 'all') expect(e.type).toBe(type);
              if (country !== 'all') expect(e.country).toBe(country);
              if (format !== 'all') expect(e.formats).toContain(format);
              if (level !== 'all') expect(e.level).toBe(level);
            }
          }
  });
  it('sorts by the numeric price, free first when ascending', () => {
    const asc = sortEvents(EVENTS, 'priceAsc').map((e) => e.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(asc[0]).toBe(0);
    const desc = sortEvents(EVENTS, 'priceDesc').map((e) => e.price);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    const dates = sortEvents(EVENTS, 'date').map((e) => e.start || '');
    expect(dates).toEqual([...dates].sort());
  });
});

describe('recipe builder', () => {
  it('finds traditional dishes and calls everything else a variation', () => {
    expect(matchRecipe('spaghetti', ['guanciale', 'egg', 'pecorino', 'pepper']).recipe.id).toBe('carbonara');
    expect(matchRecipe('spaghetti', ['guanciale', 'pecorino', 'pepper']).recipe.id).toBe('gricia');
    expect(matchRecipe('spaghetti', ['pecorino', 'pepper']).recipe.id).toBe('cacioepepe');
    expect(matchRecipe('tagliatelle', ['ragu', 'parmigiano']).kind).toBe('traditional');
    expect(matchRecipe('gnocchi', ['tomato', 'mozzarella', 'basil']).recipe.id).toBe('sorrentina');
    const v = matchRecipe('spaghetti', ['guanciale', 'egg', 'pecorino', 'pepper', 'tomato']);
    expect(v.kind).toBe('variation');
    expect(v.recipe.id).toBe('carbonara');
    expect(matchRecipe('fusilli', ['tomato', 'basil'])).toEqual({ kind: 'variation', recipe: null });
    expect(matchRecipe('spaghetti', [])).toBe(null);
  });
  it('uses only known pastas and ingredients, translated', () => {
    const ings = new Set(INGREDIENTS.map((i) => i.id));
    for (const r of RECIPES) {
      expect(RECIPE_PASTAS.some((p) => p.id === r.pasta)).toBe(true);
      for (const i of [...r.need, ...r.may]) expect(ings.has(i), `${r.id}:${i}`).toBe(true);
      for (const s of r.steps) for (const lang of LANGS) expect(s[lang]).toBeTruthy();
    }
  });
  it('teaches a real recipe from a couple of choices', () => {
    // gnocchi + basil → gnocchi alla sorrentina, missing tomato and mozzarella
    const g = suggestRecipe('gnocchi', ['basil', 'egg']);
    expect(g.recipe.id).toBe('sorrentina');
    expect(g.missing.sort()).toEqual(['mozzarella', 'tomato']);
    expect(suggestRecipe('spaghetti', ['guanciale']).recipe.pasta).toBe('spaghetti');
    // fusilli have no traditional recipe: suggestions come from other pastas
    expect(suggestRecipe('fusilli', ['ragu']).recipe.id).toBe('ragu');
    expect(recipesFor('fusilli').length).toBe(RECIPES.length);
    expect(recipesFor('gnocchi').every((r) => r.pasta === 'gnocchi')).toBe(true);
  });
});
