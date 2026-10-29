// Recipe Club share cards, drawn on a canvas on the device (nothing is
// uploaded). Two cards, both on Imperia red with white type and "Imperia®"
// in red on a white rounded label:
//   - "club": the Recipe Club card (dish, plate, ingredients, origins, hashtags)
//   - "recipe": the recipe itself (ingredients and method, when the dish has them)
// Two formats: a square post (1080 × 1080) and a vertical story (1080 × 1920).
// An optional photo of the dish sits in a square, crimped "tortello" frame,
// placed by the person (zoom, rotation, position).

// places around the pasta on the plate (%, centre of each ingredient): the
// same as the plate in the recipe builder
export const SPOTS = [
  [33, 33], [67, 33], [67, 67], [33, 67], [50, 27], [50, 74], [27, 50], [73, 50], [41, 41], [59, 59], [50, 50],
];

export const CARD_FORMATS = { square: { w: 1080, h: 1080 }, story: { w: 1080, h: 1920 } };

const RED = '#e1201b';
const WHITE = '#ffffff';
const SOFT = 'rgba(255,255,255,0.86)';
const FONT = "Inter, 'Helvetica Neue', Arial, 'Noto Sans SC', 'Noto Sans Devanagari', sans-serif";

/**
 * The photo frame: a square of pasta with crimped edges (like a tortello
 * cut with a fluted wheel), as points in 0…1 (also used as a CSS clip-path).
 */
export function framePoints(bumps = 9, depth = 0.022, perSide = 72) {
  const pts = [];
  const side = (x0, y0, dx, dy, nx, ny) => {
    for (let i = 0; i < perSide; i++) {
      const t = i / perSide;
      const bump = depth * Math.abs(Math.sin(Math.PI * bumps * t));
      pts.push([x0 + dx * t - nx * (depth - bump), y0 + dy * t - ny * (depth - bump)]);
    }
  };
  // clockwise from the top-left corner; the crimps point outwards
  side(0, 0, 1, 0, 0, -1);
  side(1, 0, 0, 1, 1, 0);
  side(1, 1, -1, 0, 0, 1);
  side(0, 1, 0, -1, -1, 0);
  return pts.map(([x, y]) => [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))]);
}
const FRAME = framePoints();
export const FRAME_CLIP = `polygon(${FRAME.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(', ')})`;

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
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** "Imperia®" in red on a white rounded label; returns its width. */
function brandLabel(ctx, x, y, h) {
  ctx.font = font(h * 0.52, 800);
  const w = ctx.measureText('Imperia®').width + h * 0.9;
  ctx.fillStyle = WHITE;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = RED;
  ctx.textBaseline = 'middle';
  ctx.fillText('Imperia®', x + h * 0.45, y + h * 0.53);
  ctx.textBaseline = 'alphabetic';
  return w;
}

/** The plate of the recipe builder: white plate, light rim, pasta and ingredients in 3D. */
function drawPlate(ctx, cx, cy, d, pasta, ings) {
  ctx.save();
  ctx.shadowColor = 'rgba(80,0,0,0.35)';
  ctx.shadowBlur = d * 0.08;
  ctx.shadowOffsetY = d * 0.035;
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#f6f6f6';
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
    drawContain(ctx, im, x0 + (d * px) / 100 - s / 2, y0 + (d * py) / 100 - s / 2, s, s);
  });
}

/**
 * The person's photo inside the crimped square frame, placed as they set it:
 * `t` = { zoom ≥ 1, rot (degrees), x, y (shift as a fraction of the frame) }.
 */
