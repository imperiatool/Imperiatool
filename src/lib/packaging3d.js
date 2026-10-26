// 3D retail box for the phone case, printed with the Imperia artwork
// (src/assets/packaging/case-packaging.svg, 100 × 190 × 25 mm) and personalised
// with the chosen pattern, colour, finish and phone. The window under the
// logo is cut out with its exact curved shape and closed by a glossy film,
// like a pasta pack: through it you see the pattern of the case.
import * as THREE from 'three';
import packagingSvg from '../assets/packaging/case-packaging.svg?raw';
import pastaNames from '../assets/packaging/pastaNames.json';
import windowShape from '../assets/packaging/window.json';
import { buildCover, coverSize } from './cover3d.js';

const PT = 72 / 25.4; // dieline units (pt) per mm
const VB = { x: 320, y: 125, w: 762, h: 770 }; // dieline viewBox
// texture pixels per pt (≈ 2000 px square; lighter on phones)
const PX = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches ? 1.9 : 2.6;

// panels of the dieline (pt)
const P = {
  front: [682.86, 241.96, 966.32, 780.54],
  back: [324.31, 241.96, 607.77, 780.54],
  left: [610.22, 241.96, 681.09, 780.54],
  right: [969.22, 241.96, 1040.09, 780.54],
  top: [682.38, 168.17, 965.84, 239.04],
  bottom: [683, 783, 966, 854],
  tab: [324.31, 168.17, 607.77, 239.04],
};
const BOX = { w: 100, h: 190, d: 25, tab: 25 };

// Names printed on the box (the packaging is printed in English).
export const PACK_NAMES = {
  spaghetti: 'Spaghetto',
  tagliatelle: 'Tagliatelle',
  ravioli: 'Ravioli',
  reginette: 'Reginette',
  sfoglia: 'Pasta Cuts',
  raviolo: 'Raviolo',
};
// title artwork from "Pasta Names for Phone Cases.svg" (already includes "phone case")
const TITLE_ART = { ravioli: 'ravioli', reginette: 'reginette', sfoglia: 'pastacuts', spaghetti: 'spaghetto', tagliatelle: 'tagliatelle', raviolo: 'raviolo' };
// colour circles printed on the back (palette id → circle centre)
const COLOUR_DOTS = {
  'c-ambra': { name: 'Egg', y: 323.5 },
  'c-crema': { name: 'Flour', y: 393.5 },
  'c-rosso': { name: 'Tomato', y: 463 },
  'c-verde': { name: 'Basil', y: 533 },
  'c-marrone': { name: 'Ragù', y: 603 },
};
// pattern circles printed on the right side ("Patterns available")
const PATTERN_DOTS = { spaghetti: 323.5, tagliatelle: 393.5, ravioli: 463, reginette: 533, sfoglia: 603, raviolo: 672.5 };
export const PACK_FINISH = {
  // protection: the same for every finish
  raw: { name: 'Raw', material: 'Polycarbonate (PC) · Matte finish', protection: 'Shock absorbing' },
  aldente: { name: 'Al Dente', material: 'Polycarbonate (PC) · Satin finish', protection: 'Shock absorbing' },
  overcooked: { name: 'Overcooked', material: 'Liquid silicone · Soft-touch finish', protection: 'Shock absorbing' },
};

