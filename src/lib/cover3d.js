// Procedural 3D phone cover with pasta-inspired relief patterns.
// Units are millimetres. The relief is a height-field (one function per
// pattern) laid on the back plate, faded out near the borders and the camera.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeMaterial, MATERIAL_SHAPE } from './three/materials.js';
import { roundedRect, sdRoundRect, roundRectArc, roundRectPerimeter, smoothstep, smoothGeometry } from './three/geometry.js';
import logoUrl from '../assets/imperia-logo.svg?url';

export const COVER_PATTERNS = ['raviolo', 'sfoglia', 'tagliatelle', 'spaghetti', 'reginette', 'maccheroni', 'penne'];

/*
 * Phone models: case outer size (mm), corner radius, camera openings and
 * buttons. Openings are rounded rectangles {x, y, w, h, r} measured from the
 * case centre (y up); a circle is a square with r = w / 2.
 */
const sq = (s, inset, r) => ({ w: s, h: s, r, x: null, y: null, inset });
// Sizes are the manufacturers' published phone dimensions + about 2.7 mm of
// case; camera layouts are approximations from product photos (no CAD data).
// `ports`: bottom-edge openings (charging port, speaker, microphone).
const col3 = (s, inset, gap) => [0, 1, 2].map((i) => ({ w: s, h: s, r: s / 2, inset, dy: i * gap }));
export const PHONE_MODELS = {
  'iphone-17-pro-max': { w: 80.7, h: 166.1, r: 14, cams: [sq(39, 4.8, 10)], buttons: 'iphone-cc', ports: 'iphone' },
  'iphone-17-pro': { w: 74.6, h: 152.6, r: 13, cams: [sq(37.5, 4.8, 9.5)], buttons: 'iphone-cc', ports: 'iphone' },
  'iphone-17': { w: 74.2, h: 152.2, r: 12.6, cams: [{ w: 20, h: 39, r: 10, inset: 6.2 }], buttons: 'iphone-cc', ports: 'iphone' },
  'iphone-16-pro-max': { w: 80.3, h: 165.7, r: 13.6, cams: [sq(37.5, 5.2, 9.5)], buttons: 'iphone-cc', ports: 'iphone' },
  'iphone-16-pro': { w: 74.1, h: 152.2, r: 12.6, cams: [sq(35.5, 5.2, 9)], buttons: 'iphone-cc', ports: 'iphone' },
  'iphone-16-plus': { w: 80.5, h: 163.6, r: 13.2, cams: [{ w: 20.5, h: 38, r: 10.25, inset: 6.6 }], buttons: 'iphone-cc', ports: 'iphone' },
  'iphone-16': { w: 74.2, h: 150.2, r: 12.2, cams: [{ w: 19.5, h: 36, r: 9.75, inset: 6.4 }], buttons: 'iphone-cc', ports: 'iphone' },
  'iphone-15-pro-max': { w: 79.4, h: 162.6, r: 13.2, cams: [sq(36, 5.4, 9.2)], buttons: 'iphone', ports: 'iphone' },
  'iphone-15-pro': { w: 73.3, h: 149.3, r: 12.4, cams: [sq(33.5, 5.4, 8.6)], buttons: 'iphone', ports: 'iphone' },
  'iphone-15': { w: 74.2, h: 150.2, r: 12.2, cams: [sq(30, 5.8, 8)], buttons: 'iphone', ports: 'iphone' },
  'galaxy-s25-ultra': {
    w: 80.3, h: 165.5, r: 6, buttons: 'galaxy', ports: 'galaxy',
    cams: [...col3(12.4, 8.2, 14.4), { w: 9.4, h: 9.4, r: 4.7, inset: 8.2, dx: 15, dy: 30.2 }],
  },
  'galaxy-s25-plus': { w: 78.5, h: 161.1, r: 11.5, buttons: 'galaxy', ports: 'galaxy', cams: col3(12, 8, 14.2) },
  'galaxy-s25': { w: 73.1, h: 149.5, r: 10.5, buttons: 'galaxy', ports: 'galaxy', cams: col3(11.4, 7.8, 13.6) },
  'galaxy-s24-ultra': {
    w: 81.7, h: 165, r: 5, buttons: 'galaxy', ports: 'galaxy',
    cams: [...col3(12.4, 8.4, 14.6), { w: 9.4, h: 9.4, r: 4.7, inset: 8.4, dx: 15, dy: 30.6 }],
  },
  'galaxy-s24': { w: 73.2, h: 149.6, r: 10.5, buttons: 'galaxy', ports: 'galaxy', cams: col3(11.8, 7.6, 14) },
  'galaxy-a56': { w: 80.2, h: 164.9, r: 11, buttons: 'galaxy', ports: 'galaxy', cams: [{ w: 18, h: 46, r: 9, inset: 6.2 }] },
  'pixel-10': { w: 74.6, h: 155.4, r: 12, cams: [{ w: 56, h: 16, r: 8, inset: 15, center: true }], buttons: 'pixel', ports: 'galaxy' },
  'pixel-9': { w: 74.6, h: 155.4, r: 12, cams: [{ w: 54, h: 16, r: 8, inset: 15, center: true }], buttons: 'pixel', ports: 'galaxy' },
};
export const DEFAULT_MODEL = 'iphone-17-pro';

