// Builds a standalone SVG of the composition and rasterises it to PNG.
import { renderAssetMarkup } from './svgParser.js';
import { itemTransform } from './geometry.js';
import { contentBox } from './composition.js';

/**
 * @param opts.outline     { enabled, color, width } – die-cut sticker border
 * @param opts.background  hex or null (transparent)
 * @param opts.crop        true → crop to content, false → full canvas
 */
export function buildStickerSvg(items, assetsById, opts = {}) {
  const { outline = { enabled: true, color: '#ffffff', width: 28 }, background = null, crop = true, canvasSize = 1400 } = opts;
  items = items.filter((it) => !it.hidden && assetsById[it.assetId]);
  const box = crop ? contentBox(items, assetsById) : { x: 0, y: 0, width: canvasSize, height: canvasSize };
  const margin = opts.pad ?? (outline.enabled ? outline.width : 0) + 24;
  const vb = { x: box.x - margin, y: box.y - margin, width: box.width + margin * 2, height: box.height + margin * 2 };

  const body = items
    .map((it, i) => {
      const asset = assetsById[it.assetId];
      if (!asset) return '';
      const inner = renderAssetMarkup(asset, it.colors, `e${i}`, it.strokeScale);
      return `<g transform="${itemTransform(it)}"><g transform="translate(${-asset.width / 2} ${-asset.height / 2})">${inner}</g></g>`;
    })
    .join('');

  const filter = outline.enabled
    ? `<defs><filter id="die-cut" filterUnits="userSpaceOnUse" x="${vb.x}" y="${vb.y}" width="${vb.width}" height="${vb.height}">
  <feMorphology in="SourceAlpha" operator="dilate" radius="${outline.width}" result="spread"/>
  <feFlood flood-color="${outline.color}"/>
  <feComposite in2="spread" operator="in" result="border"/>
  <feMerge><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter></defs>`
    : '';

  const bg = background ? `<rect x="${vb.x}" y="${vb.y}" width="${vb.width}" height="${vb.height}" fill="${background}"/>` : '';
  const content = outline.enabled ? `<g filter="url(#die-cut)">${body}</g>` : `<g>${body}</g>`;

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb.x} ${vb.y} ${vb.width} ${vb.height}" width="${Math.round(vb.width)}" height="${Math.round(vb.height)}">${filter}${bg}${content}</svg>`,
    width: vb.width,
    height: vb.height,
  };
}

export async function svgToPngBlob(svgString, width, height, maxSide = 1024) {
  const scale = maxSide / Math.max(width, height);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("Impossibile generare l'immagine"));
      im.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(blob);
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function canShareFiles() {
  try {
    const f = new File([''], 'x.png', { type: 'image/png' });
    return !!(navigator.canShare && navigator.canShare({ files: [f] }));
  } catch {
    return false;
  }
}

export async function shareBlob(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });
  // files only: some apps (WhatsApp) drop the image when text is attached
  await navigator.share({ files: [file] });
}

/* ------------------------------------------------------------------------ */
/* Raster sticker with a die-cut border                                      */
/* ------------------------------------------------------------------------ */

async function loadSvgImage(svgString) {
  const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    return await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('render'));
      im.src = url;
    });
  } finally {
    // revoked after decode
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** Felzenszwalb–Huttenlocher squared distance transform, 1D pass (in place). */
function edt1d(f, n, d, v, z) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s;
    do {
      const p = v[k];
      s = (f[q] + q * q - (f[p] + p * p)) / (2 * q - 2 * p);
    } while (s <= z[k] && --k >= 0);
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const p = v[k];
    d[q] = (q - p) * (q - p) + f[p];
  }
}

/**
 * Distance (px) from every pixel to the nearest pixel of the shape.
 * `inside` is 1 for shape pixels.
 */
export function distanceField(inside, w, h) {
  const INF = 1e12;
  const grid = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) grid[i] = inside[i] ? 0 : INF;
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, h, d, v, z);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    edt1d(f, w, d, v, z);
    for (let x = 0; x < w; x++) grid[y * w + x] = Math.sqrt(d[x]);
  }
  return grid;
}

