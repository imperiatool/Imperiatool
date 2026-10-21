/**
 * SVG import pipeline used by the Admin panel (and by the first-run seed).
 *
 *   text ──parseSvgText──▶ { svg, layers }              (CSS classes inlined)
 *   layer ─extractElements─▶ [{ bbox, markup, … }]       (separated elements)
 *   element ─buildAsset──▶ { markup with {{sN}}, slots } (recolourable asset)
 *
 * Design tools (Illustrator, Figma, Inkscape) export in different ways:
 *   - styles as CSS classes (`.st5 { fill:none; stroke:#000 }`) → inlined;
 *   - hidden layers via `display:none` → reported as not visible;
 *   - one element = one <g>, OR several loose paths (e.g. a pair of eyes)
 *     → loose shapes are grouped by spatial proximity (union-find on bboxes).
 */
import { normalizeColor } from './colors.js';
import { humanize } from './id.js';

export const SVG_NS = 'http://www.w3.org/2000/svg';

const SHAPE_TAGS = new Set([
  'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'text', 'use', 'image',
]);
const NON_RENDERING = new Set([
  'defs', 'style', 'title', 'desc', 'metadata', 'clipPath', 'mask', 'linearGradient',
  'radialGradient', 'pattern', 'symbol', 'marker', 'filter', 'sodipodi:namedview',
]);
// Presentation properties we turn from CSS into attributes.
const PRESENTATION = new Set([
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray',
  'stroke-dashoffset', 'opacity', 'display', 'visibility', 'clip-path', 'mask',
  'clip-rule', 'stop-color', 'stop-opacity', 'font-family', 'font-size', 'font-weight',
  'letter-spacing', 'text-anchor', 'mix-blend-mode', 'isolation', 'filter',
]);
// Properties that inherit from ancestors (we copy them onto shapes so that
// an element keeps its look once it is lifted out of its original layer).
const INHERITED = [
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray',
  'stroke-dashoffset', 'clip-rule', 'font-family', 'font-size', 'font-weight',
  'letter-spacing', 'text-anchor', 'visibility',
];

/* ------------------------------------------------------------------------ */
/* Parsing & CSS inlining                                                    */
/* ------------------------------------------------------------------------ */

export function parseSvgText(text) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const err = doc.getElementsByTagName('parsererror')[0];
  if (err) throw new Error('File SVG non valido: ' + err.textContent.slice(0, 160));
  const svg = doc.documentElement;
  if (!svg || svg.localName !== 'svg') throw new Error('Il file non contiene un elemento <svg>.');

  inlineCss(svg);
  resolveInheritedPresentation(svg);

  return {
    doc,
    svg,
    viewBox: getViewBox(svg),
    layers: listLayers(svg),
  };
}

export function getViewBox(svg) {
  const vb = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb.every(Number.isFinite)) {
    return { x: vb[0], y: vb[1], width: vb[2], height: vb[3] };
  }
  const w = parseFloat(svg.getAttribute('width')) || 1000;
  const h = parseFloat(svg.getAttribute('height')) || 1000;
  return { x: 0, y: 0, width: w, height: h };
}

/** Very small CSS parser: enough for what design tools emit. */
export function parseCss(cssText) {
  const rules = [];
  const css = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /([^{}@]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const decls = parseDeclarations(m[2]);
    for (const sel of m[1].split(',')) {
      const selector = sel.trim();
      if (selector) rules.push({ selector, decls });
    }
  }
  return rules;
}

export function parseDeclarations(text) {
  const out = {};
  for (const part of String(text || '').split(';')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    const key = part.slice(0, i).trim().toLowerCase();
    const value = part.slice(i + 1).replace(/!important/i, '').trim();
    if (key) out[key] = value;
  }
  return out;
}