// Current model: the pattern functions read these (set by setModel()).
let W, H, R, CAMS, INNER, GRID;
let LOGO = true; // flat area with the Imperia logo at the bottom of the back
const LOGO_SIZE = { w: 19, h: 19 * (388 / 1800) };
const logoY = () => -H / 2 + 11;
const PLATE = 1.8; // back thickness
const RIM_T = 1.5; // side wall thickness
const RIM_D = 9.2; // side wall depth (phone thickness + lip)
const CAM_RING = 1.9;
const UV_REPEAT = 1 / 9; // grain tile ≈ 9 mm

function setModel(id) {
  const m = PHONE_MODELS[id] || PHONE_MODELS[DEFAULT_MODEL];
  W = m.w;
  H = m.h;
  R = m.r;
  CAMS = m.cams.map((c) => ({
    w: c.w,
    h: c.h,
    r: c.r,
    x: c.center ? 0 : -W / 2 + c.inset + c.w / 2 + (c.dx || 0),
    y: H / 2 - (c.center ? c.inset : c.inset) - c.h / 2 - (c.dy || 0),
    inset: c.center ? Math.min(c.inset, (W - c.w) / 2) : c.inset,
  }));
  INNER = { hw: W / 2 - 2.4, hh: H / 2 - 2.4, r: R - 2.4 };
  const cols = 4;
  GRID = { c: (INNER.hw * 2) / cols, x0: -INNER.hw, y0: INNER.hh };
  return m;
}
setModel(DEFAULT_MODEL);

/* ---------------- relief patterns: height in mm at (x, y) ---------------- */
const fract = (v) => v - Math.floor(v);
const tri = (v) => Math.abs(fract(v) - 0.5) * 2; // 1 at cell borders, 0 in the middle

function edgeBumps(x, y, { band = 3.7, width = 2.2, height = 1.7, period = 5.6 } = {}) {
  const d = -sdRoundRect(x, y, 0, 0, W / 2, H / 2, R); // distance inside the outline
  const across = 1 - ((d - band) / width) ** 2;
  if (across <= 0) return 0;
  const P = roundRectPerimeter(W / 2 - band, H / 2 - band, R - band);
  const n = Math.round(P / period);
  const s = roundRectArc(x, y, 0, 0, W / 2 - band, H / 2 - band, R - band);
  const along = 0.5 + 0.5 * Math.cos((2 * Math.PI * n * s) / P);
  return height * Math.sqrt(across) * (0.3 + 0.7 * along);
}

