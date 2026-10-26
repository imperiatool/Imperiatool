// Pasta shapes in 3D for Imperia® Events: the same studio, lights and
// Raw / Al Dente / Overcooked materials as the cases and charms.
// Units are millimetres (so the raw-pasta grain has a real size).
import * as THREE from 'three';
import { makeMaterial } from './three/materials.js';
import { boxUV, smoothstep } from './three/geometry.js';

export const PASTA_SHAPES = ['reginette', 'sculpture', 'spaghetti', 'gnocchi', 'fusilli', 'ravioli'];
const UV = 1 / 9;
const TAU = Math.PI * 2;

/* ---------- geometry helpers --------------------------------------------- */

/**
 * A closed solid around a surface p(u, v), u, v ∈ [0, 1]: top and bottom are
 * offset along the surface normal by thick(u, v) = [up, down]; the edges are
 * joined by side strips. `wrapU` closes the surface in u (rings, Möbius).
 */
function solidSheet(p, thick, nu, nv, { wrapU = false } = {}) {
  const cols = wrapU ? nu : nu + 1;
  const rows = nv + 1;
  const e = 1e-4;
  const pos = [];
  const centre = new THREE.Vector3();
  const du = new THREE.Vector3();
  const dv = new THREE.Vector3();
  const n = new THREE.Vector3();
  const top = [];
  const bot = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const u = i / nu;
      const v = j / nv;
      centre.copy(p(u, v));
      du.copy(p(u + e, v)).sub(p(u - e, v));
      dv.copy(p(u, Math.min(1, v + e))).sub(p(u, Math.max(0, v - e)));
      n.crossVectors(du, dv).normalize();
      const [a, b] = thick(u, v);
      top.push(pos.length / 3);
      pos.push(centre.x + n.x * a, centre.y + n.y * a, centre.z + n.z * a);
      bot.push(pos.length / 3);
      pos.push(centre.x - n.x * b, centre.y - n.y * b, centre.z - n.z * b);
    }
  }
  const T = (i, j) => top[(i % cols) * rows + j];
  const B = (i, j) => bot[(i % cols) * rows + j];
  const idx = [];
  const quad = (a, b, c, d) => idx.push(a, b, c, a, c, d);
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      // a Möbius strip comes back upside down: the top meets the bottom
      const flip = wrapU && i === nu - 1 && thick.mobius;
      const T2 = (jj) => (flip ? B(0, nv - jj) : T(i + 1, jj));
      const B2 = (jj) => (flip ? T(0, nv - jj) : B(i + 1, jj));
      quad(T(i, j), T2(j), T2(j + 1), T(i, j + 1));
      quad(B(i, j), B(i, j + 1), B2(j + 1), B2(j));
    }
    const flip = wrapU && i === nu - 1 && thick.mobius;
    const T2 = (jj) => (flip ? B(0, nv - jj) : T(i + 1, jj));
    const B2 = (jj) => (flip ? T(0, nv - jj) : B(i + 1, jj));
    // edges at v = 0 and v = 1
    quad(T(i, 0), B(i, 0), B2(0), T2(0));
    quad(T(i, nv), T2(nv), B2(nv), B(i, nv));
  }
  if (!wrapU) {
    for (let j = 0; j < nv; j++) {
      quad(T(0, j), T(0, j + 1), B(0, j + 1), B(0, j));
      quad(T(nu, j), B(nu, j), B(nu, j + 1), T(nu, j + 1));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  boxUV(g);
  return g;
}

/** Closed tube-like grid (u along, v around), for fusilli. */
function sweep(p, nu, nv) {
  const pos = [];
  for (let i = 0; i <= nu; i++) for (let j = 0; j < nv; j++) pos.push(...p(i / nu, j / nv).toArray());
  const idx = [];
  const at = (i, j) => i * nv + (j % nv);
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) idx.push(at(i, j), at(i, j + 1), at(i + 1, j + 1), at(i, j), at(i + 1, j + 1), at(i + 1, j));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  boxUV(g);
  return g;
}

const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* ---------- the shapes ---------------------------------------------------- */

