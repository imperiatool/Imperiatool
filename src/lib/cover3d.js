// Procedural 3D phone cover with pasta-inspired relief patterns.
// Units are millimetres. The relief is a height-field (one function per
// pattern) laid on the back plate, faded out near the borders and the camera.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeMaterial, MATERIAL_SHAPE } from './three/materials.js';
import { roundedRect, sdRoundRect, roundRectArc, roundRectPerimeter, smoothstep, smoothGeometry } from './three/geometry.js';

export const COVER_PATTERNS = ['raviolo', 'ravioli', 'sfoglia', 'tagliatelle', 'spaghetti', 'spighe'];

// generic modern phone (≈ 6.1")
const W = 72;
const H = 148;
const R = 11.5;
const PLATE = 1.8; // back thickness
const RIM_T = 1.5; // side wall thickness
const RIM_D = 9.2; // side wall depth (phone thickness + lip)
const CAM = { w: 33, h: 33, r: 8.5, inset: 5.8 };
const CAM_RING = 1.9;
const camC = { x: -W / 2 + CAM.inset + CAM.w / 2, y: H / 2 - CAM.inset - CAM.h / 2 };
const UV_REPEAT = 1 / 9; // grain tile ≈ 9 mm

/* ---------------- relief patterns: height in mm at (x, y) ---------------- */
const fract = (v) => v - Math.floor(v);
const tri = (v) => Math.abs(fract(v) - 0.5) * 2; // 1 at cell borders, 0 in the middle

const INNER = { hw: W / 2 - 2.4, hh: H / 2 - 2.4, r: R - 2.4 };
const GRID = (() => {
  // square cells that fit the inner width exactly
  const cols = 4;
  const c = (INNER.hw * 2) / cols;
  return { c, x0: -INNER.hw, y0: INNER.hh };
})();

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
  const hw = CAM.w / 2 + CAM_RING + 2.6;
  const hh = CAM.h / 2 + CAM_RING + 2.6;
  const r = CAM.r + CAM_RING + 2.6;
  const d = sdRoundRect(x, y, camC.x, camC.y, hw, hh, r);
  const across = 1 - (d / 2.2) ** 2;
  if (across <= 0) return 0;
  const P = roundRectPerimeter(hw, hh, r);
  const n = Math.round(P / period);
  const s = roundRectArc(x, y, camC.x, camC.y, hw, hh, r);
  // between the camera and the outer edge there are only ~4 mm: the border
  // crimp already covers that strip, so fade these bumps out there
  const dOut = -sdRoundRect(x, y, 0, 0, W / 2, H / 2, R);
  return smoothstep(5, 7, dOut) * height * Math.sqrt(across) * (0.3 + 0.7 * (0.5 + 0.5 * Math.cos((2 * Math.PI * n * s) / P)));
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

const PATTERNS = {
  // raviolo: crimped raviolo border all around + around the camera, plain inside
  raviolo: { mask: false, h: (x, y) => Math.max(edgeBumps(x, y), camBumps(x, y)) },

  // ravioli: quilted pillows separated by crimped seams
  ravioli: {
    mask: true,
    h: (x, y) => {
      const { u, v, fu, fv } = gridCoords(x, y);
      const seam = 2.6 / GRID.c; // seam width in cell units
      const a = Math.max(0, (Math.abs(fu - 0.5) * 2 - (1 - seam * 2)) / (seam * 2));
      const b = Math.max(0, (Math.abs(fv - 0.5) * 2 - (1 - seam * 2)) / (seam * 2));
      const px = 1 - Math.min(1, (Math.abs(fu - 0.5) * 2) ** 6 / (1 - seam) ** 6);
      const py = 1 - Math.min(1, (Math.abs(fv - 0.5) * 2) ** 6 / (1 - seam) ** 6);
      const pillow = Math.max(0, px * py) ** 0.55;
      let h = 0.55 + 2.4 * pillow;
      // crimp dots on both sides of every seam
      const dx = (Math.min(fu, 1 - fu)) * GRID.c; // mm to vertical seam
      const dy = (Math.min(fv, 1 - fv)) * GRID.c;
      const dots = Math.max(dottedLine(Math.abs(dx - 0.9), v * GRID.c), dottedLine(Math.abs(dy - 0.9), u * GRID.c));
      if (Math.max(a, b) > 0 || dots) h -= 0.35 * dots;
      return h;
    },
  },

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

  // spighe: two braided "wheat ear" columns + crimped border
  spighe: {
    mask: false,
    h: (x, y) => {
      let h = edgeBumps(x, y, { height: 1.5, period: 5 });
      const mask = innerMask(x, y);
      if (mask <= 0) return h;
      const cols = [-W * 0.13, W * 0.2];
      const pl = 5.2;
      const ang = (52 * Math.PI) / 180;
      for (const cx of cols) {
        if (Math.abs(x - cx) > 6.5) continue;
        for (const side of [-1, 1]) {
          const off = side > 0 ? pl / 2 : 0;
          const k = Math.round((y - off) / pl);
          for (let j = k - 1; j <= k + 1; j++) {
            const lx0 = cx + side * 2.1;
            const ly0 = j * pl + off;
            const dx = x - lx0;
            const dy = y - ly0;
            const th = side * ang;
            const lx = dx * Math.cos(th) + dy * Math.sin(th);
            const ly = -dx * Math.sin(th) + dy * Math.cos(th);
            const qq = (lx / 1.45) ** 2 + (ly / 3.1) ** 2;
            if (qq < 1) h = Math.max(h, 1.9 * Math.sqrt(1 - qq) * mask);
          }
        }
      }
      return h;
    },
  },
};

