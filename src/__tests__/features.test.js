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
    expect(lib.assets[0].labels.en).toBe('Moustache');
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