function camBumps(x, y, { height = 1.5, period = 5.2 } = {}) {
  // between the camera and the outer edge there are only a few mm: the border
  // crimp already covers that strip, so fade these bumps out there
  const dOut = -sdRoundRect(x, y, 0, 0, W / 2, H / 2, R);
  const fade = smoothstep(5, 7, dOut);
  if (fade <= 0) return 0;
  let best = 0;
  for (const c of CAMS) {
    const hw = c.w / 2 + CAM_RING + 2.6;
    const hh = c.h / 2 + CAM_RING + 2.6;
    const r = c.r + CAM_RING + 2.6;
    const d = sdRoundRect(x, y, c.x, c.y, hw, hh, r);
    const across = 1 - (d / 2.2) ** 2;
    if (across <= 0) continue;
    const P = roundRectPerimeter(hw, hh, r);
    const n = Math.max(3, Math.round(P / period));
    const s = roundRectArc(x, y, c.x, c.y, hw, hh, r);
    best = Math.max(best, height * Math.sqrt(across) * (0.3 + 0.7 * (0.5 + 0.5 * Math.cos((2 * Math.PI * n * s) / P))));
  }
  return fade * best;
}

/** signed distance to the nearest camera opening (+ grown by `grow`) */
function camDist(x, y, grow = 0) {
  let d = Infinity;
  for (const c of CAMS) d = Math.min(d, sdRoundRect(x, y, c.x, c.y, c.w / 2 + grow, c.h / 2 + grow, c.r + grow));
  return d;
}

function gridCoords(x, y) {
  const u = (x - GRID.x0) / GRID.c;
  const v = (GRID.y0 - y) / GRID.c;
  return { u, v, fu: fract(u), fv: fract(v) };
}

function dottedLine(dist, along, { pitch = 1.25, radius = 0.42 } = {}) {
  // dimples every `pitch` mm along a line, `dist` = distance from the line
  const a = (fract(along / pitch) - 0.5) * pitch;
  const r2 = (a * a + dist * dist) / (radius * radius);
  return r2 < 1 ? Math.sqrt(1 - r2) : 0;
}

/**
 * Height of a field of short tubes (maccheroni, penne): capsules of length
 * `len` and radius `r`, laid every `sx` mm in rows `sy` mm apart (odd rows
 * shifted by half), turned by `angle`. Penne get lengthwise ridges and ends
 * cut on the slant.
 */
function tubes(x, y, { angle = 0, len, r, sx, sy, ridges = 0, slant = 0 }) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const u = x * c + y * s; // along the tubes
  const v = -x * s + y * c; // across
  const row = Math.round(v / sy);
  const dv = v - row * sy;
  const shift = (row & 1) * sx * 0.5;
  const cell = Math.round((u - shift) / sx);
  let du = u - shift - cell * sx;
  // slanted cut: the ends move with the position across the tube
  const half = len / 2 - slant * (dv / r) * 0.5 * Math.sign(du || 1);
  const along = Math.max(0, Math.abs(du) - (half - r));
  const d2 = (along * along + dv * dv) / (r * r);
  if (d2 >= 1 || Math.abs(du) > half) return 0;
  let h = Math.sqrt(1 - d2);
  if (ridges) h *= 1 - 0.14 * (0.5 + 0.5 * Math.cos((dv / r) * Math.PI * ridges));
  return 2.5 * h;
}

