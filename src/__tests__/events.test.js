import { describe, it, expect } from 'vitest';
import { EVENTS, PASTA_MATCH, eventById, experienceCurrency, formatExperiencePrice, filterEvents, sortEvents, EVENT_TYPES, EVENT_COUNTRIES, EVENT_FORMATS, EVENT_LEVELS } from '../data/events.js';
import { matchRecipe, suggestRecipe, recipesFor, RECIPES, INGREDIENTS, RECIPE_PASTAS, INGREDIENT_GROUPS, regionOf, hashtagsFor } from '../data/recipes.js';

const LANGS = ['en', 'it', 'es', 'fr', 'de', 'zh', 'hi'];

describe('events programme', () => {
  it('has exactly the six in-person experiences, in order, fully translated', () => {
    expect(EVENTS.map((e) => e.title.en)).toEqual(['Cecconi’s × Imperia', 'Pasta Atelier', 'Pasta Shoot', 'Imperia Aperitivo', 'Pasta After Hours', 'Shape of Pasta']);
    expect(EVENTS.map((e) => e.number)).toEqual(['01', '02', '03', '04', '05', '06']);
    expect(EVENTS.map((e) => e.price)).toEqual([45, 28, 20, 25, 32, 35]);
    expect(EVENTS.map((e) => e.level)).toEqual(['raw', 'aldente', 'aldente', 'raw', 'raw', 'raw']);
    expect(EVENTS.filter((e) => e.soldOut).map((e) => e.id)).toEqual(['cecconis']);
    // sold out: no date, length or places invented for it
    const c = EVENTS[0];
    expect([c.start, c.minutes, c.places]).toEqual([null, null, null]);
    // the approved dates, times, lengths, places and locations of the others are kept
    const keep = { 'pasta-atelier': ['2026-11-28T14:00', 180, 16, 'London'], 'make-shoot-share': ['2027-01-17T13:00', 150, 14, 'Liverpool'], aperitivo: ['2026-12-11T18:30', 120, 30, 'Bologna'], 'pasta-after-hours': ['2026-12-04T19:30', 180, 24, 'Manchester'], 'shape-of-pasta': ['2026-11-21T11:00', 150, 12, 'Milan'] };
    for (const [id, v] of Object.entries(keep)) {
      const e = EVENTS.find((x) => x.id === id);
      expect([e.start, e.minutes, e.places, e.city.en]).toEqual(v);
    }
    expect(EVENTS.some((e) => e.online || e.price === 0)).toBe(false);
    expect(JSON.stringify(EVENTS)).not.toMatch(/—/);
    for (const e of EVENTS) {
      expect(EVENT_TYPES).toContain(e.type);
      expect(EVENT_LEVELS).toContain(e.level);
      for (const f of e.formats) expect(EVENT_FORMATS).toContain(f);
      for (const lang of LANGS) {
        for (const k of ['title', 'subtitle', 'short', 'description', 'city']) expect(e[k][lang], `${e.id}.${k}.${lang}`).toBeTruthy();
        for (const x of [...e.included, ...e.make]) expect(x[lang], `${e.id} list ${lang}`).toBeTruthy();
      }
      if (e.start) expect(new Date(e.start).toString()).not.toBe('Invalid Date');
    }
  });
  it('keeps The Pasta Match apart: £5 / €5 for five weeks, Beginner, start anytime', () => {
    expect(EVENTS.includes(PASTA_MATCH)).toBe(false);
    expect([PASTA_MATCH.title.en, PASTA_MATCH.price, PASTA_MATCH.accessWeeks, PASTA_MATCH.level, PASTA_MATCH.online, PASTA_MATCH.recipes]).toEqual(['The Pasta Match', 5, 5, 'raw', true, true]);
    expect(eventById('recipe-club')).toBe(PASTA_MATCH);
    expect(eventById('cecconis')).toBe(EVENTS[0]);
    expect(JSON.stringify(PASTA_MATCH.short)).not.toMatch(/free|gratis|gratuit|kostenlos|免费|मुफ़्त/i);
  });
  it('shows the same number in £ (English) or € (Italian), never converted', () => {
    expect(experienceCurrency('en')).toBe('GBP');
    expect(experienceCurrency('it')).toBe('EUR');
    for (const e of [...EVENTS, PASTA_MATCH]) {
      expect(formatExperiencePrice(e.price, 'en', 'en-GB')).toBe(`£${e.price}`);
      expect(formatExperiencePrice(e.price, 'it', 'it-IT').replace(/\s/g, ' ')).toBe(`${e.price} €`);
    }
  });
  it('filters by every field and by any combination', () => {
    expect(filterEvents(EVENTS, {})).toHaveLength(6);
    expect(filterEvents(EVENTS, { level: 'raw' }).map((e) => e.id)).toEqual(['cecconis', 'aperitivo', 'pasta-after-hours', 'shape-of-pasta']);
    expect(filterEvents(EVENTS, { level: 'aldente' }).map((e) => e.id)).toEqual(['pasta-atelier', 'make-shoot-share']);
    expect(filterEvents(EVENTS, { level: 'overcooked' })).toHaveLength(0);
    expect(filterEvents(EVENTS, { country: 'uk' }).every((e) => e.country === 'uk')).toBe(true);
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
  it('sorts in programme order by default, or by price or date', () => {
    expect(sortEvents(EVENTS).map((e) => e.number)).toEqual(['01', '02', '03', '04', '05', '06']);
    const asc = sortEvents(EVENTS, 'priceAsc').map((e) => e.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = sortEvents(EVENTS, 'priceDesc').map((e) => e.price);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    const dates = sortEvents(EVENTS, 'date').map((e) => e.start || '9999');
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
  it('has the new pastas (macaroni, penne…) and regional classics', () => {
    for (const id of ['maccheroni', 'penne', 'rigatoni', 'bucatini', 'orecchiette', 'farfalle', 'trofie']) {
      const p = RECIPE_PASTAS.find((x) => x.id === id);
      expect(p, id).toBeTruthy();
      for (const lang of LANGS) expect(p.name[lang], `${id}:${lang}`).toBeTruthy();
    }
    expect(matchRecipe('penne', ['tomato', 'garlic', 'chilli']).recipe.id).toBe('arrabbiata');
    expect(matchRecipe('maccheroni', ['tomato', 'aubergine', 'ricottasalata', 'basil']).recipe.id).toBe('norma');
    expect(matchRecipe('orecchiette', ['cimedirapa', 'garlic', 'oliveoil', 'anchovy']).kind).toBe('traditional');
    expect(matchRecipe('trofie', ['pesto']).recipe.id).toBe('pesto');
    expect(matchRecipe('spaghetti', ['clams', 'garlic', 'oliveoil', 'parsley']).recipe.id).toBe('vongole');
    // farfalle have no traditional recipe here: always a creative variation
    expect(matchRecipe('farfalle', ['tomato', 'basil'])).toEqual({ kind: 'variation', recipe: null });
  });
  it('shows every ingredient in exactly one group, with origins and hashtags for each dish', () => {
    const grouped = INGREDIENT_GROUPS.flatMap((g) => g.ids);
    expect(grouped.sort()).toEqual(INGREDIENTS.map((i) => i.id).sort());
    for (const i of INGREDIENTS) for (const lang of LANGS) expect(i.name[lang], `${i.id}:${lang}`).toBeTruthy();
    for (const r of RECIPES) {
      for (const lang of LANGS) expect(regionOf(r)?.[lang], `${r.id}:${lang}`).toBeTruthy();
      const tags = hashtagsFor(r, r.pasta);
      expect(tags[0]).toBe('#ImperiaRecipeClub');
      expect(tags.length).toBe(4);
    }
    expect(hashtagsFor(null, 'farfalle')).toContain('#Farfalle');
  });
});
