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
    const sauce = glossy('#87391f', 0.32, 0.7); // warm red-brown, towards the app's Ragù #6a3933
    const top = new THREE.Mesh(lumpy(new THREE.SphereGeometry(19, 64, 24, 0, TAU, 0, Math.PI / 2), 0.025, 6, 3), sauce);
    top.scale.y = 0.2;
    top.position.y = 9.2;
    g.add(top);
    // minced meat: many small irregular bits in a few tones
    const tones = ['#6f2f1d', '#87402a', '#62291b', '#985032'].map((c) => glossy(c, 0.45, 0.4));
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

/** Small white porcelain bowl (same as the ragù's) with a sauce surface and bits. */
function bowlOf(sauceColor, bits, { roughness = 0.32, count = 120, size = 0.6, seed0 = 9 } = {}) {
  const g = new THREE.Group();
  const porcelain = new THREE.MeshPhysicalMaterial({ color: '#fbfaf6', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
  const profile = [
    [0, 0], [9, 0], [10, 0.6], [10.4, 1.6], [15, 4], [19.5, 9], [21, 12.5], [21.6, 13.4], [20.6, 13.6], [19.2, 10.6], [14.6, 6], [9.5, 3.2], [0, 3],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 72), porcelain));
  const top = new THREE.Mesh(lumpy(new THREE.SphereGeometry(19, 64, 24, 0, TAU, 0, Math.PI / 2), 0.025, 6, 3), glossy(sauceColor, roughness, 0.7));
  top.scale.y = 0.2;
  top.position.y = 9.2;
  g.add(top);
  const tones = bits.map((c) => glossy(c, 0.45, 0.4));
  let seed = seed0;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const a = rand() * TAU;
    const r = Math.sqrt(rand()) * 16.5;
    const bit = new THREE.Mesh(lumpy(new THREE.IcosahedronGeometry(size * (0.6 + rand() * 0.8), 2), 0.3, 3, i), tones[i % tones.length]);
    bit.scale.y = 0.6;
    bit.position.set(Math.cos(a) * r, 9.3 + 3.6 * (1 - (r / 19) ** 2) * 0.95 + rand() * 0.2, Math.sin(a) * r);
    bit.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    g.add(bit);
  }
  return g;
}

/** a pile of small irregular bits on the plate */
function pile(colors, count, size, spread, seed0 = 3) {
  const g = new THREE.Group();
  const mats = colors.map((c) => soft(c, 0.85));
  let seed = seed0;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const a = rand() * TAU;
    const r = Math.sqrt(rand()) * spread;
    const h = (1 - r / spread) * spread * 0.45;
    const b = new THREE.Mesh(lumpy(new THREE.IcosahedronGeometry(size * (0.5 + rand()), 1), 0.25, 3, i), mats[i % mats.length]);
    b.position.set(Math.cos(a) * r, h * rand() + size, Math.sin(a) * r);
    b.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    g.add(b);
  }
  return g;
}

