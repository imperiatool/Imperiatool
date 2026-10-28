import { describe, it, expect, beforeEach } from 'vitest';
import { createHash } from 'node:crypto';
import { _sha256Js, hashPassword } from '../lib/auth.js';
import en from '../i18n/en.js';
import it_ from '../i18n/it.js';
import es from '../i18n/es.js';
import fr from '../i18n/fr.js';
import de from '../i18n/de.js';
import zh from '../i18n/zh.js';
import hi from '../i18n/hi.js';
import { translate, slotLabel, convertPrice, LANGUAGES } from '../i18n/index.js';
import { withLabels, CATEGORY_LABELS } from '../data/labels.js';
import { useEditorStore } from '../store/useEditorStore.js';

describe('admin password hashing', () => {
  it('pure-JS SHA-256 matches Node crypto', () => {
    for (const s of ['', 'abc', 'imperia-admin:prova12345', 'è😀'.repeat(40), 'x'.repeat(1000)]) {
      const bytes = new TextEncoder().encode(s);
      expect(_sha256Js(bytes)).toBe(createHash('sha256').update(s).digest('hex'));
    }
  });
  it('hashPassword uses the same scheme as scripts/hash-password.mjs', async () => {
    expect(await hashPassword('prova12345')).toBe(createHash('sha256').update('imperia-admin:prova12345').digest('hex'));
  });
});

describe('i18n', () => {
  // de / zh / hi translate every public page; the Admin area falls back to English
  const PUBLIC = /^(lang|common|editor|picker|props|slot|export|order|cover|viewer|guide|cart|account|home|spec|events|book|search|recipe)\.|^nav\.(language|case|charm|sticker|home|events)$/;
  const publicKeys = Object.keys(en).filter((k) => PUBLIC.test(k)).sort();
  it('every language has exactly the English keys', () => {
    const keys = Object.keys(en).sort();
    for (const dict of [it_, es, fr]) expect(Object.keys(dict).sort()).toEqual(keys);
    for (const dict of [de, zh, hi]) expect(Object.keys(dict).sort()).toEqual(publicKeys);
  });
  it('keeps placeholders in every translation', () => {
    for (const dict of [it_, es, fr, de, zh, hi]) {
      for (const [k, v] of Object.entries(en)) {
        if (!(k in dict)) continue;
        const ph = (v.match(/\{\w+\}/g) || []).sort();
        expect([k, (dict[k].match(/\{\w+\}/g) || []).sort()]).toEqual([k, ph]);
      }
    }
  });
  it('offers 7 languages, each with its country currency', () => {
    expect(LANGUAGES.map((l) => `${l.code}:${l.currency}`)).toEqual(['en:GBP', 'it:EUR', 'es:EUR', 'fr:EUR', 'de:EUR', 'zh:CNY', 'hi:INR']);
    expect(convertPrice(29.9, 'EUR')).toBe(29.9);
    expect(convertPrice(29.9, 'GBP')).toBe(25.99);
    expect(convertPrice(29.9, 'CNY') % 10).toBe(9);
    expect(convertPrice(29.9, 'INR') % 100).toBe(99);
    expect(translate('de', 'admin.logout')).toBe(translate('en', 'admin.logout'));
  });
  it('interpolates and falls back to English', () => {
    expect(translate('it', 'imp.found', { n: 3 })).toBe('3 elementi trovati');
    expect(translate('xx', 'editor.randomize')).toBe('Randomise');
  });
  it('localises colour-zone labels created by the importer', () => {
    const t = (k) => translate('en', k);
    expect(slotLabel({ label: 'Dettagli 2' }, t)).toBe('Details 2');
    expect(slotLabel({ label: 'Contorno' }, t)).toBe('Outline');
    expect(slotLabel({ label: 'Base', role: 'eye' }, t)).toBe('Eye');
    expect(slotLabel({ label: 'Riempimento', role: 'pupil' }, (k) => translate('it', k))).toBe('Pupilla');
  });
  it('adds translations to libraries saved before i18n', () => {
    const lib = withLabels({ categories: [{ id: 'cat-occhi', name: 'Occhi' }], palette: [], assets: [{ id: 'a', name: 'Baffo' }] });
    expect(lib.categories[0].labels).toEqual(CATEGORY_LABELS['cat-occhi']);
    expect(lib.assets[0].name).toBe('Cavatappi');
    expect(lib.assets[0].labels.en).toBe('Cavatappi');
  });
});