// Reginette: a long ribbon with ruffled edges, lying in a loose S
function reginette() {
  const L = 96;
  const W = 19;
  const centre = (u) => new THREE.Vector3((u - 0.5) * L, 3 + 9 * Math.sin(Math.PI * u) ** 2, 17 * Math.sin(TAU * u * 0.9 - 0.4));
  const frame = (u) => {
    const t = centre(u + 1e-3).sub(centre(u - 1e-3)).normalize();
    const side = new THREE.Vector3(-t.z, 0, t.x).normalize();
    const nrm = new THREE.Vector3().crossVectors(t, side);
    const tw = 0.55 * Math.sin(TAU * u * 0.8); // gentle twist
    return { side: side.clone().multiplyScalar(Math.cos(tw)).addScaledVector(nrm, Math.sin(tw)), nrm: nrm.clone().multiplyScalar(Math.cos(tw)).addScaledVector(side, -Math.sin(tw)) };
  };
  const p = (u, v) => {
    const { side, nrm } = frame(u);
    const s = v * 2 - 1;
    const edge = smoothstep(0.5, 1, Math.abs(s)) ** 1.2;
    const ruffle = 2.6 * edge * Math.sin((u * L * TAU) / 5.4 + (s > 0 ? 0 : Math.PI));
    return centre(u).addScaledVector(side, (s * W) / 2).addScaledVector(nrm, ruffle);
  };
  const thick = (u, v) => {
    const s = Math.abs(v * 2 - 1);
    const ends = smoothstep(0, 0.02, Math.min(u, 1 - u));
    const h = (0.55 + 0.6 * (1 - s * s)) * (0.4 + 0.6 * ends);
    return [h, h];
  };
  return [solidSheet(p, thick, 360, 40)];
}

// Shape Lab: a pasta that doesn't exist yet — a ruffled, ridged Möbius ribbon
function sculpture() {
  const R = 24;
  const W = 19;
  const tilt = new THREE.Matrix4().makeRotationX(-0.42).multiply(new THREE.Matrix4().makeRotationZ(0.18));
  const p = (u, v) => {
    const a = TAU * u;
    const s = v * 2 - 1;
    const radial = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const across = radial.clone().multiplyScalar(Math.cos(a / 2)).add(new THREE.Vector3(0, 0, Math.sin(a / 2)));
    const nrm = new THREE.Vector3().crossVectors(new THREE.Vector3(-Math.sin(a), Math.cos(a), 0), across).normalize();
    const edge = smoothstep(0.45, 1, Math.abs(s)) ** 1.3;
    const ruffle = 2.4 * edge * Math.sin(a * 22 + (s > 0 ? 0 : Math.PI));
    return radial.multiplyScalar(R).addScaledVector(across, (s * W) / 2).addScaledVector(nrm, ruffle).applyMatrix4(tilt);
  };
  const thick = (u, v) => {
    const s = v * 2 - 1;
    const ridges = 1 - 0.28 * Math.abs(Math.sin(s * Math.PI * 4.5)) * smoothstep(0.85, 0.4, Math.abs(s));
    const h = (0.7 + 0.7 * (1 - s * s)) * ridges;
    return [h, h];
  };
  thick.mobius = true;
  return [solidSheet(p, thick, 420, 44, { wrapU: true })];
}

// Spaghetti: a loose twirled nest, like a forkful set down on the plate
function spaghetti() {
  const out = [];
  const rand = rng(7);
  for (let k = 0; k < 15; k++) {
    const phase = rand() * TAU;
    const r0 = 13 + rand() * 4;
    const pts = [];
    const turns = 2.2 + rand() * 0.6;
    for (let i = 0; i <= 90; i++) {
      const t = i / 90;
      const a = phase + t * turns * TAU;
      const r = r0 + 2.4 * Math.sin(a * 1.7 + phase) - 3 * t;
      pts.push(new THREE.Vector3(r * Math.cos(a), 2 + 1.2 * k * 0.42 + 2.2 * Math.sin(a * 2.3 + phase * 1.3) + 5 * t, r * Math.sin(a)));
    }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 420, 1.05, 10, false);
    boxUV(g);
    out.push(g);
  }
  return out;
}

