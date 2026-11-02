// Small 3D ingredients for the recipe builder of the free events. They are
// rendered once with the app's studio (scripts/render-ingredients.py) and shown
// as images on the plate. Units are millimetres.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeMaterial } from './three/materials.js';
import { boxUV } from './three/geometry.js';

const TAU = Math.PI * 2;
const glossy = (color, roughness = 0.3, clearcoat = 0.5) => new THREE.MeshPhysicalMaterial({ color, roughness, clearcoat, clearcoatRoughness: 0.25 });
const soft = (color, roughness = 0.6) => new THREE.MeshPhysicalMaterial({ color, roughness, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#fff'), 0.4) });

/** smooth pseudo-noise for lumpy shapes */
const noise = (x, y, z, seed = 1) => Math.sin(x * 1.7 + seed) * Math.sin(y * 2.3 + seed * 1.3) * Math.sin(z * 1.9 + seed * 0.7);
function lumpy(geo, amount, freq, seed) {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();
    const k = 1 + amount * (noise(n.x * freq, n.y * freq, n.z * freq, seed) + 0.5 * noise(n.x * freq * 2.1, n.y * freq * 2.1, n.z * freq * 2.1, seed + 3));
    pos.setXYZ(i, v.x * k, v.y * k, v.z * k);
  }
  geo.computeVertexNormals();
  return geo;
}

/** a smooth leaf: a fine grid shaped like a leaf, cupped and arched */
function leaf(len, wid, material, cup = 0.012) {
  const nu = 40;
  const nv = 16;
  const pos = [];
  for (let i = 0; i <= nu; i++) {
    const u = i / nu;
    const half = (wid / 2) * Math.sin(Math.PI * u) ** 0.75 * (1 - 0.25 * u);
    for (let j = 0; j <= nv; j++) {
      const v = (j / nv) * 2 - 1;
      const x = v * half;
      const y = u * len;
      const z = cup * x * x * 18 + 0.002 * (y - len / 2) ** 2 - 0.45 * Math.exp(-(x * x) / 0.5) * Math.sin(Math.PI * u);
      pos.push(x, y, z);
    }
  }
  const idx = [];
  const at = (i, j) => i * (nv + 1) + j;
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) idx.push(at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j), at(i + 1, j + 1), at(i, j + 1));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  boxUV(g);
  material.side = THREE.DoubleSide;
  return new THREE.Mesh(g, material);
}

function wedge(radius, height, angle, material) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.absarc(0, 0, radius, -angle / 2, angle / 2, false);
  s.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: true, bevelThickness: 0.8, bevelSize: 0.8, bevelSegments: 3, curveSegments: 24 });
  g.computeVertexNormals();
  boxUV(g);
  const m = new THREE.Mesh(g, material);
  m.rotation.x = -Math.PI / 2;
  return m;
}

