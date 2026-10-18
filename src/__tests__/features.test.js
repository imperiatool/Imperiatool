import { describe, it, expect, beforeEach } from 'vitest';
import { createHash } from 'node:crypto';
import { _sha256Js, hashPassword } from '../lib/auth.js';
import en from '../i18n/en.js';
import it_ from '../i18n/it.js';
import es from '../i18n/es.js';
import fr from '../i18n/fr.js';
import { translate, slotLabel } from '../i18n/index.js';
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
  it('every language has exactly the English keys', () => {
    const keys = Object.keys(en).sort();
    for (const dict of [it_, es, fr]) expect(Object.keys(dict).sort()).toEqual(keys);
  });
  it('keeps placeholders in every translation', () => {
    for (const dict of [it_, es, fr]) {
      for (const [k, v] of Object.entries(en)) {
        const ph = (v.match(/\{\w+\}/g) || []).sort();
        expect([k, (dict[k].match(/\{\w+\}/g) || []).sort()]).toEqual([k, ph]);
      }
    }
  });
  it('interpolates and falls back to English', () => {
    expect(translate('it', 'imp.found', { n: 3 })).toBe('3 elementi trovati');
    expect(translate('xx', 'editor.randomize')).toBe('Randomize');
  });
  it('localises colour-zone labels created by the importer', () => {
    const t = (k) => translate('en', k);
    expect(slotLabel({ label: 'Dettagli 2' }, t)).toBe('Details 2');
    expect(slotLabel({ label: 'Contorno' }, t)).toBe('Outline');
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

import { coverHeightAt, COVER_PATTERNS, COVER_SIZE } from '../lib/cover3d.js';
import { roundRectArc, roundRectPerimeter, sdRoundRect } from '../lib/three/geometry.js';
import { ASSET_LABELS } from '../data/labels.js';

describe('phone cover patterns', () => {
  it('every pattern has relief and none inside the camera opening', () => {
    const cam = COVER_SIZE.camera;
    for (const p of COVER_PATTERNS) {
      let max = 0;
      for (let x = -30; x <= 30; x += 1.3) for (let y = -70; y <= 0; y += 1.3) max = Math.max(max, coverHeightAt(p, x, y));
      expect(max, p).toBeGreaterThan(0.5);
      expect(coverHeightAt(p, cam.x, cam.y), p).toBe(0);
    }
  });
  it('keeps the relief away from the outer edge (no stair-step at the border)', () => {
    for (const p of COVER_PATTERNS) {
      expect(coverHeightAt(p, 0, 74 - 0.6), p).toBe(0);
      expect(coverHeightAt(p, 36 - 0.6, -20), p).toBe(0);
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
    expect(lib.assets.map((a) => a.name)).toEqual(['Cavatappi', 'Raviolo quadrato', 'Ravioli tondi']);
    expect(lib.assets[0].labels.es).toBe('Sacacorchos');
  });
  it('has a translation in every language for every sample element', () => {
    for (const [name, l] of Object.entries(ASSET_LABELS)) for (const c of ['en', 'it', 'es', 'fr']) expect(l[c], `${name}/${c}`).toBeTruthy();
  });
});
