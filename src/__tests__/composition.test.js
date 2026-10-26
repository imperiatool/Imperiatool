import { describe, it, expect } from 'vitest';
import { randomComposition, itemBox, remapColors, insertionIndex } from '../lib/composition.js';
import { normalizeColor } from '../lib/colors.js';
import { DEFAULT_CATEGORIES, DEFAULT_PALETTE } from '../data/defaults.js';

const asset = (id, categoryId, slots) => ({ id, categoryId, width: 100, height: 80, markup: '', slots });
const slots = [
  { id: 's0', kind: 'fill', original: '#ffffff', synthetic: true },
  { id: 's1', kind: 'fill', original: '#000000' },
  { id: 's2', kind: 'stroke', original: '#000000' },
];
const library = {
  categories: DEFAULT_CATEGORIES,
  palette: DEFAULT_PALETTE,
  assets: [asset('b1', 'cat-corpi', slots), asset('e1', 'cat-occhi', slots), asset('m1', 'cat-bocche', slots)],
};

function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

describe('randomComposition', () => {
  it('uses only brand palette colours', () => {
    const hexes = new Set(DEFAULT_PALETTE.map((c) => c.hex));
    for (let s = 1; s < 40; s++) {
      for (const it of randomComposition(library, seeded(s))) {
        Object.values(it.colors).forEach((c) => expect(hexes.has(c)).toBe(true));
      }
    }
  });

  it('includes every required category, bottom to top', () => {
    const items = randomComposition(library, seeded(7));
    expect(items.map((i) => i.categoryId)).toEqual(['cat-corpi', 'cat-occhi', 'cat-bocche']);
  });

  it('gives feature details a colour different from the feature base', () => {
    for (let s = 1; s < 30; s++) {
      const eyes = randomComposition(library, seeded(s)).find((i) => i.categoryId === 'cat-occhi');
      expect(eyes.colors.s0).not.toBe(eyes.colors.s1);
    }
  });
});

describe('randomComposition contrast', () => {
  it('never paints a feature fill with the body colour', () => {
    const lib = {
      ...library,
      assets: [
        asset('b1', 'cat-corpi', slots),
        asset('m1', 'cat-bocche', [{ id: 's0', kind: 'stroke', original: '#000000' }, { id: 's1', kind: 'fill', original: '#ffffff', synthetic: true }]),
      ],
    };
    for (let s = 1; s < 200; s++) {
      const [body, mouth] = randomComposition(lib, seeded(s));
      expect(mouth.colors.s1).not.toBe(body.colors.s0);
    }
  });
});

describe('helpers', () => {
  it('computes rotated bounding boxes', () => {
    const b = itemBox({ x: 0, y: 0, scale: 1, stretchX: 1, stretchY: 1, rotation: 90, flipX: false, flipY: false }, { width: 100, height: 20 });
    expect(Math.round(b.width)).toBe(20);
    expect(Math.round(b.height)).toBe(100);
  });

  it('keeps colours by slot kind when swapping elements', () => {
    const a = { slots: [{ id: 's0', kind: 'fill' }, { id: 's1', kind: 'stroke' }] };
    const b = { slots: [{ id: 's0', kind: 'stroke' }, { id: 's1', kind: 'fill' }] };
    expect(remapColors(a, b, { s0: '#e3201b', s1: '#1a5632' })).toEqual({ s0: '#1a5632', s1: '#e3201b' });
  });

  it('inserts items according to category z-order', () => {
    const cats = Object.fromEntries(DEFAULT_CATEGORIES.map((c) => [c.id, c]));
    const items = [{ categoryId: 'cat-corpi' }, { categoryId: 'cat-bocche' }];
    expect(insertionIndex(items, cats['cat-occhi'], cats)).toBe(1);
  });

  it('normalises colour formats', () => {
    expect(normalizeColor('#FFF')).toBe('#ffffff');
    expect(normalizeColor('rgb(227, 32, 27)')).toBe('#e3201b');
    expect(normalizeColor('black')).toBe('#000000');
    expect(normalizeColor('none')).toBe('none');
    expect(normalizeColor('url(#g)')).toBe(null);
  });
});

describe('randomise: pupils', () => {
  it('never gives a pupil the same colour as its eye, over many runs', () => {
    const eyes = asset('e', 'cat-occhi', [
      { id: 's0', kind: 'fill', original: '#ffb548', synthetic: true, label: 'Base' },
      { id: 's1', kind: 'fill', original: '#6a3933', label: 'Riempimento' },
      { id: 's2', kind: 'stroke', original: '#6a3933', label: 'Contorno' },
    ]);
    const body = asset('b', 'cat-corpi', [{ id: 's0', kind: 'fill', original: '#e1201b', synthetic: true, label: 'Base' }]);
    let seed = 7;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 300; i++) {
      const items = randomComposition({ categories: DEFAULT_CATEGORIES, assets: [body, eyes], palette: DEFAULT_PALETTE }, rng);
      const e = items.find((it) => it.assetId === 'e');
      expect(e.colors.s1).not.toBe(e.colors.s0);
    }
  });
});
