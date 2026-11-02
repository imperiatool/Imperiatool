// 3D charm: every layer of the 2D composition is extruded from its SVG shapes
// and stacked in depth; strokes become rounded "piping" so outlines and inner
// lines (lips, shells…) stay visible in 3D.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { renderAssetMarkup } from './svgParser.js';
import { itemTransform } from './geometry.js';
import { makeMaterial, MATERIAL_SHAPE } from './three/materials.js';
import { resampleShape, samplePath, smoothGeometry } from './three/geometry.js';
import logoUrl from '../assets/imperia-logo.svg?url';

// canvas units per mm: a 1000-unit body ≈ 40 mm charm → grain tile of ~8 mm
const UV_REPEAT = 1 / 200;
// Eyes and mouths: one subtle relief for every eye, every mouth, every body and
// every finish (the thinnest thickness of the approved charms). Pupils are flat.
export const FEATURE_DEPTH = 18;
const FEATURE_CATS = new Set(['cat-occhi', 'cat-bocche']);

function itemScale(item) {
  return item.scale * (Math.abs(item.stretchX) + Math.abs(item.stretchY)) / 2;
}

/**
 * @returns THREE.Group in SVG units (y is flipped so the charm stands upright)
 */
export function buildCharm(items, assetsById, materialId = 'aldente', { attachment = null, sizeMm = 40 } = {}) {
  const shapeHints = MATERIAL_SHAPE[materialId] || MATERIAL_SHAPE.aldente;
  const visible = items.filter((it) => !it.hidden && assetsById[it.assetId]);
  const root = new THREE.Group();
  if (!visible.length) return root;

  const loader = new SVGLoader();
  const pieces = [];
  const strokes = [];

  visible.forEach((item, index) => {
    const asset = assetsById[item.assetId];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><g transform="${itemTransform(item)}"><g transform="translate(${-asset.width / 2} ${-asset.height / 2})">${renderAssetMarkup(asset, item.colors, `c${index}`, item.strokeScale)}</g></g></svg>`;
    let data;
    try {
      data = loader.parse(svg);
    } catch {
      return;
    }
    const scale = itemScale(item);
    // consecutive paths with the same fill = one piece (both eye whites);
    // a new fill = a new raised piece (the pupils on top)
    let level = -1;
    let prevFill = null;
    for (const path of data.paths) {
      const style = path.userData?.style || {};
      const fill = style.fill;
      let pieceIndex = null;
      if (fill && fill !== 'none' && style.fillOpacity !== 0) {
        const raw = SVGLoader.createShapes(path);
        if (raw.length) {
          if (fill !== prevFill) {
            level += 1;
            pieces.push({ item: index, level, isFirstItem: index === 0, cat: asset.categoryId, color: fill, shapes: [] });
            prevFill = fill;
          }
          pieces[pieces.length - 1].shapes.push(...raw);
          pieceIndex = pieces.length - 1;
        }
      }
      if (style.stroke && style.stroke !== 'none' && (style.strokeWidth ?? 1) > 0 && style.strokeOpacity !== 0) {
        strokes.push({ item: index, path, color: style.stroke, width: (style.strokeWidth ?? 1) * scale, pieceIndex });
        // the outline colour wraps the whole extrusion: sides + rounded edge
        if (pieceIndex != null && !pieces[pieceIndex].sideColor) pieces[pieceIndex].sideColor = style.stroke;
      }
    }
  });

  /* ---- extruded pieces ------------------------------------------------- */
  const placed = [];
  const itemTop = new Map();
  for (const piece of pieces) {
    const box = new THREE.Box2();
    piece.shapes.forEach((s) => s.getPoints(6).forEach((p) => box.expandByPoint(p)));
    const size = box.getSize(new THREE.Vector2());
    const minDim = Math.max(1, Math.min(size.x, size.y));
    const step = Math.max(1.2, Math.min(size.x, size.y) / 140);
    const shapes = piece.shapes.map((s) => resampleShape(s, step)).filter((s) => s.getPoints().length > 2);
    if (!shapes.length) continue;

    const isBody = piece.isFirstItem && piece.level === 0;
    const isFeature = !isBody && FEATURE_CATS.has(piece.cat);
    // pupils (the second colour of an eye) are printed flat on the eye
    const flat = isFeature && piece.cat === 'cat-occhi' && piece.level > 0;
    const baseDepth = isBody ? 110 : piece.level === 0 ? 40 : 18;
    const depth = isFeature ? FEATURE_DEPTH : baseDepth * shapeHints.depth;
    // the rounded edge never takes more than 80% of the thickness, so the
    // real height of the piece is exactly `depth` (outlines sit on it, not above)
    const bt = Math.max(0.6, Math.min(Math.min(depth * 0.42, piece.level === 0 ? 26 : 10) * shapeHints.bevel, depth * 0.4));
    
    // RIPRISTINATO E STABILIZZATO: bevelSize controllato e bevelOffset a 0 per evitare i buchi e le auto-intersezioni
    const bs = Math.max(0.2, Math.min(bt * 0.5, minDim * 0.05, 4));

    // rests on what is really underneath it (not on everything its bounding box
    // touches): a mouth below the eyes sits on the body, not on the eyes
    const polys = shapes.map((sh) => ({ outer: sh.getPoints(), holes: sh.holes.map((h) => h.getPoints()) }));
    const samples = polySamples(polys);
    let z0 = 0;
    for (const p of placed) if (p.box.intersectsBox(box) && overlaps(samples, polys, p)) z0 = Math.max(z0, p.top - (flat ? 0 : 2));

    if (flat) {
      // a flat print on the surface below (no thickness, no bevel)
      const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shapes), makeMaterial(piece.color, materialId, UV_REPEAT));
      mesh.material.polygonOffset = true;
      mesh.material.polygonOffsetFactor = -2;
      mesh.material.polygonOffsetUnits = -2;
      mesh.position.z = z0 + 0.15;
      mesh.userData.flat = true;
      root.add(mesh);
      const top = z0 + 0.15;
      Object.assign(piece, { bevel: 0, bevelSize: 0, top, polys });
      piece.contours = piece.polys.flatMap((q) => [q.outer, ...q.holes]);
      placed.push({ box, top, polys: piece.polys, samples });
      itemTop.set(piece.item, Math.max(itemTop.get(piece.item) ?? 0, top));
      continue;
    }

    let geometry = new THREE.ExtrudeGeometry(shapes, {
      depth: Math.max(1, depth - bt * 2),
      bevelEnabled: true,
      bevelThickness: bt,
      bevelSize: bs,
      bevelOffset: 0, // Azzerato per prevenire la generazione di fori e distacchi sui vertici interni
      bevelSegments: materialId === 'overcooked' ? 8 : 6,
      curveSegments: 1, // already sampled by length
    });
    geometry = smoothGeometry(geometry);
    // ExtrudeGeometry groups: 0 = front/back faces, 1 = sides incl. the bevel
    const material = piece.sideColor
      ? [makeMaterial(piece.color, materialId, UV_REPEAT), makeMaterial(piece.sideColor, materialId, UV_REPEAT)]
      : makeMaterial(piece.color, materialId, UV_REPEAT);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z0 + bt;
    mesh.userData.body = isBody;
    mesh.userData.feature = isFeature;
    root.add(mesh);
    const top = z0 + Math.max(1, depth - bt * 2) + bt * 2;
    piece.bevel = bt;
    piece.bevelSize = bs;
    piece.polys = polys;
    piece.contours = piece.polys.flatMap((q) => [q.outer, ...q.holes]);
    piece.top = top;
    placed.push({ box, top, polys: piece.polys, samples });
    itemTop.set(piece.item, Math.max(itemTop.get(piece.item) ?? 0, top));
  }

  /* ---- strokes → rounded piping ---------------------------------------- */
  for (const s of strokes) {
    const r = Math.max(s.width * 0.6, 3.2);
    for (const sub of s.path.subPaths) {
      const pts = samplePath(sub, Math.max(2, r * 0.8));
      if (pts.length < 2) continue;
      const first = sub.getPoint(0);
      const lastP = sub.getPoint(1);
      const closed = sub.autoClose || first.distanceTo(lastP) < 0.5;
      // the outline of a filled shape sits on that shape; inner lines (shell,
      // gnocchi…) go on top of the whole element so a thick, puffy finish
      // (overcooked) never swallows them
      const own = closed && s.pieceIndex != null;
      const base = own ? pieces[s.pieceIndex].top : Math.max(itemTop.get(s.item) ?? 0, s.pieceIndex != null ? pieces[s.pieceIndex].top : 0);
      // lines follow the real surface: lower on the rounded edge, on top elsewhere
      // (an outline hugs the shoulder; an inner line such as the lips stays visible)
      const piece = s.pieceIndex != null ? pieces[s.pieceIndex] : null;
      const zAt = (p) => {
        if (!own || !piece?.contours) return base + r * 0.1;
        // only the outer edge of the whole piece is rounded: a line lying on
        // another shape of the same piece (lips) stays on top
        const off = Math.max(1, piece.bevelSize * 0.9);
        const onEdge = [[off, 0], [-off, 0], [0, off], [0, -off], [off * 0.7, off * 0.7], [-off * 0.7, -off * 0.7], [off * 0.7, -off * 0.7], [-off * 0.7, off * 0.7]].some(
          ([dx, dy]) => !insidePolys({ x: p.x + dx, y: p.y + dy }, piece.polys),
        );
        if (!onEdge) return base - r * 0.3;
        const d = distToContours(p, piece.contours);
        const k = Math.min(1, d / Math.max(0.5, piece.bevelSize));
        const h = base - piece.bevel * (1 - Math.sqrt(Math.max(0, 1 - (1 - k) ** 2)));
        return h - r * 0.3;
      };
      const z = zAt(pts[0]);
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p.x, p.y, zAt(p))), closed, 'centripetal');
      const segments = Math.min(2400, Math.max(16, Math.round(curve.getLength() / (r * 0.7))));
      const tube = new THREE.TubeGeometry(curve, segments, r, 10, closed);
      const mesh = new THREE.Mesh(tube, makeMaterial(s.color, materialId, UV_REPEAT));
      root.add(mesh);
      // rounded ends for open lines
      if (!closed) {
        for (const p of [pts[0], pts[pts.length - 1]]) {
          const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), makeMaterial(s.color, materialId, UV_REPEAT));
          cap.position.set(p.x, p.y, z);
          root.add(cap);
        }
      }
    }
  }

  // SVG is y-down: flip so the charm stands upright
  root.scale.set(1, -1, 1);
  const wrapper = new THREE.Group();
  wrapper.add(root);
  // Imperia logo printed on the back, centred on the body
  addBackLogo(wrapper);
  if (attachment && attachment !== 'none') {
    const box = new THREE.Box3().setFromObject(wrapper);
    const size = box.getSize(new THREE.Vector3());
    const mm = Math.max(size.x, size.y) / sizeMm; // SVG units per millimetre
    // hang point: top of the body, in the middle of its thickness
    const top = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2);
    wrapper.add(buildAttachment(attachment, top, mm, { wMm: size.x / mm, hMm: size.y / mm }));
  }
  return wrapper;
}

/** Points inside the shapes (their outline only for very thin ones), to test real overlaps between pieces. */
function polySamples(polys) {
  const out = [];
  for (const { outer, holes } of polys) {
    const b = new THREE.Box2().setFromPoints(outer);
    const n = 16;
    const before = out.length;
    for (let i = 1; i < n; i++)
      for (let j = 1; j < n; j++) {
        const p = { x: b.min.x + ((b.max.x - b.min.x) * i) / n, y: b.min.y + ((b.max.y - b.min.y) * j) / n };
        if (inPoly(p, outer) && !holes.some((h) => inPoly(p, h))) out.push(p);
      }
    if (out.length === before) out.push(...outer);
  }
  return out;
}
/** Do two pieces really overlap (a point of one inside the other, either way)? */
function overlaps(samples, polys, placed) {
  return samples.some((p) => insidePolys(p, placed.polys)) || placed.samples.some((p) => insidePolys(p, polys));
}

function inPoly(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
function insidePolys(p, polys) {
  return polys.some((q) => inPoly(p, q.outer) && !q.holes.some((h) => inPoly(p, h)));
}

function distToContours(p, contours) {
  let best = Infinity;
  for (const c of contours) {
    for (let i = 0, n = c.length; i < n; i++) {
      const a = c[i];
      const b = c[(i + 1) % n];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l2 = dx * dx + dy * dy || 1;
      const u = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
      const ex = a.x + u * dx - p.x;
      const ey = a.y + u * dy - p.y;
      const d2 = ex * ex + ey * ey;
      if (d2 < best) best = d2;
    }
  }
  return Math.sqrt(best);
}

/* ---- back logo ---------------------------------------------------------- */
let logoTexture = null;
function addBackLogo(wrapper) {
  const box = new THREE.Box3().setFromObject(wrapper);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  if (!logoTexture) {
    logoTexture = new THREE.TextureLoader().load(logoUrl);
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    logoTexture.anisotropy = 8;
  }
  // the body alone tells whether the pasta is a long, upright shape (Reginetta)
  const bodyBox = new THREE.Box3();
  wrapper.traverse((o) => o.isMesh && o.userData.body && bodyBox.expandByObject(o));
  const body = bodyBox.isEmpty() ? size : bodyBox.getSize(new THREE.Vector3());
  const long = body.y > body.x * 1.6;
  const ratio = 388 / 1800; // logo height / width
  // about 45% of the width: readable but discreet, like on Imperia products;
  // on a long body it turns 90° and runs along the length, same proportions
  const w = long ? Math.min(body.y * 0.5, (body.x * 0.62) / ratio) : Math.min(size.x, size.y * 1.6) * 0.45;
  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w * ratio),
    new THREE.MeshPhysicalMaterial({ map: logoTexture, transparent: true, alphaTest: 0.05, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -2 }),
  );
  decal.rotation.y = Math.PI; // faces the back
  if (long) decal.rotation.z = Math.PI / 2; // reads bottom to top along the pasta
  const c = long ? bodyBox.getCenter(new THREE.Vector3()) : null;
  if (long) decal.position.set(c.x, c.y, box.min.z - 0.4);
  else decal.position.set((box.min.x + box.max.x) / 2, box.min.y + size.y * 0.45, box.min.z - 0.4);
  decal.userData.keepTexture = true;
  decal.userData.noShadow = true;
  decal.userData.logo = { long };
  wrapper.add(decal);
}

/* ---- attachments ------------------------------------------------------- */
const metal = () => new THREE.MeshPhysicalMaterial({ color: '#dcdcda', metalness: 1, roughness: 0.26 });
const CORD = '#6a3933'; // ragù brown cord (no black)

function tubeAlong(points, radius, material, closed = true) {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 160, radius, 12, closed), material);
}

/**
 * Minimal hardware: every option starts with a jump ring through the charm.
 *   strap   – lobster clasp + soft cord loop (phone / bag strap)
 *   keyring – split key ring
 *   chain   – ball chain loop
 */
export function buildAttachment(id, top, mm, { wMm = 40, hMm = 40 } = {}) {
  const g = new THREE.Group();
  // in proportion with the charm: real-size hardware, slightly smaller on slim
  // shapes; loops no longer than the charm itself, so they never dominate it
  const long = Math.max(wMm, hMm);
  const k = Math.max(0.75, Math.min(1, Math.sqrt(Math.min(wMm, hMm) / long) * 1.2));
  const u = mm * k; // one (scaled) millimetre of hardware
  const v = (x, y, z = 0) => new THREE.Vector3(top.x + x * u, top.y + y * u, top.z + z * u);

  // jump ring, perpendicular to the charm, half inside the top edge
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8 * u, 0.5 * u, 12, 48), metal());
  ring.rotation.y = Math.PI / 2;
  ring.position.copy(v(0, 0.9));
  g.add(ring);
  const y0 = 0.9 + 2.8; // top of the jump ring (mm above the charm)

  if (id === 'keyring') {
    // split ring: about a quarter of the charm's length across (7 to 11 mm radius)
    const R = Math.max(7, Math.min(11, long * 0.24)) / k;
    for (const s of [-1, 1]) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(R * u, 0.75 * u, 14, 96), metal());
      coil.position.copy(v(0, y0 + R - 0.9, s * 0.8));
      coil.rotation.x = s * 0.03;
      g.add(coil);
    }
  } else if (id === 'chain') {
    // ball chain loop: as tall as most of the charm (18 to 28 mm)
    const L = Math.max(18, Math.min(28, hMm * 0.7)) / k;
    const W = L * 0.22;
    const loop = [v(0, y0 - 0.6), v(-W * 0.62, y0 + L * 0.17), v(-W, y0 + L * 0.55), v(-W * 0.62, y0 + L * 0.92), v(0, y0 + L), v(W * 0.62, y0 + L * 0.92), v(W, y0 + L * 0.55), v(W * 0.62, y0 + L * 0.17)];
    const curve = new THREE.CatmullRomCurve3(loop, true, 'centripetal');
    const n = Math.round(curve.getLength() / (2.5 * u));
    const ballGeo = new THREE.SphereGeometry(1.05 * u, 14, 10);
    const mat = metal();
    for (let i = 0; i < n; i++) {
      const b = new THREE.Mesh(ballGeo.clone(), mat.clone());
      b.position.copy(curve.getPointAt(i / n));
      g.add(b);
    }
    ballGeo.dispose();
    mat.dispose();
  } else {
    // lobster clasp hanging from the jump ring
    const clasp = new THREE.Mesh(new THREE.TorusGeometry(2.4 * u, 0.85 * u, 14, 40), metal());
    clasp.scale.set(1, 1.75, 1);
    clasp.position.copy(v(0, y0 + 3.6));
    g.add(clasp);
    const lever = new THREE.Mesh(new THREE.CapsuleGeometry(0.45 * u, 3.4 * u, 6, 12), metal());
    lever.position.copy(v(1.9, y0 + 3.2));
    lever.rotation.z = 0.25;
    g.add(lever);
    const eye = new THREE.Mesh(new THREE.TorusGeometry(1.3 * u, 0.45 * u, 10, 28), metal());
    eye.rotation.y = Math.PI / 2;
    eye.position.copy(v(0, y0 + 9));
    g.add(eye);
    // crimp end + soft cord loop (as tall as most of the charm: 18 to 28 mm)
    const crimp = new THREE.Mesh(new THREE.CylinderGeometry(1.25 * u, 1.25 * u, 4.2 * u, 20), metal());
    crimp.position.copy(v(0, y0 + 12.4));
    g.add(crimp);
    const cordMat = new THREE.MeshPhysicalMaterial({ color: CORD, roughness: 0.85, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color('#c79a8f') });
    const c0 = y0 + 14;
    const L = Math.max(18, Math.min(28, hMm * 0.7)) / k;
    const W = L * 0.18;
    g.add(tubeAlong([v(-0.6, c0), v(-W * 0.77, c0 + L * 0.22), v(-W, c0 + L * 0.61), v(-W * 0.46, c0 + L * 0.94), v(0, c0 + L), v(W * 0.46, c0 + L * 0.94), v(W, c0 + L * 0.61), v(W * 0.77, c0 + L * 0.22), v(0.6, c0)], 1 * u, cordMat));
  }
  return g;
}