const PATTERNS = {
  // raviolo: crimped raviolo border all around + around the camera, plain inside
  raviolo: { mask: false, h: (x, y) => Math.max(edgeBumps(x, y), camBumps(x, y)) },

  // sfoglia: a flat pasta sheet with perforated (dotted) cutting lines
  sfoglia: {
    mask: true,
    h: (x, y) => {
      const { u, v, fu, fv } = gridCoords(x, y);
      const dx = Math.min(fu, 1 - fu) * GRID.c;
      const dy = Math.min(fv, 1 - fv) * GRID.c;
      const dots = Math.max(dottedLine(dx, v * GRID.c, { pitch: 1.35, radius: 0.48 }), dottedLine(dy, u * GRID.c, { pitch: 1.35, radius: 0.48 }));
      return 1.1 - 0.95 * dots;
    },
  },

  // tagliatelle: wide wavy ribbons, puffy, running top to bottom
  tagliatelle: {
    mask: true,
    h: (x, y) => {
      const wave = 2.7 * Math.sin((2 * Math.PI * y) / 27);
      const n = 5;
      const p = (INNER.hw * 2) / n;
      const q = (fract((x - wave + INNER.hw) / p) - 0.5) * 2; // -1..1 across a ribbon
      return 3.1 * Math.pow(Math.max(0, 1 - q * q), 0.55);
    },
  },

  // maccheroni: short smooth tubes in staggered rows
  maccheroni: { mask: true, h: (x, y) => tubes(x, y, { angle: 0, len: 10.5, r: 2.15, sx: 13, sy: 5.6 }) },

  // penne: ridged tubes on the diagonal, ends cut on the slant
  penne: { mask: true, h: (x, y) => tubes(x, y, { angle: Math.PI / 4, len: 15, r: 2.3, sx: 18.5, sy: 6.2, ridges: 4, slant: 1.6 }) },

  // spaghetti: thin round strands side by side
  spaghetti: {
    mask: true,
    h: (x) => {
      const p = 2.65;
      const d = (fract((x + INNER.hw) / p) - 0.5) * p;
      const r = 1.18;
      return 0.15 + 1.15 * Math.sqrt(Math.max(0, 1 - (d / r) ** 2));
    },
  },

  // reginette: flat ribbons with ruffled (frilly) edges, running top to bottom
  reginette: {
    mask: true,
    h: (x, y) => {
      const n = 4;
      const p = (INNER.hw * 2) / n;
      const u = (x + INNER.hw) / p;
      const q = Math.abs(fract(u) - 0.5) * 2; // 0 centre → 1 gap
      const ruffle = 0.5 + 0.5 * Math.sin((2 * Math.PI * y) / 3.6 + (Math.floor(u) % 2) * Math.PI);
      const edge = 0.74 + 0.07 * ruffle; // ribbon half-width wobbles with the frill
      if (q > edge) return 0;
      const inEdge = smoothstep(0.5, edge, q); // 0 in the flat middle, 1 at the frill
      const body = 1.35 * Math.pow(1 - (q / edge) ** 8, 0.5);
      return body + inEdge * (0.25 + 1.35 * ruffle) * (1 - smoothstep(edge - 0.05, edge, q));
    },
  },
};

/** 0 on the logo spot (kept flat), 1 elsewhere */
function logoMask(x, y) {
  if (!LOGO) return 1;
  return smoothstep(0.4, 2, sdRoundRect(x, y, 0, logoY(), LOGO_SIZE.w / 2 + 2.2, LOGO_SIZE.h / 2 + 1.6, LOGO_SIZE.h / 2 + 1.6));
}

function innerMask(x, y) {
  const dOut = sdRoundRect(x, y, 0, 0, INNER.hw, INNER.hh, INNER.r);
  const dCam = camDist(x, y, CAM_RING + 1.6);
  return smoothstep(0, 2.2, -dOut) * smoothstep(0, 2.2, dCam);
}

