import { describe, it, expect } from 'vitest';
import {
  parseSvgText, parseCss, clusterBoxes, boxGap, buildAsset, renderAssetMarkup, scopeIds,
} from '../lib/svgParser.js';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><style>.a{fill:none;stroke:#000;stroke-width:2px}.b{fill:#E3201B}.h{display:none}</style></defs>
  <g id="Visible"><circle class="a" cx="10" cy="10" r="5"/><rect class="b" x="0" y="0" width="5" height="5"/></g>
  <g id="Hidden_Layer" class="h"><path d="M0 0L10 10Z"/></g>
</svg>`;

describe('parseSvgText', () => {
  it('inlines CSS classes as presentation attributes', () => {
    const { svg } = parseSvgText(SAMPLE);
    const circle = svg.getElementsByTagName('circle')[0];
    expect(circle.getAttribute('fill')).toBe('none');
    expect(circle.getAttribute('stroke')).toBe('#000');
    expect(circle.hasAttribute('class')).toBe(false);
    expect(svg.getElementsByTagName('rect')[0].getAttribute('fill')).toBe('#E3201B');
  });

  it('lists top-level layers with visibility and readable names', () => {
    const { layers } = parseSvgText(SAMPLE);
    expect(layers.map((l) => [l.id, l.visible])).toEqual([['Visible', true], ['Hidden_Layer', false]]);
    expect(layers[1].name).toBe('Hidden Layer');
  });

  it('gives shapes without fill the SVG default (black)', () => {
    const { svg } = parseSvgText(SAMPLE);
    expect(svg.getElementsByTagName('path')[0].getAttribute('fill')).toBe('#000000');
  });

  it('rejects invalid files', () => {
    expect(() => parseSvgText('<svg><g></svg>')).toThrow();
    expect(() => parseSvgText('<html></html>')).toThrow();
  });
});

describe('parseCss', () => {
  it('splits grouped selectors', () => {
    const rules = parseCss('.a, .b { fill: red } /* c */ .c{stroke:blue}');
    expect(rules.map((r) => r.selector)).toEqual(['.a', '.b', '.c']);
  });
});

describe('clusterBoxes', () => {
  const box = (x, y, w = 10, h = 10) => ({ x, y, width: w, height: h });

  it('merges nearby shapes (a pair of eyes) and keeps far ones apart', () => {
    const boxes = [box(0, 0), box(15, 0), box(200, 0), box(212, 2)];
    expect(clusterBoxes(boxes, 10)).toEqual([[0, 1], [2, 3]]);
  });

  it('never merges with a negative tolerance', () => {
    expect(clusterBoxes([box(0, 0), box(1, 1)], -1)).toHaveLength(2);
  });

  it('returns clusters in reading order', () => {
    const boxes = [box(100, 100), box(0, 100), box(50, 0)];
    expect(clusterBoxes(boxes, 0)).toEqual([[2], [1], [0]]);
  });

  it('measures gaps on both axes', () => {
    expect(boxGap(box(0, 0), box(20, 0))).toBe(10);
    expect(boxGap(box(0, 0), box(5, 5))).toBe(0);
  });
});

describe('buildAsset', () => {
  it('creates one colour slot per (kind, colour) pair', () => {
    const { markup, slots } = buildAsset(
      '<g><circle fill="#000000" stroke="#000000" r="2"/><rect fill="#e3201b" width="2" height="2"/><rect fill="#E3201B" width="1" height="1"/></g>',
    );
    expect(slots.map((s) => [s.kind, s.original])).toEqual([
      ['fill', '#000000'], ['fill', '#e3201b'], ['stroke', '#000000'],
    ]);
    expect(markup).toContain('{{s0}}');
    expect(markup).not.toContain('#e3201b');
  });

  it('fills outline-only closed shapes and moves them behind the details', () => {
    const raw = '<g transform="translate(0 0)"><g><circle fill="#000000" r="1"/></g><g><circle fill="none" stroke="#000000" r="5"/></g><g><path d="M0 0 L5 5" fill="none" stroke="#000000"/></g></g>';
    const { markup, slots } = buildAsset(raw, { fillOutlines: true, outlineFill: '#ffb548' });
    const base = slots.find((s) => s.synthetic);
    expect(base).toMatchObject({ label: 'Base', original: '#ffb548', kind: 'fill' });
    // the ring (now filled) must come before the pupil
    expect(markup.indexOf('r="5"')).toBeLessThan(markup.indexOf('r="1"'));
    // open paths stay unfilled
    expect(markup).toMatch(/<path[^>]*fill="none"/);
  });
});

describe('rendering', () => {
  const asset = { markup: '<rect fill="{{s0}}" stroke="{{s1}}"/>', slots: [{ id: 's0', original: '#111111' }, { id: 's1', original: '#222222' }] };

  it('applies overrides and falls back to defaults', () => {
    expect(renderAssetMarkup(asset, { s0: '#e3201b' })).toBe('<rect fill="#e3201b" stroke="#222222"/>');
  });

  it('scopes ids so repeated instances do not collide', () => {
    expect(scopeIds('<linearGradient id="g"/><rect fill="url(#g)"/><use href="#g"/>', 'x')).toBe(
      '<linearGradient id="x-g"/><rect fill="url(#x-g)"/><use href="#x-g"/>',
    );
  });
});