const RED = '#e1201b';
// red panel on the back: from the right-most point of the wavy edge to the fold
const BACK_RED = { left: 406.8, right: 607.77 };
const HEADING = 'IMPERIA® PASTA PHONE CASE';
const HEADING_SIZE = 11.2;
const TAGLINE = 'Inspired by traditional pasta shapes.';
let measureCtx;
/** Text width in dieline pt (canvas when available, estimate in tests). */
function measure(text, size, bold = false) {
  const str = String(text ?? '');
  if (measureCtx === undefined) measureCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  if (!measureCtx) return str.length * size * (bold ? 0.56 : 0.5);
  measureCtx.font = `${bold ? '700 ' : ''}${size}px 'Helvetica Neue', Helvetica, Arimo, Arial, sans-serif`;
  return measureCtx.measureText(str).width - 0.25 * str.length;
}
const YELLOW = '#fdb448';
const FONT = `font-family="'Helvetica Neue', Helvetica, Arimo, Arial, sans-serif"`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Only the box texts that change with the configuration (in dieline pt). */
export function packagingOverlay({ pattern, colorId, colorName, finish, modelLabel }) {
  const name = PACK_NAMES[pattern] || pattern;
  const f = PACK_FINISH[finish] || PACK_FINISH.aldente;
  const parts = [];

  // top flap: the pasta name artwork (with "phone case") of the chosen pattern
  parts.push(`<rect x="726.57" y="168.17" width="195.1" height="70.87" fill="${YELLOW}"/>`);
  const art = pastaNames[TITLE_ART[pattern]];
  if (art) {
    const [, , vw, vh] = art.viewBox.split(/\s+/).map(Number);
    const s = Math.min(182 / vw, 46 / vh);
    const w = vw * s;
    const h = vh * s;
    parts.push(`<svg x="${824.1 - w / 2}" y="${203.6 - h / 2}" width="${w}" height="${h}" viewBox="${art.viewBox}">${art.markup}</svg>`);
  } else {
    parts.push(`<text x="824.1" y="210" text-anchor="middle" ${FONT} font-weight="700" font-size="35" letter-spacing="-1.6" fill="#ffffff">${esc(name)}</text>`);
    parts.push(`<text x="824.1" y="220" text-anchor="middle" ${FONT} font-weight="700" font-size="6" fill="${RED}">phone case</text>`);
  }

  // back: heading, tagline and product details as one left-aligned block,
  // centred in the red panel so the left and right margins are equal
  // (measured on the longest line)
  const SIZE = 9.4;
  const rows = [
    ['Pattern', name],
    ['Colour', colorName],
    ['Finish', f.name],
    ['Material', f.material],
    ['Compatibility', modelLabel],
    ['Protection', f.protection],
  ];
  const MAXW = BACK_RED.right - BACK_RED.left - 12;
  const rowW = rows.map(([k, v]) => Math.min(MAXW, measure(`${k}: `, SIZE, true) + measure(v, SIZE)));
  const headW = measure(HEADING, HEADING_SIZE, true);
  const tagW = measure(TAGLINE, SIZE);
  const blockW = Math.max(headW, tagW, ...rowW);
  const x = +((BACK_RED.left + BACK_RED.right - blockW) / 2).toFixed(2);
  // the artwork's own heading/tagline are replaced (cover + redraw at x)
  parts.push(`<rect x="413" y="262" width="194" height="129" fill="${RED}"/>`);
  parts.push(`<text x="${x}" y="279.6" ${FONT} font-weight="700" font-size="${HEADING_SIZE}" letter-spacing="-0.25" fill="#fff">${esc(HEADING)}</text>`);
  parts.push(`<text x="${x}" y="303.8" ${FONT} font-size="${SIZE}" letter-spacing="-0.25" fill="#fff">${esc(TAGLINE)}</text>`);
  rows.forEach(([k, v], i) => {
    const y = 326.8 + i * 12;
    const fit = rowW[i] >= MAXW ? ` textLength="${MAXW}" lengthAdjust="spacingAndGlyphs"` : '';
    parts.push(`<text x="${x}" y="${y}" ${FONT} font-size="${SIZE}" letter-spacing="-0.25" fill="#fff"${fit}><tspan font-weight="700">${esc(k)}:</tspan> ${esc(v)}</text>`);
  });
  // ring around the chosen colour
  const dot = COLOUR_DOTS[colorId];
  if (dot) parts.push(`<circle cx="362.6" cy="${dot.y}" r="25.5" fill="none" stroke="#fff" stroke-width="2.4"/>`);
  // the pattern is called "Spaghetto" (the artwork still says "Spaghetti")
  parts.push(`<rect x="981" y="350.5" width="47" height="16" fill="${RED}"/>`);
  parts.push(`<text x="1004.65" y="362.6" text-anchor="middle" ${FONT} font-size="9.6" letter-spacing="-0.25" fill="#fff">Spaghetto</text>`);
  // Raviolo, the sixth pattern, under Pasta Cuts in the same style as the
  // printed ones: egg-yellow disc, white rim, crimped raviolo border
  {
    const cx = 1004.65;
    const cy = PATTERN_DOTS.raviolo;
    const wave = Array.from({ length: 73 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2;
      const r = 14.2 + 1.1 * Math.cos(a * 18);
      return `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    }).join('');
    parts.push(`<circle cx="${cx}" cy="${cy}" r="19.86" fill="${YELLOW}" stroke="#fff" stroke-width="1.3"/>`);
    parts.push(`<path d="${wave}Z" fill="none" stroke="#fff" stroke-width="0.9" stroke-linejoin="round"/>`);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="10.6" fill="none" stroke="#fff" stroke-width="0.8" stroke-dasharray="0.1 1.9" stroke-linecap="round"/>`);
    parts.push(`<text x="${cx}" y="${(cy + 39.1).toFixed(1)}" text-anchor="middle" ${FONT} font-size="9.6" letter-spacing="-0.25" fill="#fff">Raviolo</text>`);
  }
  // …and around the chosen pattern
  if (PATTERN_DOTS[pattern]) parts.push(`<circle cx="1004.65" cy="${PATTERN_DOTS[pattern]}" r="25.5" fill="none" stroke="#fff" stroke-width="2.4"/>`);

  // spine (next to the "garanzia 2 anni" seal): product name
  parts.push(`<rect x="611" y="436" width="69.5" height="58" fill="${RED}"/>`);
  parts.push(
    `<text x="645.65" text-anchor="middle" ${FONT} font-weight="700" fill="#fff">` +
      `<tspan x="645.65" y="457" font-size="9">IMPERIA®</tspan>` +
      `<tspan x="645.65" y="469.5" font-size="10.4"${name.length > 11 ? ' textLength="64" lengthAdjust="spacingAndGlyphs"' : ''}>${esc(name)}</tspan>` +
      `<tspan x="645.65" y="482" font-size="10.4">phone case</tspan></text>`,
  );
  return parts.join('');
}

export async function textureCanvas(opts) {
  const svg = packagingSvg
    .replace(/viewBox="[^"]*"/, `viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" width="${Math.round(VB.w * PX)}" height="${Math.round(VB.h * PX)}"`)
    .replace('</style>', `text { font-family: 'Helvetica Neue', Helvetica, Arimo, Arial, sans-serif; }</style>`)
    .replace(/<\/svg>\s*$/, `${packagingOverlay(opts)}</svg>`);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = Math.round(VB.w * PX);
  c.height = Math.round(VB.h * PX);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, c.width, c.height);
  // die-cut: the window under the logo and the euro hang hole
  ctx.setTransform(PX, 0, 0, PX, -VB.x * PX, -VB.y * PX);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fill(new Path2D(windowShape.d));
  const hole = new Path2D();
  hole.roundRect(414.94, 198.17, 102.21, 19.43, 9.71);
  hole.arc(466.05, 199.09, 9.48, 0, Math.PI * 2);
  ctx.fill(hole);
  return c;
}

/** Plane whose UVs show the dieline rectangle [x0, y0, x1, y1]. */
function panel(w, h, rect) {
  const g = new THREE.PlaneGeometry(w, h);
  const [x0, y0, x1, y1] = rect;
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const x = x0 + uv.getX(i) * (x1 - x0);
    const y = y0 + (1 - uv.getY(i)) * (y1 - y0);
    uv.setXY(i, (x - VB.x) / VB.w, 1 - (y - VB.y) / VB.h);
  }
  return g;
}

function paperBump() {
  const N = 256;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(N, N);
  let s = 4242;
  for (let i = 0; i < N * N; i++) {
    s = (s * 16807) % 2147483647;
    const v = 118 + (s / 2147483647) * 20;
    img.data.set([v, v, v, 255], i * 4);
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 14);
  return t;
}

/** Natural, uncoated board: the same for every finish. */
function boardMaterial(map) {
  return new THREE.MeshPhysicalMaterial({ map, alphaTest: 0.5, metalness: 0, roughness: 0.97, color: new THREE.Color('#ece6da'), bumpMap: paperBump(), bumpScale: 0.35 });
}

/**
 * @returns Promise<THREE.Group> the closed box with the case inside (mm).
 * opts: { pattern, color, colorId, colorName, material, model, modelLabel }
 */
export async function buildPackaging(opts) {
  const canvas = await textureCanvas({ ...opts, finish: opts.material });
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const mat = boardMaterial(map);
  const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.5 });

  const { w, h, d } = BOX;
  const group = new THREE.Group();
  const face = (geo, setup, extra = {}) => {
    const m = new THREE.Mesh(geo, extra.material || mat);
    setup(m);
    m.customDepthMaterial = depthMat;
    group.add(m);
    return m;
  };
  face(panel(w, h, P.front), (m) => (m.position.z = d / 2));
  face(panel(w, h, P.back), (m) => {
    m.position.z = -d / 2;
    m.rotation.y = Math.PI;
  });
  face(panel(d, h, P.left), (m) => {
    m.position.x = -w / 2;
    m.rotation.y = -Math.PI / 2;
  });
  face(panel(d, h, P.right), (m) => {
    m.position.x = w / 2;
    m.rotation.y = Math.PI / 2;
  });
  face(panel(w, d, P.top), (m) => {
    m.position.y = h / 2;
    m.rotation.x = -Math.PI / 2;
  });
  face(panel(w, d, P.bottom), (m) => {
    m.position.y = -h / 2;
    m.rotation.x = Math.PI / 2;
  });
  // hang tab (euro hole), printed card standing on the back edge
  const tabMat = mat.clone();
  tabMat.side = THREE.DoubleSide;
  face(
    panel(w, BOX.tab, P.tab),
    (m) => {
      m.position.set(0, h / 2 + BOX.tab / 2, -d / 2 + 0.4);
      m.rotation.y = Math.PI;
    },
    { material: tabMat },
  );

  // inside of the box: plain white board
  const inside = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.5, h - 0.5, d - 0.5),
    new THREE.MeshStandardMaterial({ color: '#f1eee8', roughness: 0.95, side: THREE.BackSide }),
  );
  group.add(inside);

  // window film: clear, glossy, slightly bulged and crinkled like a pasta pack
  const winC = { x: (824.7 - (P.front[0] + P.front[2]) / 2) / PT, y: ((P.front[1] + P.front[3]) / 2 - 493.2) / PT };
  group.add(windowFilm(winC, d / 2));

  // the case, back facing out. It is turned upside down so the camera opening
  // sits behind the board, under the window: only the pattern shows through.
  const kase = buildCover({ ...opts, logo: false });
  const size = coverSize(opts.model);
  kase.rotation.z = Math.PI;
  const bb = new THREE.Box3().setFromObject(kase);
  kase.position.set(-(bb.min.x + bb.max.x) / 2, -h / 2 + 0.8 - bb.min.y, d / 2 - 2.4 - bb.max.z);
  kase.userData.caseSize = size;
  group.add(kase);
  return group;
}

/** Glossy plastic film (≈ 48 × 93 mm) with a gentle bulge and fine crinkles. */
function windowFilm(c, z) {
  const W = 48;
  const H = 93;
  const g = new THREE.PlaneGeometry(W, H, 64, 124);
  const pos = g.attributes.position;
  let s = 99;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const waves = Array.from({ length: 9 }, () => ({ kx: (rnd() - 0.5) * 0.7, ky: (rnd() - 0.5) * 0.45, p: rnd() * 6.3, a: 0.1 + rnd() * 0.1 }));
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = (2 * x) / W;
    const v = (2 * y) / H;
    const bulge = 0.9 * Math.max(0, 1 - u * u) * Math.max(0, 1 - v * v);
    let crinkle = 0;
    for (const w of waves) crinkle += w.a * Math.sin(w.kx * x + w.ky * y * 2.2 + w.p);
    pos.setZ(i, bulge + crinkle * Math.max(0, 1 - u * u));
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(
    g,
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.24,
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      specularIntensity: 1,
      envMapIntensity: 3,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  m.position.set(c.x, c.y, z - 0.45);
  m.userData.noShadow = true;
  m.renderOrder = 2;
  return m;
}