/* ---------------- geometry ---------------------------------------------- */
function reliefGeometry(pattern, { reliefScale = 1, smooth = 0 } = {}) {
  const def = PATTERNS[pattern] || PATTERNS.raviolo;
  // lighter mesh on phones (faster to build, smoother scrolling)
  const step = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches ? 0.5 : 0.36;
  const x0 = -W / 2 + 0.8;
  const y0 = -H / 2 + 0.8;
  const nx = Math.ceil((W - 1.6) / step) + 1;
  const ny = Math.ceil((H - 1.6) / step) + 1;
  const heights = new Float32Array(nx * ny);
  const keep = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    const y = y0 + j * step;
    for (let i = 0; i < nx; i++) {
      const x = x0 + i * step;
      const idx = j * nx + i;
      const out = sdRoundRect(x, y, 0, 0, W / 2, H / 2, R);
      const inCam = camDist(x, y, CAM_RING);
      keep[idx] = out < -0.9 && inCam > 0.4 ? 1 : 0;
      let h = def.h(x, y);
      if (def.mask) h *= innerMask(x, y);
      h *= logoMask(x, y);
      heights[idx] = Math.max(0, h) * reliefScale;
    }
  }
  if (smooth) {
    // soften the relief (silicone flows and rounds everything)
    const tmp = new Float32Array(heights);
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        const k = j * nx + i;
        heights[k] = (tmp[k] * 4 + tmp[k - 1] + tmp[k + 1] + tmp[k - nx] + tmp[k + nx]) / 8;
      }
    }
  }
  const pos = new Float32Array(nx * ny * 3);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      pos[k * 3] = x0 + i * step;
      pos[k * 3 + 1] = y0 + j * step;
      pos[k * 3 + 2] = PLATE - 0.25 + heights[k];
    }
  }
  const index = [];
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i;
      const b = a + 1;
      const c = a + nx;
      const d = c + 1;
      if (keep[a] && keep[b] && keep[c] && keep[d]) index.push(a, b, d, a, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  const uv = new Float32Array(nx * ny * 2);
  for (let k = 0; k < nx * ny; k++) {
    uv[k * 2] = pos[k * 3];
    uv[k * 2 + 1] = pos[k * 3 + 1];
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}

function extrude(shape, depth, bevel, z, thinnest = Infinity) {
  // the inward bevel must stay well under half of the thinnest wall,
  // otherwise the offset contours cross and the mesh folds over itself
  bevel = Math.min(bevel, thinnest * 0.3, depth * 0.45);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.1, depth - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 6,
    curveSegments: 18,
  });
  const s = smoothGeometry(g);
  s.translate(0, 0, z + bevel);
  return s;
}

/**
 * @param pattern   one of COVER_PATTERNS
 * @param color     palette hex
 * @param material  'raw' | 'aldente' | 'overcooked'
 * @param model     key of PHONE_MODELS (size, corners, camera, buttons)
 */