function compileSelector(selector) {
  // Supports: tag, .class, #id and compounds like path.st1 (no combinators).
  if (/[\s>+~:[\]]/.test(selector)) return null;
  const tag = (selector.match(/^[a-zA-Z][\w-]*/) || [])[0] || null;
  const id = (selector.match(/#([\w-]+)/) || [])[1] || null;
  const classes = [...selector.matchAll(/\.([\w-]+)/g)].map((x) => x[1]);
  return (el) => {
    if (tag && el.localName !== tag) return false;
    if (id && el.getAttribute('id') !== id) return false;
    if (classes.length) {
      const own = (el.getAttribute('class') || '').split(/\s+/);
      if (!classes.every((c) => own.includes(c))) return false;
    }
    return true;
  };
}

export function inlineCss(svg) {
  const styleEls = [...svg.getElementsByTagName('style')];
  const rules = parseCss(styleEls.map((s) => s.textContent).join('\n'))
    .map((r) => ({ ...r, match: compileSelector(r.selector) }))
    .filter((r) => r.match);

  for (const el of [svg, ...svg.getElementsByTagName('*')]) {
    const merged = {};
    for (const rule of rules) if (rule.match(el)) Object.assign(merged, rule.decls);
    Object.assign(merged, parseDeclarations(el.getAttribute('style')));
    for (const [k, v] of Object.entries(merged)) {
      if (PRESENTATION.has(k)) el.setAttribute(k, v);
    }
    el.removeAttribute('class');
    el.removeAttribute('style');
  }
  styleEls.forEach((s) => s.parentNode && s.parentNode.removeChild(s));
}

/** Writes inherited paint/stroke attributes explicitly on every shape. */
export function resolveInheritedPresentation(svg) {
  for (const el of svg.getElementsByTagName('*')) {
    if (!SHAPE_TAGS.has(el.localName)) continue;
    for (const attr of INHERITED) {
      if (el.hasAttribute(attr)) continue;
      let p = el.parentNode;
      while (p && p.nodeType === 1) {
        if (p.hasAttribute && p.hasAttribute(attr)) {
          el.setAttribute(attr, p.getAttribute(attr));
          break;
        }
        p = p.parentNode;
      }
    }
    if (!el.hasAttribute('fill') && el.localName !== 'line' && el.localName !== 'image') {
      el.setAttribute('fill', '#000000'); // SVG default
    }
  }
}

export function isHidden(el) {
  const display = (el.getAttribute('display') || '').trim();
  const vis = (el.getAttribute('visibility') || '').trim();
  const op = el.getAttribute('opacity');
  return display === 'none' || vis === 'hidden' || (op != null && parseFloat(op) === 0);
}

function isRendering(el) {
  return el.nodeType === 1 && !NON_RENDERING.has(el.localName) && !NON_RENDERING.has(el.nodeName);
}

/** Top-level <g> of the document = "layers" in Illustrator/Figma exports. */
export function listLayers(svg) {
  const layers = [];
  const loose = [];
  [...svg.children].forEach((el, i) => {
    if (!isRendering(el)) return;
    if (el.localName === 'g') {
      layers.push({
        key: `layer-${i}`,
        id: el.getAttribute('id') || `layer-${i}`,
        name: humanize(el.getAttribute('data-name') || el.getAttribute('id') || `Livello ${i + 1}`),
        visible: !isHidden(el),
        childCount: [...el.children].filter(isRendering).length,
        el,
      });
    } else {
      loose.push(el);
    }
  });
  if (loose.length) {
    // Shapes placed directly on the root become a virtual layer.
    const g = svg.ownerDocument.createElementNS(SVG_NS, 'g');
    g.setAttribute('id', '__root__');
    loose.forEach((el) => g.appendChild(el.cloneNode(true)));
    layers.unshift({
      key: 'layer-root',
      id: '__root__',
      name: 'Elementi senza livello',
      visible: true,
      childCount: loose.length,
      el: g,
      virtual: true,
    });
  }
  return layers;
}

/* ------------------------------------------------------------------------ */
/* Element extraction                                                        */
/* ------------------------------------------------------------------------ */

function hasVisiblePaint(el) {
  if (isHidden(el)) return false;
  if (SHAPE_TAGS.has(el.localName)) {
    if (el.localName === 'image' || el.localName === 'use' || el.localName === 'text') return true;
    const fill = normalizeColor(el.getAttribute('fill'));
    const stroke = normalizeColor(el.getAttribute('stroke'));
    const fillVisible = fill !== 'none';
    const strokeVisible = stroke && stroke !== 'none' && parseFloat(el.getAttribute('stroke-width') ?? '1') > 0;
    return fillVisible || strokeVisible;
  }
  return [...el.children].some((c) => isRendering(c) && hasVisiblePaint(c));
}

function containsImage(el) {
  return el.localName === 'image' || el.getElementsByTagName('image').length > 0;
}

/** Descends through wrapper groups that only contain one rendering child. */
function unwrap(el) {
  let cur = el;
  for (;;) {
    const kids = [...cur.children].filter((c) => isRendering(c) && hasVisiblePaint(c));
    if (kids.length === 1 && kids[0].localName === 'g' && !kids[0].getAttribute('transform')) {
      cur = kids[0];
    } else return cur;
  }
}

function ancestorTransform(el, stopAt) {
  const parts = [];
  let p = el.parentNode;
  while (p && p.nodeType === 1 && p !== stopAt) {
    const t = p.getAttribute && p.getAttribute('transform');
    if (t) parts.unshift(t);
    p = p.parentNode;
  }
  return parts.join(' ');
}

function ancestorOpacity(el, stopAt) {
  let o = 1;
  let p = el.parentNode;
  while (p && p.nodeType === 1 && p !== stopAt) {
    const v = p.getAttribute && p.getAttribute('opacity');
    if (v != null) o *= parseFloat(v);
    p = p.parentNode;
  }
  return o;
}

function maxStrokeWidth(el) {
  let max = 0;
  const all = [el, ...el.getElementsByTagName('*')];
  for (const n of all) {
    const s = normalizeColor(n.getAttribute && n.getAttribute('stroke'));
    if (s && s !== 'none') max = Math.max(max, parseFloat(n.getAttribute('stroke-width') ?? '1') || 0);
  }
  return max;
}

/** Wraps an element in a <g> carrying the transforms/opacity of its ancestors. */
function wrapWithContext(el, svgRoot) {
  const doc = el.ownerDocument;
  const g = doc.createElementNS(SVG_NS, 'g');
  const t = ancestorTransform(el, svgRoot);
  if (t) g.setAttribute('transform', t);
  const op = ancestorOpacity(el, svgRoot);
  if (op < 1) g.setAttribute('opacity', String(op));
  g.appendChild(el.cloneNode(true));
  return g;
}

/**
 * Measures bounding boxes in the browser (getBBox needs a live, rendered DOM).
 * Returns one {x,y,width,height} per wrapper, in root user units.
 */
export function measureBoxes(wrappers, viewBox) {
  if (typeof document === 'undefined') throw new Error('measureBoxes richiede un browser');
  const host = document.createElementNS(SVG_NS, 'svg');
  host.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
  host.setAttribute('width', String(viewBox.width));
  host.setAttribute('height', String(viewBox.height));
  host.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none';
  document.body.appendChild(host);
  try {
    return wrappers.map((w) => {
      const outer = document.createElementNS(SVG_NS, 'g');
      outer.appendChild(document.importNode(w, true));
      host.appendChild(outer);
      let b;
      try {
        const r = outer.getBBox();
        b = { x: r.x, y: r.y, width: r.width, height: r.height };
      } catch {
        b = { x: 0, y: 0, width: 0, height: 0 };
      }
      host.removeChild(outer);
      return b;
    });
  } finally {
    document.body.removeChild(host);
  }
}

export function boxGap(a, b) {
  const dx = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width));
  const dy = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height));
  return Math.max(dx, dy);
}