export function drawFramedPhoto(ctx, img, x, y, size, t = {}) {
  const { zoom = 1, rot = 0, x: dx = 0, y: dy = 0 } = t;
  ctx.save();
  ctx.shadowColor = 'rgba(80,0,0,0.35)';
  ctx.shadowBlur = size * 0.04;
  ctx.shadowOffsetY = size * 0.015;
  ctx.beginPath();
  FRAME.forEach(([px, py], i) => ctx[i ? 'lineTo' : 'moveTo'](x + px * size, y + py * size));
  ctx.closePath();
  ctx.fillStyle = WHITE;
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  FRAME.forEach(([px, py], i) => ctx[i ? 'lineTo' : 'moveTo'](x + px * size, y + py * size));
  ctx.closePath();
  ctx.clip();
  const cover = Math.max(size / img.width, size / img.height) * zoom;
  ctx.translate(x + size / 2 + dx * size, y + size / 2 + dy * size);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(img, (-img.width * cover) / 2, (-img.height * cover) / 2, img.width * cover, img.height * cover);
  ctx.restore();
}

/** The dish: the photo in its frame (with the plate as a small badge), or the plate. */
function drawVisual(ctx, box, pasta, ings, photo, photoT) {
  const { x, y, w, h } = box;
  const size = Math.min(w, h);
  const fx = x + (w - size) / 2;
  const fy = y + (h - size) / 2;
  if (photo) {
    drawFramedPhoto(ctx, photo, fx, fy, size, photoT);
    const d = size * 0.3;
    drawPlate(ctx, fx + size - d * 0.42, fy + size - d * 0.42, d, pasta, ings);
  } else {
    drawPlate(ctx, x + w / 2, y + h / 2, size * 0.94, pasta, ings);
  }
}

/** Header shared by both cards: the Imperia label, "RECIPE CLUB", a thin rule. */
function header(ctx, W, M, story) {
  const h = story ? 64 : 54;
  const bw = brandLabel(ctx, M, M, h);
  ctx.fillStyle = WHITE;
  ctx.font = font(story ? 30 : 26, 800);
  ctx.textBaseline = 'middle';
  ctx.fillText('RECIPE CLUB', M + bw + 18, M + h * 0.53);
  ctx.textBaseline = 'alphabetic';
  const y = M + h + (story ? 28 : 22);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(M, y, W - M * 2, 2);
  return y + (story ? 58 : 46);
}

function titleBlock(ctx, data, M, inner, y, story, maxLines) {
  ctx.fillStyle = SOFT;
  ctx.font = font(story ? 26 : 22, 700);
  ctx.fillText(data.kind.toLocaleUpperCase(), M, y);
  y += story ? 22 : 16;
  const size = story ? 80 : 60;
  ctx.font = font(size, 800);
  ctx.fillStyle = WHITE;
  for (const l of wrapText(ctx, data.name, inner, maxLines)) {
    y += size * 1.04;
    ctx.fillText(l, M, y);
  }
  if (data.subtitle) {
    const s = story ? 34 : 28;
    ctx.font = font(s, 500);
    ctx.fillStyle = SOFT;
    for (const l of wrapText(ctx, data.subtitle, inner, 2)) {
      y += s * 1.3;
      ctx.fillText(l, M, y);
    }
  }
  return y + (story ? 40 : 30);
}

function hashtags(ctx, data, M, inner, H, story) {
  const tagSize = story ? 46 : 36;
  const small = story ? 28 : 23;
  ctx.font = font(small, 600);
  const rest = wrapText(ctx, data.hashtags.slice(1).join('  '), inner, 2);
  const bottomH = tagSize + 14 + rest.length * small * 1.35;
  const top = H - M - bottomH;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(M, top - 18, inner, 2);
  ctx.fillStyle = WHITE;
  ctx.font = font(tagSize, 800);
  ctx.fillText(data.hashtags[0], M, top + tagSize);
  ctx.fillStyle = SOFT;
  ctx.font = font(small, 600);
  rest.forEach((l, i) => ctx.fillText(l, M, top + tagSize + 14 + (i + 1) * small * 1.3));
  return top;
}