const EXTRA = {
  garlic() {
    const g = new THREE.Group();
    const skin = soft('#f3ece0', 0.6);
    // bulb: a lathe with soft lobes (cloves) and a pointed top
    const prof = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const y = t * 22;
      const r = 13 * Math.sin(Math.PI * Math.min(1, t * 1.08)) ** 0.8 * (1 - 0.55 * smoothstepLocal(0.6, 1, t)) + (t > 0.95 ? 0.6 : 0);
      prof.push(new THREE.Vector2(Math.max(0.3, r), y));
    }
    const bulbGeo = new THREE.LatheGeometry(prof, 64);
    const pos = bulbGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const a = Math.atan2(z, x);
      const k = 1 + 0.06 * Math.abs(Math.sin(a * 4));
      pos.setXYZ(i, x * k, pos.getY(i), z * k);
    }
    bulbGeo.computeVertexNormals();
    const bulb = new THREE.Mesh(bulbGeo, skin);
    bulb.position.set(-6, 0, 0);
    g.add(bulb);
    // two peeled cloves
    for (const [x, z, ry] of [[12, 6, 0.4], [14, -6, -0.8]]) {
      const c = new THREE.Mesh(lumpy(new THREE.SphereGeometry(4.5, 32, 20), 0.03, 2, x), soft('#f7f0d8', 0.45));
      c.scale.set(1.5, 0.9, 0.95);
      c.position.set(x, 4, z);
      c.rotation.y = ry;
      g.add(c);
    }
    return g;
  },
  oliveoil() {
    // a small dish of golden-green oil with two olives beside it
    const g = bowlOf('#a99a1f', ['#bfae2c'], { roughness: 0.04, count: 0 });
    g.children[1].scale.y = 0.08;
    g.children[1].position.y = 10.4;
    const olive = glossy('#6f7d22', 0.25, 0.8);
    for (const [x, z] of [[25, 6], [22, -5]]) {
      const o = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 20), olive);
      o.scale.set(1.35, 1, 1);
      o.position.set(x, 4, z);
      g.add(o);
    }
    const l = leaf(16, 5, glossy('#5b6e45', 0.6, 0.2), 0.003);
    l.rotation.set(-Math.PI / 2, 0, -1.2);
    l.position.set(22, 1, 12);
    g.add(l);
    return g;
  },
  chilli() {
    const g = new THREE.Group();
    const red = glossy('#c8161a', 0.22, 0.8);
    const green = glossy('#3e6b2c', 0.5, 0.2);
    for (const [x, z, ry, L] of [[-4, 4, 0.3, 34], [4, -6, -0.5, 28]]) {
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        pts.push(new THREE.Vector3(t * L - L / 2, 3.2 + 2.5 * Math.sin(t * Math.PI) * 0.6, 3 * Math.sin(t * 2.2)));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 80, 3.4, 20, false);
      // taper towards the tip
      const pp = geo.attributes.position;
      const c = new THREE.Vector3();
      const v = new THREE.Vector3();
      for (let i = 0; i <= 80; i++) {
        curve.getPointAt(i / 80, c);
        const t = i / 80;
        const f = Math.max(0.08, 1 - t ** 1.6) * (0.75 + 0.25 * Math.min(1, t * 6));
        for (let j = 0; j <= 20; j++) {
          v.fromBufferAttribute(pp, i * 21 + j).sub(c).multiplyScalar(f).add(c);
          pp.setXYZ(i * 21 + j, v.x, v.y, v.z);
        }
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, red);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.4, 2.5, 16), green);
      cap.rotation.z = Math.PI / 2;
      cap.position.copy(pts[0]).add(new THREE.Vector3(-0.8, 0, 0));
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 6, 10), green);
      stem.rotation.z = Math.PI / 2 - 0.3;
      stem.position.copy(pts[0]).add(new THREE.Vector3(-4.5, 1, 0));
      const one = new THREE.Group();
      one.add(m, cap, stem);
      one.position.set(x, 0, z);
      one.rotation.y = ry;
      g.add(one);
    }
    return g;
  },
  parsley() {
    const g = new THREE.Group();
    const m = glossy('#3f8a2f', 0.45, 0.3);
    const spots = [[-8, 6, 0.4], [6, 8, -0.6], [0, -6, 1.8], [10, -4, -1.6], [-10, -6, 2.6]];
    spots.forEach(([x, z, rz], i) => {
      // a flat-leaf parsley leaf: three toothed lobes
      for (const [ang, len, w] of [[0, 11, 9], [0.95, 9, 7.5], [-0.95, 9, 7.5]]) {
        const l = leaf(len, w, m, 0.004);
        l.rotation.set(-Math.PI / 2 + 0.05, 0, rz + ang);
        l.position.set(x, 2 + i * 0.3, z);
        g.add(l);
      }
      // the thin stem of each sprig
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 12, 8), m);
      st.rotation.set(Math.PI / 2, 0, 0);
      st.rotation.z = 0;
      st.position.set(x - Math.sin(rz) * 6, 1.6, z + Math.cos(rz) * 6);
      st.rotation.y = -rz;
      g.add(st);
    });
    return g;
  },
  clams() {
    const g = new THREE.Group();
    const shell = soft('#ddd0bb', 0.5);
    const band = soft('#a88e6e', 0.5);
    let n = 0;
    for (const [x, z, ry, k] of [[-9, 5, 0.3, 1], [9, 4, -0.7, 0.92], [0, -9, 1.6, 1.05], [12, -10, 2.4, 0.85]]) {
      // a closed clam: two ridged shell halves meeting at the rim
      const geo = new THREE.SphereGeometry(8, 64, 32);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x0 = pos.getX(i);
        const y0 = pos.getY(i);
        const z0 = pos.getZ(i);
        const d = Math.hypot(x0, z0 + 3) / 11; // distance from the hinge
        const ring = 1 + 0.025 * Math.cos(d * 60);
        // rounded-triangular outline, flatter shells
        const tri = 1 - 0.18 * Math.max(0, -z0 / 8) ** 2;
        pos.setXYZ(i, x0 * 1.18 * ring * tri, y0 * 0.42 * ring, z0 * ring);
      }
      geo.computeVertexNormals();
      const c = new THREE.Mesh(geo, n++ % 2 ? band : shell);
      c.scale.setScalar(k);
      c.position.set(x, 3.4 * k, z);
      c.rotation.set(0.15 * (n % 3), ry, 0.1);
      g.add(c);
    }
    return g;
  },
  aubergine() {
    const g = new THREE.Group();
    const skin = glossy('#3b1f45', 0.18, 0.9);
    const body = new THREE.Mesh(lumpy(new THREE.SphereGeometry(9, 48, 32), 0.015, 2, 4), skin);
    body.scale.set(2.1, 0.95, 1);
    body.position.set(-4, 8.5, 2);
    body.rotation.z = 0.08;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(5.5, 7, 6, 1, true), glossy('#4e6b2c', 0.5, 0.2));
    cap.material.side = THREE.DoubleSide;
    cap.rotation.z = Math.PI / 2;
    cap.position.set(-4 - 9 * 2.1 + 2, 9, 2);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 6, 10), glossy('#4e6b2c', 0.5, 0.2));
    stem.rotation.z = Math.PI / 2;
    stem.position.set(-4 - 9 * 2.1 - 3, 9.3, 2);
    g.add(body, cap, stem);
    // a few fried cubes
    const fried = soft('#c99a52', 0.55);
    const peel = glossy('#3b1f45', 0.3, 0.5);
    for (const [x, z, ry] of [[14, 10, 0.3], [20, -2, -0.4], [9, -9, 0.9]]) {
      const c = new THREE.Mesh(new RoundedBoxGeometry(7, 6, 7, 3, 1.4), fried);
      c.position.set(x, 3, z);
      c.rotation.y = ry;
      const pz = new THREE.Mesh(new RoundedBoxGeometry(7.1, 1.2, 7.1, 2, 0.5), peel);
      pz.position.set(0, -2.6, 0);
      c.add(pz);
      g.add(c);
    }
    return g;
  },
  ricottasalata() {
    const g = new THREE.Group();
    const w = wedge(30, 15, 0.7, makeMaterial('#f8f5ec', 'raw', 1 / 6));
    w.position.set(-10, 0, 4);
    w.rotation.z = 0.2;
    g.add(w);
    return g;
  },
  cimedirapa() {
    const g = new THREE.Group();
    const leafM = glossy('#2f6a2a', 0.45, 0.3);
    for (const [x, z, rz, L, W] of [[-8, 4, 0.6, 30, 14], [6, 6, -0.7, 26, 12], [0, -4, 2.2, 28, 13]]) {
      const l = leaf(L, W, leafM, 0.006);
      l.rotation.set(-Math.PI / 2 + 0.06, 0, rz);
      l.position.set(x, 2, z);
      g.add(l);
    }
    // the little buds (florets) that make them unmistakable
    const bud = glossy('#5f8a35', 0.6, 0.2);
    const yellow = glossy('#e3c43a', 0.5, 0.2);
    let n = 0;
    for (const [x, z] of [[2, 4], [-3, -1], [8, -2]]) {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU;
        const b = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), n++ % 7 === 0 ? yellow : bud);
        b.position.set(x + Math.cos(a) * 2.2 * (i % 2 ? 1 : 0.5), 6 + (i % 3) * 0.6, z + Math.sin(a) * 2.2 * (i % 2 ? 1 : 0.5));
        g.add(b);
      }
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 5, 8), bud);
      st.position.set(x, 3.5, z);
      g.add(st);
    }
    return g;
  },
  anchovy() {
    const g = new THREE.Group();
    const flesh = glossy('#8a4a38', 0.3, 0.7);
    const silver = glossy('#b9b4ad', 0.2, 0.9);
    for (const [x, z, ry] of [[-4, 4, 0.2], [4, -4, 0.5], [0, -12, 0.35]]) {
      const geo = new THREE.SphereGeometry(4, 40, 20);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const t = px / 4; // -1..1
        const taper = 1 - 0.6 * Math.max(0, t) ** 2;
        pos.setXYZ(i, px * 4.2, pos.getY(i) * 0.3, pos.getZ(i) * 0.95 * taper);
      }
      geo.computeVertexNormals();
      const f = new THREE.Mesh(geo, flesh);
      f.position.set(x, 1.4, z);
      f.rotation.y = ry;
      const strip = new THREE.Mesh(geo.clone().scale(0.98, 0.5, 0.35), silver);
      strip.position.set(x, 2.1, z);
      strip.rotation.y = ry;
      g.add(f, strip);
    }
    return g;
  },
  breadcrumbs() {
    return pile(['#c58d3e', '#d9a656', '#b37a33', '#e2b86c'], 260, 1.1, 15);
  },
  pesto() {
    return bowlOf('#4f7d2a', ['#3d6b20', '#6d9a3a', '#e9dfb0'], { roughness: 0.4, count: 140, size: 0.45, seed0: 21 });
  },
};

const smoothstepLocal = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
Object.assign(BUILD, EXTRA);

export const INGREDIENT_IDS = Object.keys(BUILD);
export function buildIngredient(id) {
  return (BUILD[id] || BUILD.tomato)();
}
