import { describe, it, expect } from 'vitest';
import { EVENTS, filterEvents, priceBand, EVENT_TYPES, EVENT_COUNTRIES, EVENT_FORMATS, PRICE_BANDS, CURRENCY_OF } from '../data/events.js';

describe('events programme', () => {
  it('has six events split between Italy and England, priced in their own currency', () => {
    expect(EVENTS).toHaveLength(6);
    expect(EVENTS.filter((e) => e.country === 'it').length).toBe(3);
    expect(EVENTS.filter((e) => e.country === 'uk').length).toBe(3);
    for (const e of EVENTS) {
      expect(CURRENCY_OF[e.country]).toBeTruthy();
      expect(EVENT_TYPES).toContain(e.type);
      for (const f of e.formats) expect(EVENT_FORMATS).toContain(f);
      for (const k of ['title', 'short', 'description', 'included', 'make', 'city', 'kind']) expect(e[k]?.en, `${e.id}.${k}`).toBeTruthy();
      expect(e.places).toBeGreaterThan(0);
      expect(new Date(e.start).toString()).not.toBe('Invalid Date');
    }
  });
  it('puts prices in the right band', () => {
    expect(priceBand(0)).toBe('free');
    expect(priceBand(20)).toBe('under25');
    expect(priceBand(25)).toBe('25to50');
    expect(priceBand(50)).toBe('25to50');
    expect(priceBand(51)).toBe('over50');
  });
  it('filters by every field and by any combination', () => {
    expect(filterEvents(EVENTS, {})).toHaveLength(6);
    expect(filterEvents(EVENTS, { type: 'all', country: 'all', format: 'all', price: 'all' })).toHaveLength(6);
    expect(filterEvents(EVENTS, { country: 'uk' }).every((e) => e.country === 'uk')).toBe(true);
    expect(filterEvents(EVENTS, { type: 'workshop', country: 'it' }).map((e) => e.id)).toEqual(['shape-of-pasta', 'pasta-club-sunday']);
    expect(filterEvents(EVENTS, { format: 'design-led', price: 'under25' }).map((e) => e.id)).toEqual(['make-shoot-share']);
    expect(filterEvents(EVENTS, { price: 'free' })).toHaveLength(0);
    // every combination works and never returns events that don't match
    for (const type of ['all', ...EVENT_TYPES])
      for (const country of ['all', ...EVENT_COUNTRIES])
        for (const format of ['all', ...EVENT_FORMATS])
          for (const price of ['all', ...PRICE_BANDS]) {
            const out = filterEvents(EVENTS, { type, country, format, price });
            for (const e of out) {
              if (type !== 'all') expect(e.type).toBe(type);
              if (country !== 'all') expect(e.country).toBe(country);
              if (format !== 'all') expect(e.formats).toContain(format);
              if (price !== 'all') expect(priceBand(e.price)).toBe(price);
            }
          }
  });
});
