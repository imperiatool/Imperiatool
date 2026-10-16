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
