// Pure helpers to create, place and randomise canvas items.
import { CANVAS_SIZE } from '../data/defaults.js';
import { uid } from './id.js';
import { contrastRatio, bestContrast } from './colors.js';
import { itemScales } from './geometry.js';

export function newItem(asset, category, patch = {}) {
  return {
    uid: uid('item'),
    assetId: asset.id,
    categoryId: asset.categoryId,
    x: CANVAS_SIZE / 2,
    y: CANVAS_SIZE / 2,
    scale: 1,
    stretchX: 1,
    stretchY: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
    colors: {},
    ...patch,
  };
}

/** Axis-aligned bbox of an item on the canvas (accounts for rotation/stretch). */
export function itemBox(item, asset) {
  if (!asset) return { x: item.x, y: item.y, width: 0, height: 0 };
  const { sx, sy } = itemScales(item);
  const w = asset.width / 2;
  const h = asset.height / 2;
  const c = Math.cos((item.rotation * Math.PI) / 180);
  const s = Math.sin((item.rotation * Math.PI) / 180);
  const xs = [];
  const ys = [];
  for (const [lx, ly] of [[-w, -h], [w, -h], [w, h], [-w, h]]) {
    const px = lx * sx;
    const py = ly * sy;
    xs.push(item.x + px * c - py * s);
    ys.push(item.y + px * s + py * c);
  }
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

export function contentBox(items, assetsById) {
  const boxes = items.map((it) => itemBox(it, assetsById[it.assetId])).filter((b) => b.width || b.height);
  if (!boxes.length) return { x: 0, y: 0, width: CANVAS_SIZE, height: CANVAS_SIZE };
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const x2 = Math.max(...boxes.map((b) => b.x + b.width));
  const y2 = Math.max(...boxes.map((b) => b.y + b.height));
  return { x, y, width: x2 - x, height: y2 - y };
}

/** Index in the items array where an item of `category` should be inserted (z-order). */
export function insertionIndex(items, category, categoriesById) {
  let idx = 0;
  items.forEach((it, i) => {
    const z = categoriesById[it.categoryId]?.zIndex ?? 0;
    if (z <= category.zIndex) idx = i + 1;
  });
  return idx;
}

function findBase(items, categoriesById) {
  return items.find((it) => categoriesById[it.categoryId]?.isBase);
}

/**
 * Default placement for a new element. If a "base" element exists (e.g. the
 * body), the category anchor is interpreted inside the base's bbox and the
 * element is scaled to fit it; otherwise the anchor is relative to the canvas.
 */
export function placementFor(asset, category, items, assetsById, categoriesById) {
  const anchor = category.anchor || { x: 0.5, y: 0.5 };
  const base = category.isBase ? null : findBase(items, categoriesById);
  if (base && assetsById[base.assetId]) {
    const b = itemBox(base, assetsById[base.assetId]);
    // reference width: the base width, but not less than half its height
    // (so very slim bases like a tagliatella still get readable features)
    const ref = Math.max(b.width, b.height * 0.5);
    const target = (category.size ?? 0.6) * ref;
    // fit the width, but keep tall elements from swallowing the whole face
    const scale = Math.min(target / asset.width, (target * 0.6) / asset.height);
    return {
      x: b.x + anchor.x * b.width,
      y: b.y + anchor.y * b.height,
      scale: round(scale),
    };
  }
  const fit = category.isBase
    ? (CANVAS_SIZE * (category.size ?? 0.7)) / Math.max(asset.width, asset.height)
    : Math.min(1, (CANVAS_SIZE * 0.85) / Math.max(asset.width, asset.height));
  return { x: anchor.x * CANVAS_SIZE, y: anchor.y * CANVAS_SIZE, scale: round(fit) };
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

/**
 * Random composition using only the brand palette.
 *  - base element: fills → random colour, strokes → best-contrast colour
 *  - other elements: one "feature" colour with good contrast on the base
 */
export function randomComposition({ categories, assets, palette }, rng = Math.random) {
  const hexes = palette.map((p) => p.hex);
  if (!hexes.length) return [];
  const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const assetsById = Object.fromEntries(assets.map((a) => [a.id, a]));

  const baseColor = pick(hexes, rng);
  const others = hexes.filter((h) => h !== baseColor);
  const readable = others.filter((h) => contrastRatio(h, baseColor) >= 2.2);
  const featureColor = readable.length ? pick(readable, rng) : bestContrast(others.length ? others : hexes, baseColor);
  const outlineColor = bestContrast(others.length ? others : hexes, baseColor);
  // details (pupils, inner lines) need contrast against the feature colour
  const notFeature = hexes.filter((h) => h !== featureColor);
  const detailPool = notFeature.filter((h) => contrastRatio(h, featureColor) >= 2);
  const detailColor = detailPool.length ? pick(detailPool, rng) : bestContrast(notFeature.length ? notFeature : hexes, featureColor);

  // bases first so that features can be placed relative to them
  const ordered = [...categories]
    .filter((c) => c.inRandom)
    .sort((a, b) => (b.isBase ? 1 : 0) - (a.isBase ? 1 : 0) || a.zIndex - b.zIndex);

  let items = [];
  for (const cat of ordered) {
    const list = assets.filter((a) => a.categoryId === cat.id);
    if (!list.length) continue;
    if (!cat.required && rng() < 0.5) continue;
    const asset = pick(list, rng);
    const colors = {};
    const hasDetails = (asset.slots || []).some((s) => s.kind === 'fill' && !s.synthetic);
    const hasBase = (asset.slots || []).some((s) => s.synthetic);
    // elements without separate details: randomly swap fill/outline for variety
    // (never let a feature's fill blend into the body colour)
    const swap = !hasDetails && detailColor !== baseColor && rng() < 0.5;
    for (const slot of asset.slots || []) {
      if (cat.isBase) colors[slot.id] = slot.kind === 'stroke' ? outlineColor : baseColor;
      else if (slot.kind === 'stroke') colors[slot.id] = swap ? featureColor : detailColor;
      else if (slot.synthetic || !hasBase) colors[slot.id] = swap ? detailColor : featureColor;
      else colors[slot.id] = detailColor;
    }
    const place = placementFor(asset, cat, items, assetsById, categoriesById);
    const jitter = cat.isBase ? 1 : 0.9 + rng() * 0.2;
    const item = newItem(asset, cat, {
      ...place,
      scale: round(place.scale * jitter),
      rotation: cat.isBase ? 0 : Math.round((rng() - 0.5) * 12),
      colors,
    });
    const at = insertionIndex(items, cat, categoriesById);
    items = [...items.slice(0, at), item, ...items.slice(at)];
  }
  return items;
}

/** When swapping an element for another of the same category, keep colours by slot kind. */
export function remapColors(oldAsset, newAsset, oldColors) {
  if (!oldAsset || !newAsset) return {};
  const byKind = {};
  for (const s of oldAsset.slots || []) {
    if (oldColors[s.id] && !byKind[s.kind]) byKind[s.kind] = oldColors[s.id];
  }
  const out = {};
  for (const s of newAsset.slots || []) if (byKind[s.kind]) out[s.id] = byKind[s.kind];
  return out;
}