export function buildCover({ pattern = 'raviolo', color = '#ffb548', material = 'aldente', model = DEFAULT_MODEL, logo = true, phone = true } = {}) {
  const spec = setModel(model);
  LOGO = logo;
  const hints = MATERIAL_SHAPE[material] || MATERIAL_SHAPE.aldente;
  const mat = () => makeMaterial(color, material, UV_REPEAT);
  const group = new THREE.Group();
  const bevel = material === 'overcooked' ? 0.85 : material === 'raw' ? 0.35 : 0.6;
  const gap = (a, b) => Math.max(Math.abs(a.x - b.x) - (a.w + b.w) / 2, Math.abs(a.y - b.y) - (a.h + b.h) / 2);
  const thinnest = Math.min(...CAMS.map((c) => c.inset), ...CAMS.flatMap((a) => CAMS.filter((b) => b !== a).map((b) => gap(a, b))));

  // back plate with the camera openings
  const back = roundedRect(0, 0, W, H, R);
  for (const c of CAMS) back.holes.push(roundedRect(c.x, c.y, c.w, c.h, c.r, true));
  group.add(new THREE.Mesh(extrude(back, PLATE, bevel, 0, thinnest), mat()));

  // side walls
  const wall = roundedRect(0, 0, W, H, R);
  wall.holes.push(roundedRect(0, 0, W - RIM_T * 2, H - RIM_T * 2, R - RIM_T, true));
  group.add(new THREE.Mesh(extrude(wall, RIM_D, bevel, -RIM_D + PLATE * 0.6, RIM_T), mat()));
  // front lip that holds the phone
  const lip = roundedRect(0, 0, W - RIM_T * 2 + 0.2, H - RIM_T * 2 + 0.2, R - RIM_T);
  lip.holes.push(roundedRect(0, 0, W - RIM_T * 2 - 2.2, H - RIM_T * 2 - 2.2, R - RIM_T - 1.1, true));
  group.add(new THREE.Mesh(extrude(lip, 1.2, 0.35, -RIM_D + PLATE * 0.6, 1.1), mat()));

  // raised ring around every camera opening
  for (const c of CAMS) {
    const ring = roundedRect(c.x, c.y, c.w + CAM_RING * 2, c.h + CAM_RING * 2, c.r + CAM_RING);
    ring.holes.push(roundedRect(c.x, c.y, c.w, c.h, c.r, true));
    group.add(new THREE.Mesh(extrude(ring, 1.5 * hints.depth, bevel * 0.9, PLATE - 0.3, CAM_RING), mat()));
  }

  // side buttons (seen from the back: x > 0 is the phone's left side)
  const btn = (side, fromTop, len) => {
    const g = new RoundedBoxGeometry(1.6, len, 3.2, 3, 0.7);
    const m = new THREE.Mesh(g, mat());
    m.position.set(side * (W / 2 + 0.35), H / 2 - fromTop - len / 2, -RIM_D / 2 + 1);
    group.add(m);
  };
  const L = 1; // phone's left edge (volume on iPhone), seen from the back
  if (spec.buttons.startsWith('iphone')) {
    btn(-L, 33, 17); // power (right side of the phone)
    btn(L, 34, 10); // volume +
    btn(L, 47, 10); // volume −
    btn(L, 20, 5.5); // action
    if (spec.buttons === 'iphone-cc') btn(-L, 92, 14); // camera control
  } else if (spec.buttons === 'galaxy') {
    btn(-L, 30, 21); // volume
    btn(-L, 55, 12); // power
  } else {
    btn(-L, 36, 11); // power
    btn(-L, 52, 21); // volume
  }

  // openings on the bottom edge: charging port, speaker and microphone
  group.add(bottomOpenings(spec.ports));

  // relief
  const relief = reliefGeometry(pattern, { reliefScale: hints.relief, smooth: hints.smoothRelief });
  group.add(new THREE.Mesh(relief, mat()));

  // printed Imperia logo, small and centred near the bottom edge
  if (logo) group.add(logoDecal(logoY(), PLATE + 0.04));
  // the phone inside: dark frame, glass and lenses through the camera opening
  if (phone) group.add(buildPhone());
  return group;
}

/*
 * Bottom-edge openings, drawn as dark recesses on the outside of the bottom
 * wall (x seen from the back). iPhone: USB-C in the middle with speaker and
 * microphone slots either side; Samsung / Pixel: USB-C, speaker on one side,
 * microphone hole on the other.
 */
function bottomOpenings(kind = 'iphone') {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: '#0d0e10', roughness: 0.9, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
  const zc = -RIM_D / 2 + 1; // middle of the phone's edge
  const add = (x, w, h) => {
    const m = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(0, 0, w, h, h / 2), 12), dark);
    m.rotation.x = Math.PI / 2; // facing down (-y)
    m.position.set(x, -H / 2 - 0.03, zc);
    m.userData.noShadow = true;
    g.add(m);
  };
  add(0, 12.5, 5); // USB-C
  if (kind === 'iphone') {
    add(-17, 11, 3); // speaker (phone's right, seen from the back)
    add(17, 11, 3); // microphone
  } else {
    add(-17, 12, 3); // speaker
    add(11, 3, 3); // microphone
  }
  return g;
}