export function unionBox(boxes) {
  const x1 = Math.min(...boxes.map((b) => b.x));
  const y1 = Math.min(...boxes.map((b) => b.y));
  const x2 = Math.max(...boxes.map((b) => b.x + b.width));
  const y2 = Math.max(...boxes.map((b) => b.y + b.height));
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

/**
 * Groups boxes whose gap is <= tolerance (union-find, transitive).
 * tolerance < 0 → never merge (one cluster per box).
 * Returns arrays of indices, in reading order (rows top→bottom, then left→right).
 */
export function clusterBoxes(boxes, tolerance) {
  const parent = boxes.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  if (tolerance >= 0) {
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (boxGap(boxes[i], boxes[j]) <= tolerance) parent[find(i)] = find(j);
      }
    }
  }
  const groups = new Map();
  boxes.forEach((_, i) => {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(i);
  });
  const clusters = [...groups.values()].map((idx) => ({ idx, box: unionBox(idx.map((i) => boxes[i])) }));
  return sortReadingOrder(clusters, (c) => c.box).map((c) => c.idx);
}

export function sortReadingOrder(items, getBox) {
  const sorted = [...items].sort((a, b) => getBox(a).y + getBox(a).height / 2 - (getBox(b).y + getBox(b).height / 2));
  const rows = [];
  for (const it of sorted) {
    const b = getBox(it);
    const cy = b.y + b.height / 2;
    const row = rows.find((r) => Math.abs(r.cy - cy) < Math.max(r.h, b.height) * 0.5);
    if (row) row.items.push(it);
    else rows.push({ cy, h: b.height, items: [it] });
  }
  return rows.flatMap((r) => r.items.sort((a, b) => getBox(a).x - getBox(b).x));
}