/** A labelled text block ("PASTA" + value…); returns the new y. With `measure`, nothing is drawn. */
function block(ctx, x, y, width, label, lines, { story, body, measure = false }) {
  const ls = story ? 24 : 20;
  y += ls * 1.15;
  if (!measure) {
    ctx.font = font(ls, 800);
    ctx.fillStyle = SOFT;
    ctx.fillText(label.toLocaleUpperCase(), x, y);
  }
  y += 6;
  ctx.font = font(body, 500);
  ctx.fillStyle = WHITE;
  for (const l of lines) {
    y += body * 1.32;
    if (!measure) ctx.fillText(l, x, y);
  }
  return y;
}

/** The Recipe Club card. */
function clubCard(ctx, W, H, story, data, imgs) {
  const M = story ? 84 : 64;
  const inner = W - M * 2;
  let y = header(ctx, W, M, story);
  y = titleBlock(ctx, data, M, inner, y, story, story ? 3 : 2);
  const bottomY = hashtags(ctx, data, M, inner, H, story);

  const body = story ? 32 : 25;
  const infoW = story ? inner : Math.round(inner * 0.5);
  ctx.font = font(body, 500);
  const pastaLines = wrapText(ctx, data.pastaName, infoW, 1);
  const ingLines = wrapText(ctx, data.ingredients.join(data.joiner || ', '), infoW, 3);
  const infoH = block(ctx, 0, 0, infoW, data.pastaLabel, pastaLines, { story, body, measure: true }) + 18 + block(ctx, 0, 0, infoW, data.ingredientsLabel, ingLines, { story, body, measure: true });
  const ls = story ? 24 : 20;
  const avail = bottomY - (story ? 40 : 30) - y - (story ? 460 : 0) - infoH - (story ? 36 : 26);
  const fit = Math.max(0, Math.min(6, Math.floor((avail - ((story ? 44 : 36) + ls * 1.5 + (story ? 40 : 30))) / (body * 1.36))));
  const pad = story ? 30 : 22;
  ctx.font = font(body, 400);
  const originLines = data.origin && fit >= 2 ? wrapText(ctx, data.origin, infoW - pad * 2, fit) : [];
  const originH = originLines.length ? pad * 2 + ls * 1.2 + 8 + originLines.length * body * 1.36 : 0;

  const info = (x, top) => {
    let yy = block(ctx, x, top, infoW, data.pastaLabel, pastaLines, { story, body });
    yy = block(ctx, x, yy + 18, infoW, data.ingredientsLabel, ingLines, { story, body });
    yy += story ? 36 : 26;
    if (originLines.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      roundRect(ctx, x, yy, infoW, originH, 18);
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.fillRect(x, yy, 8, originH);
      let oy = yy + pad + ls;
      ctx.font = font(ls, 800);
      const head = `${data.originsLabel}${data.region ? ` · ${data.region}` : ''}`.toLocaleUpperCase();
      ctx.fillText(wrapText(ctx, head, infoW - pad * 2, 1)[0] || '', x + pad, oy);
      ctx.font = font(body, 400);
      oy += 8;
      for (const l of originLines) {
        oy += body * 1.36;
        ctx.fillText(l, x + pad, oy);
      }
    }
  };

  if (story) {
    const vis = Math.max(320, Math.min(inner, bottomY - 90 - infoH - 36 - originH - y));
    drawVisual(ctx, { x: M, y, w: inner, h: vis }, imgs.pasta, imgs.ings, imgs.photo, data.photoT);
    info(M, y + vis + 40);
  } else {
    const colW = inner - infoW - 40;
    const vis = Math.min(colW, bottomY - 30 - y);
    drawVisual(ctx, { x: M, y, w: colW, h: vis }, imgs.pasta, imgs.ings, imgs.photo, data.photoT);
    info(M + colW + 40, y - 8);
  }
}