let logoTexture = null;
function logoDecal(y, z) {
  if (!logoTexture) {
    logoTexture = new THREE.TextureLoader().load(logoUrl);
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    logoTexture.anisotropy = 8;
  }
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(LOGO_SIZE.w, LOGO_SIZE.h),
    new THREE.MeshPhysicalMaterial({ map: logoTexture, transparent: true, alphaTest: 0.05, roughness: 0.45, clearcoat: 0.2, polygonOffset: true, polygonOffsetFactor: -2 }),
  );
  m.position.set(0, y, z);
  m.userData.keepTexture = true;
  m.userData.noShadow = true;
  return m;
}

/** A phone sitting in the case (makes the preview read like a product photo). */
function buildPhone() {
  const g = new THREE.Group();
  const frame = new THREE.MeshPhysicalMaterial({ color: '#3a3c40', metalness: 0.75, roughness: 0.32, clearcoat: 0.4 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#07080a', metalness: 0.1, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 });
  const pw = W - RIM_T * 2 - 0.3;
  const ph = H - RIM_T * 2 - 0.3;
  const depth = RIM_D - PLATE * 0.6 - 1.4;
  // extruded outline so the phone's corners follow the case (a rounded box
  // has the same small radius on every edge and poked out at the corners)
  const body = new THREE.Mesh(extrude(roundedRect(0, 0, pw, ph, Math.max(1, R - RIM_T - 0.15)), depth, 1.2, -depth - 0.05), frame);
  g.add(body);
  // rounded like the phone: a square screen showed at the corners of the case
  const screen = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(0, 0, pw - 2.6, ph - 2.6, Math.max(1, R - RIM_T - 1.4)), 24), glass);
  screen.rotation.y = Math.PI;
  screen.position.z = -depth - 0.1;
  g.add(screen);
  // camera module and lenses, inside each opening
  for (const c of CAMS) {
    const plate = new THREE.Mesh(extrude(roundedRect(c.x, c.y, c.w - 0.8, c.h - 0.8, Math.max(0.5, c.r - 0.4)), 1.3, 0.3, 0), frame);
    g.add(plate);
    const lenses = [];
    const big = Math.min(c.w, c.h);
    if (c.w > c.h * 2) for (let i = -1; i <= 1; i++) lenses.push([c.x + i * c.w * 0.26, c.y, c.h * 0.32]);
    else if (c.h > c.w * 2.2) for (const k of [-1, 0, 1]) lenses.push([c.x, c.y + k * c.h * 0.3, c.w * 0.32]);
    else if (c.h > c.w * 1.5) for (const s of [-1, 1]) lenses.push([c.x, c.y + s * c.h * 0.24, c.w * 0.34]);
    else if (big > 24) {
      lenses.push([c.x - c.w * 0.21, c.y + c.h * 0.21, big * 0.17], [c.x - c.w * 0.21, c.y - c.h * 0.21, big * 0.17], [c.x + c.w * 0.21, c.y, big * 0.17]);
    } else lenses.push([c.x, c.y, big * 0.36]);
    for (const [x, y, r] of lenses) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.18, r * 1.22, 1.4, 40), frame);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, y, 1.9);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.5, 40), glass);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, y, 2);
      g.add(ring, lens);
    }
  }
  return g;
}

/** Pure height function, exported for tests. */
export function coverHeightAt(pattern, x, y, model = DEFAULT_MODEL) {
  setModel(model);
  LOGO = true;
  const def = PATTERNS[pattern];
  const h = def.h(x, y) * logoMask(x, y);
  return Math.max(0, def.mask ? h * innerMask(x, y) : h);
}
/** Size and camera openings of a model (mm), exported for tests and the packaging. */
export function coverSize(model = DEFAULT_MODEL) {
  setModel(model);
  return { W, H, R, cameras: CAMS.map((c) => ({ ...c })), camera: { x: CAMS[0].x, y: CAMS[0].y } };
}
export const COVER_SIZE = coverSize();