/**
 * Splits a layer into separate elements.
 * @param mode 'auto'   – each child <g> or loose shape, merged by proximity
 *             'children' – one element per direct child, no merging
 *             'layer'  – the whole layer is a single element
 */
export function extractElements(parsed, layer, { mode = 'auto', tolerance = 40, skipImages = true } = {}) {
  const { svg, viewBox } = parsed;
  const root = layer.virtual ? layer.el : unwrap(layer.el);

  let nodes;
  if (mode === 'layer') nodes = [root];
  else {
    nodes = [...root.children].filter(
      (c) => isRendering(c) && hasVisiblePaint(c) && !(skipImages && containsImage(c)),
    );
  }
  if (!nodes.length) return [];

  const wrappers = nodes.map((n) => (layer.virtual ? wrapWithContext(n, layer.el) : wrapWithContext(n, svg)));
  if (mode === 'layer') {
    // Display the layer even if it was hidden in the source file.
    wrappers.forEach((w) => w.firstChild.removeAttribute('display'));
  }
  const boxes = measureBoxes(wrappers, viewBox);
  const strokes = nodes.map(maxStrokeWidth);

  const clusters = mode === 'auto' ? clusterBoxes(boxes, tolerance) : clusterBoxes(boxes, -1);
  const serializer = new XMLSerializer();

  return clusters
    .map((idx) => {
      const box = unionBox(idx.map((i) => boxes[i]));
      const pad = Math.max(...idx.map((i) => strokes[i])) / 2 + 2;
      const inner = idx.map((i) => serializer.serializeToString(wrappers[i])).join('');
      const defs = collectDefs(parsed.doc, inner, serializer);
      return composeElement(box, pad, inner, defs, idx.length);
    })
    .filter((e) => e.box.width > 0.5 || e.box.height > 0.5);
}

function composeElement(box, pad, inner, defs, memberCount) {
  return {
    box,
    pad,
    inner,
    defs,
    width: box.width + pad * 2,
    height: box.height + pad * 2,
    rawMarkup: `${defs}<g transform="translate(${r(-box.x + pad)} ${r(-box.y + pad)})">${inner}</g>`,
    memberCount,
  };
}

/** Joins several extracted elements into one (keeps their relative positions). */
export function mergeElements(elements) {
  const box = unionBox(elements.map((e) => e.box));
  const pad = Math.max(...elements.map((e) => e.pad));
  return composeElement(
    box,
    pad,
    elements.map((e) => e.inner).join(''),
    elements.map((e) => e.defs).join(''),
    elements.reduce((n, e) => n + e.memberCount, 0),
  );
}

/** Treats every visible layer of the document as a single element. */
export function extractWholeDocument(parsed) {
  const g = parsed.doc.createElementNS(SVG_NS, 'g');
  for (const layer of parsed.layers) {
    if (!layer.visible) continue;
    if (layer.virtual) [...layer.el.children].forEach((c) => g.appendChild(c.cloneNode(true)));
    else g.appendChild(layer.el.cloneNode(true));
  }
  const layer = { key: 'whole', id: '__whole__', name: 'Documento', visible: true, el: g, virtual: true };
  return extractElements(parsed, layer, { mode: 'layer' })[0] || null;
}

