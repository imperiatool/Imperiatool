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
  const margin = (outline.enabled ? outline.width : 0) + 24;
  const vb = { x: box.x - margin, y: box.y - margin, width: box.width + margin * 2, height: box.height + margin * 2 };

  const body = items
    .map((it, i) => {
      const asset = assetsById[it.assetId];
      if (!asset) return '';
      const inner = renderAssetMarkup(asset, it.colors, `e${i}`);
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

export async function shareBlob(blob, filename, text = 'Il mio sticker') {
  const file = new File([blob], filename, { type: blob.type });
  await navigator.share({ files: [file], title: text, text });
}

/* ------------------------------------------------------------------------ */
/* WhatsApp sticker                                                          */
/* ------------------------------------------------------------------------ */
// WhatsApp sticker spec: 512×512 px, transparent background, ~16 px margin,
// WebP, max 100 KB for static stickers.
export const WA_STICKER = { size: 512, margin: 16, maxBytes: 100 * 1024 };

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

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Renders the composition as a WhatsApp-ready sticker.
 * Returns { blob, format: 'webp' | 'png', bytes }. Browsers that cannot encode
 * WebP (older Safari) silently return PNG from toBlob → we report it.
 */
export async function makeWhatsAppSticker(items, assetsById, outline = { enabled: true, color: '#ffffff', width: 26 }) {
  const { svg, width, height } = buildStickerSvg(items, assetsById, { outline });
  const img = await loadSvgImage(svg);
  const { size, margin, maxBytes } = WA_STICKER;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const scale = (size - margin * 2) / Math.max(width, height);
  const w = width * scale;
  const h = height * scale;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

  let blob = null;
  for (const q of [0.92, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35]) {
    blob = await toBlob(canvas, 'image/webp', q);
    if (!blob || blob.type !== 'image/webp') break; // no WebP encoder
    if (blob.size <= maxBytes) break;
  }
  if (!blob || blob.type !== 'image/webp') {
    blob = await toBlob(canvas, 'image/png');
    return { blob, format: 'png', bytes: blob.size };
  }
  return { blob, format: 'webp', bytes: blob.size };
}

/** 'ios' | 'android' | 'desktop' — only used to highlight the right instructions. */
export function detectPlatform() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}