const BUILD = {
  tomato() {
    const g = new THREE.Group();
    const skin = glossy('#e1201b', 0.22, 0.8);
    const green = glossy('#2f6b2f', 0.5, 0.2);
    for (const [x, z, r] of [[-7, 2, 10], [9, -4, 8.5]]) {
      const ball = new THREE.Mesh(lumpy(new THREE.SphereGeometry(r, 48, 32), 0.015, 2, x), skin);
      ball.scale.y = 0.86;
      ball.position.set(x, r * 0.86, z);
      // star-shaped calyx and a short stem
      const star = new THREE.Shape();
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * TAU;
        const rr = i % 2 ? r * 0.18 : r * 0.5;
        star[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr);
      }
      const calyx = new THREE.Mesh(new THREE.ExtrudeGeometry(star, { depth: 0.5, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3, bevelSegments: 1 }), green);
      calyx.rotation.x = -Math.PI / 2;
      calyx.position.set(x, r * 1.7, z);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 3, 12), green);
      stem.position.set(x, r * 1.72 + 1.5, z);
      g.add(ball, calyx, stem);
    }
    return g;
  },
  basil() {
    const g = new THREE.Group();
    const m = glossy('#2d7a37', 0.42, 0.35);
    const a = leaf(34, 22, m, 0.004);
    a.rotation.set(-Math.PI / 2 + 0.06, 0, 0.5);
    a.position.set(-6, 3, 8);
    const b = leaf(28, 18, m, 0.004);
    b.rotation.set(-Math.PI / 2 + 0.06, 0, -0.9);
    b.position.set(6, 5, 6);
    g.add(a, b);
    return g;
  },
  guanciale() {
    const g = new THREE.Group();
    const lean = soft('#c4675c', 0.55);
    const fat = soft('#f4e7dc', 0.5);
    for (const [x, z, ry] of [[-12, 0, 0.3], [4, -6, -0.4], [12, 9, 0.9], [-3, 12, 0.1]]) {
      const c = new THREE.Group();
      const l = new THREE.Mesh(new RoundedBoxGeometry(13, 5, 7, 3, 1.4), lean);
      l.position.y = 2.5;
      const f = new THREE.Mesh(new RoundedBoxGeometry(13, 4, 7, 3, 1.4), fat);
      f.position.y = 6.6;
      c.add(l, f);
      c.position.set(x, 0, z);
      c.rotation.y = ry;
      g.add(c);
    }
    return g;
  },
  egg() {
    const yolk = new THREE.Mesh(lumpy(new THREE.SphereGeometry(14, 64, 40), 0.01, 1.5, 2), glossy('#ffa51f', 0.12, 1));
    yolk.scale.y = 0.55;
    yolk.position.y = 6;
    const g = new THREE.Group();
    g.add(yolk);
    return g;
  },
  pecorino() {
    const g = new THREE.Group();
    const w = wedge(30, 14, 0.75, makeMaterial('#efe3c3', 'raw', 1 / 6));
    w.position.set(-10, 0, 4);
    w.rotation.z = 0.4;
    g.add(w);
    return g;
  },
  pepper() {
    const g = new THREE.Group();
    const m = soft('#2f2a26', 0.75);
    const spots = [[0, 0], [7, 2], [-6, 4], [3, -7], [-4, -5], [9, -6], [-10, -2], [1, 8]];
    spots.forEach(([x, z], i) => {
      const s = new THREE.Mesh(lumpy(new THREE.SphereGeometry(3.4, 24, 16), 0.12, 4, i + 1), m);
      s.position.set(x, 3.2, z);
      g.add(s);
    });
    return g;
  },
  // ragù: a small white bowl of slow-cooked meat sauce (red-brown, minced
  // texture, glossy), so it reads as a sauce and not as a lump
  ragu() {
    const g = new THREE.Group();
    const porcelain = new THREE.MeshPhysicalMaterial({ color: '#fbfaf6', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
    const profile = [
      [0, 0], [9, 0], [10, 0.6], [10.4, 1.6], [15, 4], [19.5, 9], [21, 12.5], [21.6, 13.4], [20.6, 13.6], [19.2, 10.6], [14.6, 6], [9.5, 3.2], [0, 3],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), porcelain);
    porcelain.side = THREE.DoubleSide;
    g.add(bowl);
    // the sauce surface, slightly domed, filling the bowl
    const sauce = glossy('#9a321d', 0.32, 0.7);
    const top = new THREE.Mesh(lumpy(new THREE.SphereGeometry(19, 64, 24, 0, TAU, 0, Math.PI / 2), 0.025, 6, 3), sauce);
    top.scale.y = 0.2;
    top.position.y = 9.2;
    g.add(top);
    // minced meat: many small irregular bits in a few tones
    const tones = ['#7a2a1a', '#963822', '#6b2416', '#a5452a'].map((c) => glossy(c, 0.45, 0.4));
    let seed = 9;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 160; i++) {
      const a = rand() * TAU;
      const r = Math.sqrt(rand()) * 16.5;
      const bit = new THREE.Mesh(lumpy(new THREE.IcosahedronGeometry(0.55 + rand() * 0.7, 2), 0.3, 3, i), tones[i % tones.length]);
      bit.position.set(Math.cos(a) * r, 9.3 + 3.6 * (1 - (r / 19) ** 2) * 0.95 + rand() * 0.3, Math.sin(a) * r);
      bit.rotation.set(rand() * 3, rand() * 3, rand() * 3);
      g.add(bit);
    }
    return g;
  },
  parmigiano() {
    const g = new THREE.Group();
    const w = wedge(34, 18, 0.62, makeMaterial('#ecd08a', 'raw', 1 / 5));
    w.position.set(-12, 0, 6);
    w.rotation.z = -0.3;
    g.add(w);
    return g;
  },
  mozzarella() {
    const g = new THREE.Group();
    const m = new THREE.MeshPhysicalMaterial({ color: '#fbf9f2', roughness: 0.32, clearcoat: 0.6, sheen: 0.5, sheenColor: new THREE.Color('#ffffff') });
    for (const [x, z, r] of [[-5, 0, 13], [11, 6, 7.5]]) {
      const b = new THREE.Mesh(lumpy(new THREE.SphereGeometry(r, 48, 32), 0.02, 1.4, x), m);
      b.scale.y = 0.9;
      b.position.set(x, r * 0.9, z);
      g.add(b);
    }
    return g;
  },
  butter() {
    const b = new THREE.Mesh(new RoundedBoxGeometry(32, 14, 22, 4, 2.2), glossy('#f6dc86', 0.38, 0.4));
    b.position.y = 7;
    b.rotation.y = 0.4;
    const g = new THREE.Group();
    g.add(b);
    return g;
  },
  sage() {
    const g = new THREE.Group();
    const m = soft('#8ea683', 0.85);
    const a = leaf(36, 15, m, 0.006);
    a.rotation.set(-Math.PI / 2 + 0.06, 0, 0.6);
    a.position.set(-6, 3, 8);
    const b = leaf(30, 13, m, 0.006);
    b.rotation.set(-Math.PI / 2 + 0.06, 0, -0.7);
    b.position.set(7, 4.5, 7);
    g.add(a, b);
    return g;
  },
};

export const INGREDIENT_IDS = Object.keys(BUILD);
export function buildIngredient(id) {
  return (BUILD[id] || BUILD.tomato)();
}