function r(n) {
  return Math.round(n * 1000) / 1000;
}

/** Copies gradients/clipPaths referenced via url(#id) or href="#id". */
function collectDefs(doc, markup, serializer) {
  const ids = new Set();
  const queue = [markup];
  const out = [];
  while (queue.length) {
    const text = queue.pop();
    for (const m of text.matchAll(/url\(\s*['"]?#([^'")\s]+)['"]?\s*\)|href="#([^"]+)"/g)) {
      const id = m[1] || m[2];
      if (ids.has(id)) continue;
      ids.add(id);
      const el = doc.getElementById ? doc.getElementById(id) : doc.querySelector(`[id="${id}"]`);
      if (el) {
        const s = serializer.serializeToString(el);
        out.push(s);
        queue.push(s);
      }
    }
  }
  return out.length ? `<defs>${out.join('')}</defs>` : '';
}

/* ------------------------------------------------------------------------ */
/* Asset building: colour slots                                              */
/* ------------------------------------------------------------------------ */

const CLOSED_TAGS = new Set(['circle', 'ellipse', 'rect', 'polygon']);
function isClosed(el) {
  if (CLOSED_TAGS.has(el.localName)) return true;
  if (el.localName === 'path') return /z\s*$/i.test((el.getAttribute('d') || '').trim());
  return false;
}

/**
 * Turns raw element markup into a recolourable asset:
 * every distinct (fill|stroke, colour) pair becomes a "slot" and the attribute
 * value is replaced by a {{sN}} placeholder, filled at render time.
 *
 * @param fillOutlines  shapes drawn with stroke only (fill:none, closed) receive
 *                      a new "Riempimento" slot — useful for outline-only bodies.
 */