describe('layers', () => {
  const mk = (uid) => ({ uid, assetId: 'a', categoryId: 'c', x: 0, y: 0, scale: 1, stretchX: 1, stretchY: 1, rotation: 0, colors: {} });
  beforeEach(() => useEditorStore.setState({ items: ['a', 'b', 'c', 'd'].map(mk), past: [], future: [], selectedId: null }));
  const order = () => useEditorStore.getState().items.map((i) => i.uid).join('');

  it('moves a layer to any position, front and back', () => {
    const s = useEditorStore.getState();
    s.moveLayerTo('a', 2);
    expect(order()).toBe('bcad');
    s.bringToFront('b');
    expect(order()).toBe('cadb');
    s.sendToBack('d');
    expect(order()).toBe('dcab');
    s.undo();
    expect(order()).toBe('cadb');
  });
  it('hides and locks layers with undo', () => {
    const s = useEditorStore.getState();
    s.toggleHidden('b');
    s.toggleLocked('c');
    const items = useEditorStore.getState().items;
    expect(items.find((i) => i.uid === 'b').hidden).toBe(true);
    expect(items.find((i) => i.uid === 'c').locked).toBe(true);
    s.undo();
    expect(useEditorStore.getState().items.find((i) => i.uid === 'c').locked).toBeFalsy();
  });
});

import { coverHeightAt, coverSize, COVER_PATTERNS, PHONE_MODELS } from '../lib/cover3d.js';
import { COVER_OPTIONS } from '../data/defaults.js';
import { roundRectArc, roundRectPerimeter, sdRoundRect } from '../lib/three/geometry.js';
import { ASSET_LABELS } from '../data/labels.js';

describe('phone case patterns', () => {
  it('every phone in the shop has its own 3D model', () => {
    for (const m of COVER_OPTIONS.models) expect(PHONE_MODELS[m.id], m.id).toBeTruthy();
    expect(COVER_OPTIONS.patterns.slice().sort()).toEqual(COVER_PATTERNS.slice().sort());
    // different phones → different size or camera
    expect(coverSize('galaxy-s25').cameras.length).toBe(3);
    expect(coverSize('pixel-10').cameras[0].x).toBe(0);
    expect(coverSize('iphone-17-pro').H).not.toBe(coverSize('galaxy-s25').H);
  });
  it('every pattern has relief and none inside any camera opening, on every phone', () => {
    for (const model of Object.keys(PHONE_MODELS)) {
      const { cameras, W, H } = coverSize(model);
      for (const p of COVER_PATTERNS) {
        let max = 0;
        for (let x = -W / 2; x <= W / 2; x += 1.3) for (let y = -H / 2; y <= 0; y += 1.3) max = Math.max(max, coverHeightAt(p, x, y, model));
        expect(max, `${model}/${p}`).toBeGreaterThan(0.5);
        for (const c of cameras) expect(coverHeightAt(p, c.x, c.y, model), `${model}/${p}`).toBe(0);
      }
    }
  });
  it('keeps the relief away from the outer edge (no stair-step at the border)', () => {
    for (const model of Object.keys(PHONE_MODELS)) {
      const { W, H } = coverSize(model);
      for (const p of COVER_PATTERNS) {
        expect(coverHeightAt(p, 0, -H / 2 + 0.6, model), `${model}/${p}`).toBe(0);
        expect(coverHeightAt(p, W / 2 - 0.6, -20, model), `${model}/${p}`).toBe(0);
      }
    }
  });
});

describe('rounded-rect helpers', () => {
  it('arc length grows continuously around the border', () => {
    const hw = 30, hh = 70, r = 10;
    const P = roundRectPerimeter(hw, hh, r);
    const pts = [];
    for (let a = 0; a < 360; a += 3) {
      const rad = (a * Math.PI) / 180;
      // walk clockwise starting near the top-left of the top edge
      pts.push(roundRectArc(Math.sin(rad) * 100, Math.cos(rad) * 100, 0, 0, hw, hh, r));
    }
    const diffs = pts.slice(1).map((v, i) => v - pts[i]).filter((d) => d < -P / 2 === false);
    expect(Math.max(...pts)).toBeLessThanOrEqual(P + 1e-6);
    expect(diffs.every((d) => d >= -1e-6)).toBe(true);
  });
  it('signed distance is negative inside, positive outside', () => {
    expect(sdRoundRect(0, 0, 0, 0, 10, 20, 3)).toBeLessThan(0);
    expect(sdRoundRect(12, 0, 0, 0, 10, 20, 3)).toBeCloseTo(2);
  });
});

describe('pasta names', () => {
  it('renames old sample elements and translates them', () => {
    const lib = withLabels({ categories: [], palette: [], assets: [{ id: 'a', name: 'Baffo' }, { id: 'b', name: 'Tortellino' }, { id: 'c', name: 'Tortellini tondi' }] });
    expect(lib.assets.map((a) => a.name)).toEqual(['Cavatappi', 'Raviolo classico', 'Ravioli tondi']);
    expect(lib.assets[0].labels.es).toBe('Sacacorchos');
    const bodies = withLabels({ categories: [], palette: [], assets: ['Raviolo triangolare', 'Raviolo quadrato', 'Raviolo tondo'].map((name, i) => ({ id: `b${i}`, name })) });
    expect(bodies.assets.map((a) => a.labels.en)).toEqual(['Classic tortellino', 'Classic raviolo', 'Giant raviolo']);
  });
  it('has a translation in every language for every sample element', () => {
    for (const [name, l] of Object.entries(ASSET_LABELS)) for (const c of LANGUAGES.map((x) => x.code)) expect(l[c], `${name}/${c}`).toBeTruthy();
  });
});

