import { describe, it, expect } from 'vitest';
import { ASSET_LABELS } from '../data/labels.js';
import { RECIPE_PASTAS, matchRecipe, INGREDIENT_GROUPS, INGREDIENTS, SAMPLE_POSTS, RECIPES } from '../data/recipes.js';
import { layoutSheets } from '../components/editor/StickerOrderModal.jsx';
import { fitPhoto } from '../components/events/RecipeCard.jsx';
import { peelAt } from '../components/home/StickerPeel.jsx';
import { framePoints } from '../lib/recipeCard.js';
import { EVENTS } from '../data/events.js';

const LANGS = ['en', 'it', 'es', 'fr', 'de', 'zh', 'hi'];

describe('names', () => {
  it('uses the exact English names for eyes and bodies, Reginette in the plural', () => {
    expect(ASSET_LABELS['Ravioli triangolari'].en).toBe('Classic Tortellino');
    expect(ASSET_LABELS['Ravioli quadrati'].en).toBe('Raviolo');
    expect(ASSET_LABELS['Ravioli tondi'].en).toBe('Giant Raviolo');
    expect(ASSET_LABELS['Raviolo classico'].en).toBe('Raviolo');
    expect(ASSET_LABELS['Tortellino classico'].en).toBe('Classic Tortellino');
    expect(ASSET_LABELS['Raviolo gigante'].en).toBe('Giant Raviolo');
    for (const l of LANGS) expect(ASSET_LABELS.Reginetta[l]).toBe(ASSET_LABELS.Reginette[l]);
    expect(ASSET_LABELS.Reginetta.en).toBe('Reginette');
  });
});

describe('recipe club', () => {
  it('has the shapes of the other categories (Reginette, Macaroni, Penne…) and their dishes', () => {
    for (const id of ['reginette', 'maccheroni', 'penne', 'tortellini', 'lasagne', 'conchiglie', 'anelli', 'cavatappi']) expect(RECIPE_PASTAS.some((p) => p.id === id), id).toBe(true);
    expect(matchRecipe('tortellini', ['broth', 'parmigiano']).recipe.id).toBe('tortelliniinbrodo');
    expect(matchRecipe('lasagne', ['ragu', 'bechamel', 'parmigiano']).recipe.id).toBe('lasagne');
    expect(INGREDIENT_GROUPS.flatMap((g) => g.ids).sort()).toEqual(INGREDIENTS.map((i) => i.id).sort());
  });
  it('sample posts are demo accounts and point to real recipes of the builder', () => {
    for (const p of SAMPLE_POSTS) {
      expect(p.handle.startsWith('@demo.')).toBe(true);
      expect(RECIPES.some((r) => r.id === p.recipe)).toBe(true);
      for (const l of LANGS) expect(p.caption[l]).toBeTruthy();
    }
  });
  it('keeps a photo covering its frame', () => {
    const p = fitPhoto({ zoom: 1, rot: 45, x: 0.5, y: 0 });
    expect(p.zoom).toBeCloseTo(Math.SQRT2);
    expect(p.x).toBeCloseTo(0);
    expect(fitPhoto({ zoom: 2, rot: 0, x: 0.9, y: -0.9 })).toEqual({ zoom: 2, rot: 0, x: 0.5, y: -0.5 });
    const f = framePoints();
    expect(f.every(([x, y]) => x >= 0 && x <= 1 && y >= 0 && y <= 1)).toBe(true);
  });
});

describe('stickers', () => {
  it('lays 12 stickers on a sheet, more on further sheets', () => {
    const a = { id: 'a', items: [1], qty: 7 };
    const b = { id: 'b', items: [1], qty: 6 };
    const sheets = layoutSheets([a, b, { id: 'c', items: [], qty: 3 }]);
    expect(sheets.length).toBe(2);
    expect(sheets[0].length).toBe(12);
    expect(sheets[1].length).toBe(1);
    expect(layoutSheets([])).toEqual([[]]);
  });
  it('the home sticker corner lifts at once and never pauses flat for long', () => {
    expect(peelAt(0)).toBe(0);
    expect(peelAt(0.1)).toBeGreaterThan(0);
    expect(peelAt(0.5)).toBeGreaterThan(0.9);
    expect(peelAt(0.95)).toBeGreaterThan(0);
    for (let p = 0; p <= 1; p += 0.01) expect(Number.isFinite(peelAt(p))).toBe(true);
  });
});

describe('experiences', () => {
  it('describe the pasta shapes of every experience in every language', () => {
    for (const e of EVENTS) for (const l of LANGS) expect(e.shapes?.[l], `${e.id}/${l}`).toBeTruthy();
  });
});

describe('sticker quantities and sheets', () => {
  it('minus goes from 1 to 0 and takes the sticker out; totals follow', async () => {
    const { useStickerCollection } = await import('../store/useStickerCollection.js');
    const st = useStickerCollection.getState();
    useStickerCollection.setState({ stickers: [], editingId: null });
    const a = st.add([{ id: 'x' }], null);
    const b = st.add([{ id: 'y' }], null);
    useStickerCollection.getState().setQty(a, 2);
    useStickerCollection.getState().setQty(a, 1);
    expect(useStickerCollection.getState().stickers.find((s) => s.id === a).qty).toBe(1);
    useStickerCollection.getState().setQty(a, 0);
    expect(useStickerCollection.getState().stickers.map((s) => s.id)).toEqual([b]);
    expect(useStickerCollection.getState().editingId).toBe(b);
    useStickerCollection.getState().setQty(b, 0);
    expect(useStickerCollection.getState().stickers).toEqual([]);
    expect(useStickerCollection.getState().editingId).toBe(null);
  });
  it('every sticker takes exactly one position: 12 → 12, 24 → 24', () => {
    const long = { id: 'reginette', items: [{}], qty: 12 };
    const s12 = layoutSheets([long]);
    expect(s12.map((x) => x.length)).toEqual([12]);
    const s24 = layoutSheets([long, { id: 'b', items: [{}], qty: 12 }]);
    expect(s24.map((x) => x.length)).toEqual([12, 12]);
    expect(s24.flat().length).toBe(24);
  });
});