export function buildAsset(rawMarkup, { fillOutlines = false, outlineFill = '#ffffff' } = {}) {
  const doc = new DOMParser().parseFromString(
    `<svg xmlns="${SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink">${rawMarkup}</svg>`,
    'image/svg+xml',
  );
  const svg = doc.documentElement;
  const slots = [];
  const byKey = new Map();
  const slotFor = (kind, hex, labelHint) => {
    const key = `${kind}:${hex}`;
    if (!byKey.has(key)) {
      const id = `s${slots.length}`;
      slots.push({ id, kind, original: hex, label: labelHint });
      byKey.set(key, id);
    }
    return byKey.get(key);
  };

  for (const el of svg.getElementsByTagName('*')) {
    // strip ids that nothing references (avoid duplicates on the canvas)
    el.removeAttribute('data-name');
    if (el.localName === 'stop') {
      const c = normalizeColor(el.getAttribute('stop-color'));
      if (c && c !== 'none') el.setAttribute('stop-color', `{{${slotFor('stop', c, 'Sfumatura')}}}`);
      continue;
    }
    if (!SHAPE_TAGS.has(el.localName)) continue;
    const fill = normalizeColor(el.getAttribute('fill'));
    const stroke = normalizeColor(el.getAttribute('stroke'));
    if (fill && fill !== 'none') el.setAttribute('fill', `{{${slotFor('fill', fill, 'Riempimento')}}}`);
    if (stroke && stroke !== 'none') el.setAttribute('stroke', `{{${slotFor('stroke', stroke, 'Contorno')}}}`);
    if (fillOutlines && fill === 'none' && stroke && stroke !== 'none' && isClosed(el)) {
      el.setAttribute('fill', `{{${slotFor('fill', `outline:${outlineFill}`, 'Base')}}}`);
      el.setAttribute('data-sf', '1');
    }
  }
  if (fillOutlines) moveFilledOutlinesBehind(svg);
  // outline fill slots carry the synthetic key; expose the real default colour
  slots.forEach((s) => {
    if (s.original.startsWith('outline:')) {
      s.original = s.original.slice('outline:'.length);
      s.synthetic = true;
    }
  });
  labelSlots(slots);

  const referenced = new Set([...rawMarkup.matchAll(/url\(\s*['"]?#([^'")\s]+)|href="#([^"]+)"/g)].map((m) => m[1] || m[2]));
  for (const el of svg.getElementsByTagName('*')) {
    const id = el.getAttribute('id');
    if (id && !referenced.has(id)) el.removeAttribute('id');
  }

  const serializer = new XMLSerializer();
  const markup = [...svg.childNodes]
    .map((n) => serializer.serializeToString(n))
    .join('')
    .replace(/ xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');
  return { markup, slots };
}

/**
 * Outline shapes that just received a fill would now cover the details drawn
 * before them (e.g. pupils drawn before the eye ring). Move every top-level
 * part containing a newly-filled outline behind the others, keeping order.
 */
function moveFilledOutlinesBehind(svg) {
  const container = [...svg.children].reverse().find((c) => c.localName === 'g');
  if (container) {
    const parts = [...container.children];
    const filled = parts.filter((p) => p.getAttribute('data-sf') || p.querySelector('[data-sf]'));
    const rest = parts.filter((p) => !filled.includes(p));
    [...filled, ...rest].forEach((p) => container.appendChild(p));
  }
  for (const el of [...svg.querySelectorAll('[data-sf]')]) el.removeAttribute('data-sf');
}

function labelSlots(slots) {
  // fills first (they are what people want to recolour), then strokes.
  slots.sort((a, b) => order(a) - order(b));
  const counters = {};
  const totals = {};
  slots.forEach((s) => (totals[s.label] = (totals[s.label] || 0) + 1));
  slots.forEach((s) => {
    counters[s.label] = (counters[s.label] || 0) + 1;
    if (totals[s.label] > 1) s.label = `${s.label} ${counters[s.label]}`;
  });
  function order(s) {
    return s.kind === 'fill' ? (s.synthetic ? 0 : 1) : s.kind === 'stroke' ? 2 : 3;
  }
}

/* ------------------------------------------------------------------------ */
/* Rendering                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * Replaces {{sN}} placeholders and scopes ids so instances never collide.
 * `strokeScale` makes every outline thicker or thinner (1 = as drawn).
 */
export function renderAssetMarkup(asset, colors = {}, idPrefix = '', strokeScale = 1) {
  if (!asset) return '';
  const map = {};
  for (const s of asset.slots || []) map[s.id] = colors[s.id] || s.original;
  let out = asset.markup.replace(/\{\{(s\d+)\}\}/g, (_, id) => map[id] || '#6a3933');
  if (strokeScale && strokeScale !== 1) out = scaleStrokes(out, strokeScale);
  if (idPrefix) out = scopeIds(out, idPrefix);
  return out;
}

export function scaleStrokes(markup, k) {
  const f = (v) => String(Math.round(parseFloat(v) * k * 100) / 100);
  return markup
    .replace(/stroke-width="([\d.]+)(px)?"/g, (_, v, u) => `stroke-width="${f(v)}${u || ''}"`)
    .replace(/stroke-width:\s*([\d.]+)(px)?/g, (_, v, u) => `stroke-width: ${f(v)}${u || ''}`);
}

export function scopeIds(markup, prefix) {
  return markup
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g, (_, q, id) => `url(#${prefix}-${id})`)
    .replace(/href="#([^"]+)"/g, (_, id) => `href="#${prefix}-${id}"`);
}

/** Convenience used by the importer UI and the seed. */
export function elementsToAssets(elements, { fillOutlines, outlineFill } = {}) {
  return elements.map((el) => {
    const { markup, slots } = buildAsset(el.rawMarkup, { fillOutlines, outlineFill });
    return { width: round2(el.width), height: round2(el.height), markup, slots };
  });
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** Colours found in a layer, in reading order (used to import the brand palette). */
export function extractPaletteColors(parsed, layer) {
  const elements = extractElements(parsed, layer, { mode: 'children' });
  const out = [];
  for (const el of elements) {
    const { slots } = buildAsset(el.rawMarkup);
    const fill = slots.find((s) => s.kind === 'fill' && !s.synthetic);
    if (fill && !out.includes(fill.original)) out.push(fill.original);
  }
  return out;
}