import { snapToPalette, COLOR_LABELS } from '../data/labels.js';
import { DEFAULT_PALETTE } from '../data/defaults.js';

describe('palette-only colours', () => {
  it('turns black into ragù brown and other colours into the nearest brand colour', () => {
    expect(snapToPalette('#000000', DEFAULT_PALETTE)).toBe('#6a3933');
    expect(snapToPalette('#1d1d1b', DEFAULT_PALETTE)).toBe('#6a3933');
    expect(snapToPalette('#ffffff', DEFAULT_PALETTE)).toBe('#f8eabe');
    expect(snapToPalette('#e3201b', DEFAULT_PALETTE)).toBe('#e1201b');
    expect(snapToPalette('#e1201b', DEFAULT_PALETTE)).toBe('#e1201b');
  });
  it('updates saved libraries: palette-only defaults, eye and pupil zones, new colour names', () => {
    const palette = DEFAULT_PALETTE.map((c) => ({ ...c, name: 'old', labels: { en: 'old' } }));
    const eye = { id: 'e', name: 'Bucatini', categoryId: 'cat-occhi', slots: [
      { id: 's0', kind: 'fill', original: '#ffffff', label: 'Base', synthetic: true },
      { id: 's1', kind: 'fill', original: '#000000', label: 'Riempimento' },
    ] };
    const lib = withLabels({ categories: [], palette, assets: [eye] }, { force: true });
    const slots = lib.assets[0].slots;
    expect(slots.map((s) => s.role)).toEqual(['eye', 'pupil']);
    expect(slots[1].original).toBe('#6a3933'); // black → ragù
    expect(slots[0].original).toBe('#f8eabe'); // white → flour
    expect(lib.palette.map((p) => p.labels.en)).toEqual(['Tomato', 'Basil', 'Ragù', 'Egg', 'Flour']);
    expect(lib.palette.map((p) => p.name)).toEqual(['Pomodoro', 'Basilico', 'Ragù', 'Uovo', 'Farina']);
    expect(Object.keys(COLOR_LABELS['c-ambra'])).toHaveLength(7);
  });
});

import { distanceField, solidSilhouette } from '../lib/exportImage.js';

describe('sticker outline', () => {
  it('fills inner holes so the outline never shows inside the shape', () => {
    // a 9×9 ring with a hole in the middle
    const w = 9, h = 9;
    const a = new Uint8Array(w * h);
    for (let y = 2; y <= 6; y++) for (let x = 2; x <= 6; x++) a[y * w + x] = 255;
    a[4 * w + 4] = 0;
    const s = solidSilhouette(a, w, h);
    expect(s[4 * w + 4]).toBe(1);
    expect(s[0]).toBe(0);
  });
  it('measures the exact distance from the shape (continuous, unbroken offset)', () => {
    const w = 21, h = 1;
    const inside = new Uint8Array(w * h);
    inside[10] = 1;
    const d = distanceField(inside, w, h);
    expect(d[10]).toBe(0);
    expect(d[13]).toBe(3);
    expect(d[0]).toBe(10);
  });
});

import { packagingOverlay } from '../lib/packaging3d.js';

describe('3D packaging', () => {
  it('prints the chosen colour, finish, phone and pasta name on the box', () => {
    const svg = packagingOverlay({ pattern: 'tagliatelle', colorId: 'c-verde', colorName: 'Basil', finish: 'overcooked', modelLabel: 'Google Pixel 10' });
    expect(svg).toContain('Basil');
    expect(svg).toContain('Overcooked');
    expect(svg).toContain('Liquid silicone');
    expect(svg).toContain('Google Pixel 10');
    expect(svg).toContain('cy="533"'); // ring around the basil circle
    expect(svg).toContain('Pattern:');
    expect(svg).toContain('cx="1004.65" cy="395.5" r="22"'); // ring around the tagliatelle pattern
    // every pattern has its name on the top flap (with "phone case") and in the side list
    for (const p of ['spaghetti', 'tagliatelle', 'reginette', 'sfoglia', 'raviolo', 'maccheroni', 'penne']) {
      const s = packagingOverlay({ pattern: p, finish: 'raw', modelLabel: 'x', colorName: 'Egg' });
      expect(s, p).toContain('phone case');
      expect(s, p).toContain(`clip-path="url(#pd-${p})"`);
    }
    expect(svg).not.toContain('>Ravioli<');
    // the material stays on one line
    expect(svg.match(/Material:/g)).toHaveLength(1);
  });
});

describe('case specifications', () => {
  it('app (English) and box print the same material and protection for every finish', async () => {
    const { PACK_FINISH } = await import('../lib/packaging3d.js');
    const en = (await import('../i18n/en.js')).default;
    for (const f of ['raw', 'aldente', 'overcooked']) {
      expect(en[`spec.material.${f}`]).toBe(PACK_FINISH[f].material);
      expect(en[`spec.protection.${f}`]).toBe(PACK_FINISH[f].protection);
    }
  });
});