/** Silhouette with the inner holes filled (transparent areas the outside cannot reach). */
export function solidSilhouette(alpha, w, h, threshold = 110) {
  const inside = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) inside[i] = alpha[i] >= threshold ? 1 : 0;
  const outside = new Uint8Array(w * h);
  const stack = [];
  const push = (i) => {
    if (!inside[i] && !outside[i]) {
      outside[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < w * (h - 1)) push(i + w);
  }
  for (let i = 0; i < w * h; i++) inside[i] = outside[i] ? 0 : 1;
  return inside;
}

/**
 * Raster sticker, always on a transparent background. The die-cut border is
 * an exact offset of the silhouette (distance transform, inner holes filled,
 * anti-aliased edge): one clean, unbroken line all around.
 */
export async function renderStickerCanvas(items, assetsById, { border = { width: 26, color: '#ffffff' }, maxSide = 1024 } = {}) {
  const bw = border?.width > 0 ? border.width : 0;
  const { svg, width, height } = buildStickerSvg(items, assetsById, { outline: { enabled: false }, pad: bw + 10 });
  const img = await loadSvgImage(svg);
  const scale = maxSide / Math.max(width, height);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const out = makeCanvas(w, h);
  const ctx = out.getContext('2d');
  if (bw) {
    const art = makeCanvas(w, h);
    const actx = art.getContext('2d', { willReadFrequently: true });
    actx.drawImage(img, 0, 0, w, h);
    const src = actx.getImageData(0, 0, w, h).data;
    const alpha = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) alpha[i] = src[i * 4 + 3];
    const dist = distanceField(solidSilhouette(alpha, w, h), w, h);
    const r = bw * scale;
    const n = parseInt((border.color || '#ffffff').slice(1), 16);
    const layer = ctx.createImageData(w, h);
    const px = layer.data;
    // white border + a soft grey rim just outside it, so the border stays
    // visible on white backgrounds too (and on dark ones it is simply white)
    const rim = Math.max(1.2, r * 0.09);
    for (let i = 0; i < w * h; i++) {
      const d = dist[i];
      const a = Math.max(0, Math.min(1, r + 0.5 - d));
      if (a >= 1) {
        px[i * 4] = (n >> 16) & 255;
        px[i * 4 + 1] = (n >> 8) & 255;
        px[i * 4 + 2] = n & 255;
        px[i * 4 + 3] = 255;
        continue;
      }
      const g = Math.max(0, Math.min(1, (r + rim - d) / rim)) * 0.28; // grey rim alpha
      const outA = a + g * (1 - a);
      if (outA <= 0) continue;
      const mix = (c) => Math.round((c * a + 120 * g * (1 - a)) / outA);
      px[i * 4] = mix((n >> 16) & 255);
      px[i * 4 + 1] = mix((n >> 8) & 255);
      px[i * 4 + 2] = mix(n & 255);
      px[i * 4 + 3] = Math.round(outA * 255);
    }
    ctx.putImageData(layer, 0, 0);
  }
  ctx.drawImage(img, 0, 0, w, h);
  return out;
}

export const canvasToBlob = (canvas, type = 'image/png', quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Copies the sticker to the clipboard as a transparent PNG (the only image
 * type browsers can write). Nothing else goes with it: an extra HTML copy made
 * some web editors paste the HTML/data-URL version instead of the image.
 * Whether the transparency survives after pasting depends on the destination:
 * chats keep it (WhatsApp, Telegram…), while feed posts on Instagram and
 * LinkedIn are re-encoded as JPEG by those platforms, which fills it with white.
 */
export async function copyImage(blob) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('no-clipboard');
  if (blob?.type !== 'image/png') throw new Error('not-png');
  // a promise keeps the user gesture valid in Safari while the PNG is ready
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': Promise.resolve(blob) })]);
}
export const canCopyImage = () => typeof navigator !== 'undefined' && !!navigator.clipboard?.write && typeof ClipboardItem !== 'undefined';

/** 'ios' | 'android' | 'desktop' */
export function detectPlatform() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}
