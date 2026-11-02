// Recipe Club share card: an editorial image of the dish made with the recipe
// builder, drawn on a canvas on the device (nothing is uploaded). Two formats:
// a square post (1080×1080) and a vertical story (1080×1920).
import logoUrl from '../assets/imperia-logo.svg?url';

// places around the pasta on the plate (%, centre of each ingredient): the
// same as the plate in the recipe builder
export const SPOTS = [
  [33, 33], [67, 33], [67, 67], [33, 67], [50, 27], [50, 74], [27, 50], [73, 50], [41, 41], [59, 59], [50, 50],
];

export const CARD_FORMATS = { square: { w: 1080, h: 1080 }, story: { w: 1080, h: 1920 } };

const RED = '#e1201b';
const INK = '#1d1d1b';
const MUTED = '#6f6f6b';
const CREAM = '#f6f6f6';
const FONT = "Inter, 'Helvetica Neue', Arial, 'Noto Sans SC', 'Noto Sans Devanagari', sans-serif";

const cache = new Map();
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((resolve) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => resolve(null);
        im.src = src;
      }),
    );
  }
  return cache.get(src);
}

const font = (size, weight = 400) => `${weight} ${size}px ${FONT}`;

/** Lines of `text` that fit `width` (words; characters for Chinese), at most `max`, with an ellipsis. */
export function wrapText(ctx, text, width, max = Infinity) {
  const cjk = /[㐀-鿿]/.test(text);
  const tokens = cjk ? Array.from(text) : text.split(/(\s+)/).filter((s) => s.length);
  const lines = [];
  let cur = '';
  for (const tok of tokens) {
    const next = cur + tok;
    if (cur && ctx.measureText(next.trimEnd()).width > width) {
      lines.push(cur.trimEnd());
      cur = /^\s+$/.test(tok) ? '' : tok;
    } else cur = next;
  }
  if (cur.trim()) lines.push(cur.trim());
  if (lines.length > max) {
    const kept = lines.slice(0, max);
    let last = kept[max - 1];
    while (last && ctx.measureText(`${last}…`).width > width) last = last.slice(0, -1);
    kept[max - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
}

function drawContain(ctx, img, x, y, w, h) {
  if (!img) return;
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
function drawCover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s;
  const sh = h / s;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** The plate of the recipe builder: white plate, light rim, pasta and ingredients in 3D. */
function drawPlate(ctx, cx, cy, d, pasta, ings) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.16)';
  ctx.shadowBlur = d * 0.08;
  ctx.shadowOffsetY = d * 0.035;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // the rim
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = d * (12 / 190);
  ctx.beginPath();
  ctx.arc(cx, cy, d / 2 - ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.stroke();
  const x0 = cx - d / 2;
  const y0 = cy - d / 2;
  drawContain(ctx, pasta, x0 + d * 0.24, y0 + d * 0.24, d * 0.52, d * 0.52);
  ings.forEach((im, n) => {
    const [px, py] = SPOTS[n % SPOTS.length];
    const s = d * 0.24;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    drawContain(ctx, im, x0 + (d * px) / 100 - s / 2, y0 + (d * py) / 100 - s / 2, s, s);
    ctx.restore();
  });
}

/**
 * Draws the card.
 * @param data {
 *   name, subtitle, kind, pastaLabel, pastaName, ingredientsLabel, ingredients: [names],
 *   originsLabel, region, origin, hashtags: [..], pastaImg, ingredientImgs: [urls], photo (url | null)
 * }
 * @returns a canvas
 */
export async function drawRecipeCard(format, data) {
  const { w: W, h: H } = CARD_FORMATS[format] || CARD_FORMATS.square;
  const story = format === 'story';
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (document.fonts?.ready) await document.fonts.ready;
  const [logo, pasta, photo, ...ings] = await Promise.all([loadImage(logoUrl), loadImage(data.pastaImg), loadImage(data.photo), ...data.ingredientImgs.map(loadImage)]);

  const M = story ? 84 : 64; // margin
  const inner = W - M * 2;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  /* header: Imperia Recipe Club, the logo, a thin rule */
  let y = M;
  const logoH = story ? 46 : 38;
  if (logo) {
    const lw = (logo.width / logo.height) * logoH;
    ctx.drawImage(logo, W - M - lw, y, lw, logoH);
  }
  ctx.fillStyle = RED;
  ctx.font = font(story ? 30 : 26, 800);
  ctx.fillText('IMPERIA® RECIPE CLUB', M, y + logoH * 0.78);
  y += logoH + (story ? 30 : 22);
  ctx.fillStyle = INK;
  ctx.fillRect(M, y, inner, 3);
  y += story ? 64 : 50;

  /* kind and name */
  ctx.fillStyle = MUTED;
  ctx.font = font(story ? 26 : 22, 700);
  ctx.fillText(data.kind.toLocaleUpperCase(), M, y);
  y += story ? 22 : 16;
  const titleSize = story ? 82 : 62;
  ctx.font = font(titleSize, 800);
  const titleLines = wrapText(ctx, data.name, inner, story ? 3 : 2);
  ctx.fillStyle = RED;
  for (const l of titleLines) {
    y += titleSize * 1.04;
    ctx.fillText(l, M, y);
  }
  if (data.subtitle) {
    ctx.font = font(story ? 34 : 28, 500);
    ctx.fillStyle = INK;
    for (const l of wrapText(ctx, data.subtitle, inner, 2)) {
      y += (story ? 34 : 28) * 1.3;
      ctx.fillText(l, M, y);
    }
  }
  y += story ? 40 : 30;

  /* the bottom block first (hashtags), so the middle can use the space left */
  const tagSize = story ? 46 : 36;
  const smallTag = story ? 28 : 23;
  ctx.font = font(smallTag, 600);
  const restTags = wrapText(ctx, data.hashtags.slice(1).join('  '), inner, 2);
  const bottomH = tagSize + 14 + restTags.length * smallTag * 1.35;
  const bottomY = H - M - bottomH;

  /* info + origins measured */
  const body = story ? 32 : 25;
  const label = story ? 24 : 20;
  const infoW = story ? inner : Math.round(inner * 0.5);
  ctx.font = font(body, 500);
  const pastaLines = wrapText(ctx, data.pastaName, infoW, 1);
  const ingLines = wrapText(ctx, data.ingredients.join(data.joiner || ', '), infoW, 3);
  const infoH = label * 1.4 + pastaLines.length * body * 1.32 + 18 + label * 1.4 + ingLines.length * body * 1.32;
  // as many lines of the story as fit (the story format keeps room for the plate)
  const avail = bottomY - (story ? 40 : 30) - y - (story ? 420 + 40 : 0) - infoH - (story ? 36 : 26);
  const fit = Math.max(0, Math.min(6, Math.floor((avail - ((story ? 44 : 36) + label * 1.5 + (story ? 40 : 30))) / (body * 1.36))));
  const originLines = data.origin && fit >= 2 ? wrapText(ctx, data.origin, infoW - (story ? 60 : 44), fit) : [];
  const originH = originLines.length ? (story ? 44 : 36) + label * 1.5 + originLines.length * body * 1.36 + (story ? 40 : 30) : 0;

  const drawInfo = (x, top, width) => {
    let yy = top;
    const row = (lab, lines) => {
      ctx.font = font(label, 800);
      ctx.fillStyle = RED;
      yy += label * 1.15;
      ctx.fillText(lab.toLocaleUpperCase(), x, yy);
      ctx.font = font(body, 500);
      ctx.fillStyle = INK;
      yy += 6;
      for (const l of lines) {
        yy += body * 1.32;
        ctx.fillText(l, x, yy);
      }
    };
    row(data.pastaLabel, pastaLines);
    yy += 18;
    row(data.ingredientsLabel, ingLines);
    yy += story ? 36 : 26;
    if (originLines.length) {
      const boxTop = yy;
      const pad = story ? 30 : 22;
      ctx.fillStyle = CREAM;
      roundRect(ctx, x, boxTop, width, originH - (story ? 20 : 14), 18);
      ctx.fill();
      ctx.fillStyle = RED;
      ctx.fillRect(x, boxTop, 8, originH - (story ? 20 : 14));
      yy = boxTop + pad;
      ctx.font = font(label, 800);
      ctx.fillStyle = RED;
      yy += label;
      const head = `${data.originsLabel}${data.region ? ` · ${data.region}` : ''}`.toLocaleUpperCase();
      ctx.fillText(wrapText(ctx, head, width - pad * 2, 1)[0] || '', x + pad, yy);
      ctx.font = font(body, 400);
      ctx.fillStyle = INK;
      yy += 8;
      for (const l of originLines) {
        yy += body * 1.36;
        ctx.fillText(l, x + pad, yy);
      }
    }
  };

  if (story) {
    // visual on top, then the details and the origins, all stacked
    const space = bottomY - 90 - infoH - 36 - originH - y;
    const vis = Math.max(320, Math.min(inner, space));
    if (photo) {
      ctx.save();
      roundRect(ctx, M, y, inner, vis, 28);
      ctx.clip();
      drawCover(ctx, photo, M, y, inner, vis);
      ctx.restore();
      const d = Math.min(300, vis * 0.5);
      drawPlate(ctx, W - M - d / 2 - 20, y + vis - d / 2 - 20, d, pasta, ings);
    } else {
      drawPlate(ctx, W / 2, y + vis / 2, vis * 0.92, pasta, ings);
    }
    y += vis + 40;
    drawInfo(M, y, inner);
  } else {
    // square: the visual on the left, the details on the right
    const colW = inner - infoW - 40;
    const vis = Math.min(colW, bottomY - 30 - y);
    if (photo) {
      ctx.save();
      roundRect(ctx, M, y, colW, vis, 24);
      ctx.clip();
      drawCover(ctx, photo, M, y, colW, vis);
      ctx.restore();
      const d = Math.min(190, vis * 0.45);
      drawPlate(ctx, M + colW - d / 2 - 14, y + vis - d / 2 - 14, d, pasta, ings);
    } else {
      drawPlate(ctx, M + colW / 2, y + vis / 2, Math.min(colW, vis) * 0.96, pasta, ings);
    }
    drawInfo(M + colW + 40, y - 8, infoW);
  }

  /* hashtags */
  ctx.fillStyle = INK;
  ctx.fillRect(M, bottomY - 18, inner, 2);
  ctx.fillStyle = RED;
  ctx.font = font(tagSize, 800);
  ctx.fillText(data.hashtags[0], M, bottomY + tagSize);
  ctx.fillStyle = MUTED;
  ctx.font = font(smallTag, 600);
  restTags.forEach((l, i) => ctx.fillText(l, M, bottomY + tagSize + 14 + (i + 1) * smallTag * 1.3));
  return canvas;
}

export const canvasToBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