// Gnocchi: three ridged dumplings with the thumb dimple
function gnocchi() {
  const one = (seed) => {
    const g = new THREE.SphereGeometry(10, 120, 80);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      // fork ridges across the outside, thumb dimple on the inside
      const ridge = n.z > -0.2 ? 0.55 * (0.5 + 0.5 * Math.cos((v.x * TAU) / 2.7)) * smoothstep(-0.2, 0.3, n.z) : 0;
      const dimple = n.z < 0 ? 3.6 * Math.exp(-((v.x / 5.5) ** 2 + (v.y / 4.2) ** 2)) : 0;
      const r = 10 - ridge - dimple;
      v.copy(n).multiplyScalar(r);
      v.set(v.x * 1.4, v.y * 0.86, v.z * 0.92 + seed * 0);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    boxUV(g);
    return g;
  };
  const place = [
    [0, 0, 0, 0.3, 0.1],
    [24, 2, -14, -0.6, 0.3],
    [-12, 1, -24, 1.4, -0.2],
  ];
  return place.map(([x, y, z, ry, rz]) => {
    const g = one(0);
    g.rotateX(-Math.PI / 2 + 0.35);
    g.rotateZ(rz);
    g.rotateY(ry);
    g.translate(x, y + 8, z);
    return g;
  });
}

// Fusilli: three blades twisted into a spiral
function fusilli() {
  const make = () => {
    const L = 54;
    return sweep(
      (u, v) => {
        const s = u * L;
        const phi = v * TAU;
        const tw = (s * TAU) / 15;
        const end = Math.sqrt(Math.max(0, 1 - Math.abs((s - L / 2) / (L / 2)) ** 10));
        const blade = 1.3 + 3.9 * ((1 + Math.cos(3 * phi)) / 2) ** 2.4;
        const r = blade * end;
        return new THREE.Vector3(s - L / 2, r * Math.cos(phi + tw), r * Math.sin(phi + tw));
      },
      320,
      96,
    );
  };
  const a = make();
  a.rotateY(0.35);
  a.translate(-4, 5.5, 6);
  const b = make();
  b.rotateZ(0.1);
  b.rotateY(-0.75);
  b.translate(8, 5.5, -12);
  return [a, b];
}

// Ravioli: a filled pillow with a crimped, scalloped edge
function ravioli() {
  const one = (S) => {
    const scallop = (a, b) => {
      const w = smoothstep(0.86, 1, Math.max(Math.abs(a), Math.abs(b)));
      const along = Math.abs(a) > Math.abs(b) ? b : a;
      return 1 - 0.03 * w * (0.5 + 0.5 * Math.cos((along * S * Math.PI) / 2.6));
    };
    const p = (u, v) => {
      const a = u * 2 - 1;
      const b = v * 2 - 1;
      const k = scallop(a, b);
      return new THREE.Vector3((a * S * k) / 2, 0, (-b * S * k) / 2);
    };
    const thick = (u, v) => {
      const a = Math.abs(u * 2 - 1);
      const b = Math.abs(v * 2 - 1);
      const e = (1 - Math.max(a, b)) * (S / 2); // mm to the edge
      const along = a > b ? v : u;
      const crimp = e < 5 ? 0.35 * (0.5 + 0.5 * Math.cos((along * S * TAU) / 2.6)) * (1 - e / 5) : 0;
      const q = (a ** 6 + b ** 6) ** (1 / 6); // rounded-square distance from the centre
      const pillow = smoothstep(0, 1, (0.84 - q) / 0.55) ** 0.55 * smoothstep(2, 6, e);
      return [0.9 + 7 * pillow - crimp, 0.9 + 1.6 * pillow];
    };
    return solidSheet(p, thick, 140, 140);
  };
  const a = one(36);
  a.rotateY(0.3);
  a.translate(-6, 2.4, 4);
  const b = one(30);
  b.rotateZ(0.12);
  b.rotateY(-0.5);
  b.translate(24, 4, -18);
  return [a, b];
}

const BUILDERS = { reginette, sculpture, spaghetti, gnocchi, fusilli, ravioli };

/**
 * @param shape  one of PASTA_SHAPES
 * @param color  palette hex
 * @param finish 'raw' | 'aldente' | 'overcooked'
 */
export function buildPasta({ shape = 'reginette', color = '#ffb548', finish = 'raw' } = {}) {
  const group = new THREE.Group();
  const geos = (BUILDERS[shape] || reginette)();
  for (const g of geos) group.add(new THREE.Mesh(g, makeMaterial(color, finish, UV)));
  return group;
}