/** The recipe card: ingredients and method of the dish (only what the recipe has). */
function recipeCard(ctx, W, H, story, data, imgs) {
  const M = story ? 84 : 64;
  const inner = W - M * 2;
  let y = header(ctx, W, M, story);
  y = titleBlock(ctx, { ...data, kind: data.recipeLabel }, M, inner, y, story, 2);
  const bottomY = hashtags(ctx, data, M, inner, H, story);
  const body = story ? 30 : 23;
  const gap = story ? 36 : 28;

  // the ingredients as a list, the method as numbered steps
  const ingText = [data.pastaName, ...data.ingredients];
  const visSize = story ? Math.min(inner, 520) : 300;
  const colX = story ? M : M + visSize + 40;
  const colW = story ? inner : inner - visSize - 40;
  const drawList = (x, top, width, maxY) => {
    let yy = top;
    const ls = story ? 24 : 20;
    ctx.font = font(ls, 800);
    ctx.fillStyle = SOFT;
    yy += ls * 1.15;
    ctx.fillText(data.ingredientsLabel.toLocaleUpperCase(), x, yy);
    yy += 6;
    ctx.font = font(body, 500);
    ctx.fillStyle = WHITE;
    for (const item of ingText) {
      for (const [k, l] of wrapText(ctx, item, width - 28).entries()) {
        if (yy + body * 1.3 > maxY) return yy;
        yy += body * 1.3;
        if (!k) ctx.fillText('•', x, yy);
        ctx.fillText(l, x + 28, yy);
      }
    }
    return yy;
  };
  const drawSteps = (x, top, width, maxY) => {
    if (!data.steps?.length) return top;
    let yy = top + gap;
    const ls = story ? 24 : 20;
    ctx.font = font(ls, 800);
    ctx.fillStyle = SOFT;
    yy += ls * 1.15;
    ctx.fillText(data.methodLabel.toLocaleUpperCase(), x, yy);
    yy += 6;
    data.steps.forEach((s, n) => {
      ctx.font = font(body, 400);
      const lines = wrapText(ctx, s, width - 52);
      if (yy + body * 1.32 * lines.length + 8 > maxY) return;
      yy += 8;
      lines.forEach((l, k) => {
        yy += body * 1.32;
        if (!k) {
          ctx.font = font(body, 800);
          ctx.fillStyle = WHITE;
          ctx.fillText(String(n + 1).padStart(2, '0'), x, yy);
          ctx.font = font(body, 400);
        }
        ctx.fillStyle = WHITE;
        ctx.fillText(l, x + 52, yy);
      });
    });
    return yy;
  };

  const maxY = bottomY - 40;
  if (story) {
    drawVisual(ctx, { x: M + (inner - visSize) / 2, y, w: visSize, h: visSize }, imgs.pasta, imgs.ings, imgs.photo, data.photoT);
    let yy = drawList(colX, y + visSize + 30, colW, maxY);
    drawSteps(colX, yy, colW, maxY);
  } else {
    drawVisual(ctx, { x: M, y, w: visSize, h: visSize }, imgs.pasta, imgs.ings, imgs.photo, data.photoT);
    // ingredients under the dish, method on the right
    drawList(M, y + visSize + 18, visSize, maxY);
    drawSteps(colX, y - gap - 8, colW, maxY);
  }
}

/**
 * Draws a card.
 * @param variant 'club' | 'recipe'
 * @param data {
 *   name, subtitle, kind, recipeLabel, pastaLabel, pastaName, ingredientsLabel, ingredients: [names], joiner,
 *   originsLabel, region, origin, methodLabel, steps: [text], hashtags: [..],
 *   pastaImg, ingredientImgs: [urls], photo (url | null), photoT { zoom, rot, x, y }
 * }
 * @returns a canvas
 */
export async function drawRecipeCard(format, data, variant = 'club') {
  const { w: W, h: H } = CARD_FORMATS[format] || CARD_FORMATS.square;
  const story = format === 'story';
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (document.fonts?.ready) await document.fonts.ready;
  const [pasta, photo, ...ings] = await Promise.all([loadImage(data.pastaImg), loadImage(data.photo), ...data.ingredientImgs.map(loadImage)]);
  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';
  const imgs = { pasta, photo, ings };
  if (variant === 'recipe') recipeCard(ctx, W, H, story, data, imgs);
  else clubCard(ctx, W, H, story, data, imgs);
  return canvas;
}

export const canvasToBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