function innerMask(x, y) {
  const dOut = sdRoundRect(x, y, 0, 0, INNER.hw, INNER.hh, INNER.r);
  const dCam = sdRoundRect(x, y, camC.x, camC.y, CAM.w / 2 + CAM_RING + 1.6, CAM.h / 2 + CAM_RING + 1.6, CAM.r + CAM_RING + 1.6);
  return smoothstep(0, 2.2, -dOut) * smoothstep(0, 2.2, dCam);
}

/* ---------------- geometry ---------------------------------------------- */
function reliefGeometry(pattern, { reliefScale = 1, smooth = 0 } = {}) {
  const def = PATTERNS[pattern] || PATTERNS.raviolo;
  const step = 0.36;
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
      const inCam = sdRoundRect(x, y, camC.x, camC.y, CAM.w / 2 + CAM_RING, CAM.h / 2 + CAM_RING, CAM.r + CAM_RING);
      keep[idx] = out < -0.9 && inCam > 0.4 ? 1 : 0;
      let h = def.h(x, y);
      if (def.mask) h *= innerMask(x, y);
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
 */
export function buildCover({ pattern = 'raviolo', color = '#ffb548', material = 'aldente' } = {}) {
  const hints = MATERIAL_SHAPE[material] || MATERIAL_SHAPE.aldente;
  const mat = () => makeMaterial(color, material, UV_REPEAT);
  const group = new THREE.Group();
  const bevel = material === 'overcooked' ? 0.85 : material === 'raw' ? 0.35 : 0.6;

  // back plate with the camera opening
  const back = roundedRect(0, 0, W, H, R);
  back.holes.push(roundedRect(camC.x, camC.y, CAM.w, CAM.h, CAM.r, true));
  group.add(new THREE.Mesh(extrude(back, PLATE, bevel, 0, CAM.inset), mat()));

  // side walls
  const wall = roundedRect(0, 0, W, H, R);
  wall.holes.push(roundedRect(0, 0, W - RIM_T * 2, H - RIM_T * 2, R - RIM_T, true));
  group.add(new THREE.Mesh(extrude(wall, RIM_D, bevel, -RIM_D + PLATE * 0.6, RIM_T), mat()));
  // front lip that holds the phone
  const lip = roundedRect(0, 0, W - RIM_T * 2 + 0.2, H - RIM_T * 2 + 0.2, R - RIM_T);
  lip.holes.push(roundedRect(0, 0, W - RIM_T * 2 - 2.2, H - RIM_T * 2 - 2.2, R - RIM_T - 1.1, true));
  group.add(new THREE.Mesh(extrude(lip, 1.2, 0.35, -RIM_D + PLATE * 0.6, 1.1), mat()));

  // raised camera ring
  const ring = roundedRect(camC.x, camC.y, CAM.w + CAM_RING * 2, CAM.h + CAM_RING * 2, CAM.r + CAM_RING);
  ring.holes.push(roundedRect(camC.x, camC.y, CAM.w, CAM.h, CAM.r, true));
  group.add(new THREE.Mesh(extrude(ring, 1.5 * hints.depth, bevel * 0.9, PLATE - 0.3, CAM_RING), mat()));

  // side buttons
  const btn = (x, y, len) => {
    const g = new RoundedBoxGeometry(1.6, len, 3.2, 3, 0.7);
    const m = new THREE.Mesh(g, mat());
    m.position.set(x, y, -RIM_D / 2 + 1);
    group.add(m);
  };
  btn(W / 2 + 0.35, H / 2 - 42, 17); // power
  btn(-W / 2 - 0.35, H / 2 - 33, 10); // volume +
  btn(-W / 2 - 0.35, H / 2 - 46, 10); // volume −
  btn(-W / 2 - 0.35, H / 2 - 21, 5); // action

  // relief
  const relief = reliefGeometry(pattern, { reliefScale: hints.relief, smooth: hints.smoothRelief });
  group.add(new THREE.Mesh(relief, mat()));
  return group;
}

/** Pure height function, exported for tests. */
export function coverHeightAt(pattern, x, y) {
  const def = PATTERNS[pattern];
  const h = def.h(x, y);
  return Math.max(0, def.mask ? h * innerMask(x, y) : h);
}
export const COVER_SIZE = { W, H, camera: camC };
