// 3D retail box for the phone case, printed with the Imperia dieline
// (src/assets/packaging/dieline.svg, 100 × 190 × 25 mm) and personalised
// with the chosen pattern, colour, finish and phone. The window under the
// logo is cut out with its exact curved shape so the case shows through.
import * as THREE from 'three';
import dielineSvg from '../assets/packaging/dieline.svg?raw';
import pastaNames from '../assets/packaging/pastaNames.json';
import windowShape from '../assets/packaging/window.json';
import { buildCover, coverSize } from './cover3d.js';

const PT = 72 / 25.4; // dieline units (pt) per mm
const VB = { x: 320, y: 125, w: 762, h: 770 }; // dieline viewBox
const PX = 2.6; // texture pixels per pt (≈ 2000 px square)

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
  spaghetti: 'Spaghetti',
  tagliatelle: 'Tagliatelle',
  ravioli: 'Ravioli',
  reginette: 'Reginette',
  sfoglia: 'Lasagne',
  raviolo: 'Raviolo',
};
// title artwork from "Pasta Names for Phone Cases.svg"
const TITLE_ART = { ravioli: 'ravioli', reginette: 'reginette', sfoglia: 'lasagne', spaghetti: 'spaghetto' };
// colour circles printed on the back (palette id → circle centre)
const COLOUR_DOTS = {
  'c-ambra': { name: 'Egg', y: 323.5 },
  'c-crema': { name: 'Flour', y: 393.4 },
  'c-rosso': { name: 'Tomato', y: 463 },
  'c-verde': { name: 'Basil', y: 532.6 },
  'c-marrone': { name: 'Ragù', y: 602.4 },
};
export const PACK_FINISH = {
  raw: { name: 'Raw', material: 'Polycarbonate (PC) · Matte grain finish', protection: 'Non-slip grip' },
  aldente: { name: 'Al Dente', material: 'Polycarbonate (PC) · Satin finish', protection: 'Scratch-resistant' },
  overcooked: { name: 'Overcooked', material: 'Liquid silicone · Soft-touch finish', protection: 'Shock-absorbing' },
};

const RED = '#cf1913';
const YELLOW = '#fdb448';
const FONT = `font-family="'Helvetica Neue', Helvetica, Arimo, Arial, sans-serif"`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Only the box texts that change with the configuration (in dieline pt). */
export function packagingOverlay({ pattern, colorId, colorName, finish, modelLabel }) {
  const name = PACK_NAMES[pattern] || pattern;
  const f = PACK_FINISH[finish] || PACK_FINISH.aldente;
  const parts = [];

  // top flap: pasta name (box artwork when available) + "phone case"
  parts.push(`<rect x="726.57" y="168.17" width="195.1" height="70.87" fill="${YELLOW}"/>`);
  const art = pastaNames[TITLE_ART[pattern]];
  let titleBottom = 210;
  if (art) {
    const [, , vw, vh] = art.viewBox.split(/\s+/).map(Number);
    const s = Math.min(176 / vw, 27 / vh);
    const w = vw * s;
    const h = vh * s;
    titleBottom = 181 + h;
    parts.push(`<svg x="${824.1 - w / 2}" y="181" width="${w}" height="${h}" viewBox="${art.viewBox}">${art.markup}</svg>`);
  } else {
    parts.push(
      `<text x="824.1" y="${titleBottom}" text-anchor="middle" ${FONT} font-weight="700" font-size="35" letter-spacing="-1.6" fill="#ffffff"${name.length > 9 ? ' textLength="178" lengthAdjust="spacingAndGlyphs"' : ''}>${esc(name)}</text>`,
    );
  }
  parts.push(`<text x="824.1" y="${Math.min(titleBottom + 9, 232)}" text-anchor="middle" ${FONT} font-weight="700" font-size="7.5" fill="${RED}">phone case</text>`);

  // back: product details
  parts.push(`<rect x="419" y="326" width="186" height="80" fill="${RED}"/>`);
  const rows = [
    ['Colour', colorName],
    ['Finish', f.name],
    ['Material', f.material],
    ['Compatibility', modelLabel],
    ['Everyday protection', f.protection],
  ];
  let y = 339;
  for (const [k, v] of rows) {
    const full = `${k}: ${v}`;
    if (full.length <= 36) {
      parts.push(`<text x="422.5" y="${y}" ${FONT} font-size="9.2" fill="#fff"><tspan font-weight="700">${esc(k)}:</tspan> ${esc(v)}</text>`);
      y += 12;
    } else {
      // wrap the value on the next line, like the original layout
      const words = String(v).split(' ');
      let first = '';
      while (words.length && `${k}: ${first} ${words[0]}`.length <= 36) first = `${first} ${words.shift()}`.trim();
      parts.push(`<text x="422.5" y="${y}" ${FONT} font-size="9.2" fill="#fff"><tspan font-weight="700">${esc(k)}:</tspan> ${esc(first)}</text>`);
      parts.push(`<text x="422.5" y="${y + 12}" ${FONT} font-size="9.2" fill="#fff">${esc(words.join(' '))}</text>`);
      y += 24;
    }
  }
  // ring around the chosen colour
  const dot = COLOUR_DOTS[colorId];
  if (dot) parts.push(`<circle cx="362.6" cy="${dot.y}" r="25.5" fill="none" stroke="#fff" stroke-width="2.4"/>`);

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
  const svg = dielineSvg
    .replace('<svg ', `<svg width="${Math.round(VB.w * PX)}" height="${Math.round(VB.h * PX)}" `)
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

/** Board finish follows the case finish: uncoated paper, satin, soft-touch. */
function boardMaterial(map, finish) {
  const base = { map, alphaTest: 0.5, metalness: 0 };
  if (finish === 'raw') {
    return new THREE.MeshPhysicalMaterial({ ...base, roughness: 0.97, color: new THREE.Color('#ece6da'), bumpMap: paperBump(), bumpScale: 0.35 });
  }
  if (finish === 'overcooked') {
    return new THREE.MeshPhysicalMaterial({ ...base, roughness: 0.82, sheen: 0.55, sheenRoughness: 0.55, sheenColor: new THREE.Color('#ffffff') });
  }
  return new THREE.MeshPhysicalMaterial({ ...base, roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.32 });
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
  const mat = boardMaterial(map, opts.material);
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

  // acetate film behind the window
  const film = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 104),
    new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0, clearcoat: 1, depthWrite: false }),
  );
  film.position.set(0, (511.25 - 489.5) / PT, d / 2 - 0.35);
  film.userData.noShadow = true;
  group.add(film);

  // the case itself, back facing out through the window
  const kase = buildCover(opts);
  const size = coverSize(opts.model);
  const bb = new THREE.Box3().setFromObject(kase);
  kase.position.set(0, (511.25 - 489.5) / PT, d / 2 - 1.6 - bb.max.z);
  // centre the case horizontally whatever its size
  kase.position.x = -(bb.min.x + bb.max.x) / 2;
  kase.userData.caseSize = size;
  group.add(kase);
  return group;
}
