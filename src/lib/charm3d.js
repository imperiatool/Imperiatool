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
            pieces.push({ item: index, level, isFirstItem: index === 0, color: fill, shapes: [] });
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

    const baseDepth = piece.isFirstItem && piece.level === 0 ? 110 : piece.level === 0 ? 40 : 18;
    const depth = baseDepth * shapeHints.depth;
    // the rounded edge never takes more than 80% of the thickness, so the
    // real height of the piece is exactly `depth` (outlines sit on it, not above)
    const bt = Math.max(0.6, Math.min(Math.min(depth * 0.42, piece.level === 0 ? 26 : 10) * shapeHints.bevel, depth * 0.4));
    // a wide inward bevel self-intersects on tight waves (raviolo edges)
    const bs = Math.max(0.4, Math.min(bt * 0.9, minDim * 0.07, 9));

    let z0 = 0;
    for (const p of placed) if (p.box.intersectsBox(box)) z0 = Math.max(z0, p.top - 2);

    let geometry = new THREE.ExtrudeGeometry(shapes, {
      depth: Math.max(1, depth - bt * 2),
      bevelEnabled: true,
      bevelThickness: bt,
      bevelSize: bs,
      bevelOffset: -bs,
      bevelSegments: materialId === 'overcooked' ? 10 : 7,
      curveSegments: 1, // already sampled by length
    });
    geometry = smoothGeometry(geometry);
    // ExtrudeGeometry groups: 0 = front/back faces, 1 = sides incl. the bevel
    const material = piece.sideColor
      ? [makeMaterial(piece.color, materialId, UV_REPEAT), makeMaterial(piece.sideColor, materialId, UV_REPEAT)]
      : makeMaterial(piece.color, materialId, UV_REPEAT);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z0 + bt;
    root.add(mesh);
    const top = z0 + Math.max(1, depth - bt * 2) + bt * 2;
    piece.bevel = bt;
    piece.bevelSize = bs;
    piece.polys = shapes.map((sh) => ({ outer: sh.getPoints(), holes: sh.holes.map((h) => h.getPoints()) }));
    piece.contours = piece.polys.flatMap((q) => [q.outer, ...q.holes]);
    piece.top = top;
    placed.push({ box, top });
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
    wrapper.add(buildAttachment(attachment, top, mm));
  }
  return wrapper;
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
  // about 45% of the width: readable but discreet, like on Imperia products
  const w = Math.min(size.x, size.y * 1.6) * 0.45;
  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(w, (w * 388) / 1800),
    new THREE.MeshPhysicalMaterial({ map: logoTexture, transparent: true, alphaTest: 0.05, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -2 }),
  );
  decal.rotation.y = Math.PI; // faces the back
  decal.position.set((box.min.x + box.max.x) / 2, box.min.y + size.y * 0.45, box.min.z - 0.4);
  decal.userData.keepTexture = true;
  decal.userData.noShadow = true;
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
export function buildAttachment(id, top, mm) {
  const g = new THREE.Group();
  const v = (x, y, z = 0) => new THREE.Vector3(top.x + x * mm, top.y + y * mm, top.z + z * mm);

  // jump ring, perpendicular to the charm, half inside the top edge
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8 * mm, 0.5 * mm, 12, 48), metal());
  ring.rotation.y = Math.PI / 2;
  ring.position.copy(v(0, 0.9));
  g.add(ring);
  const y0 = 0.9 + 2.8; // top of the jump ring (mm above the charm)

  if (id === 'keyring') {
    const R = 11;
    for (const k of [-1, 1]) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(R * mm, 0.75 * mm, 14, 96), metal());
      coil.position.copy(v(0, y0 + R - 0.9, k * 0.8));
      coil.rotation.x = k * 0.03;
      g.add(coil);
    }
  } else if (id === 'chain') {
    const loop = [v(0, y0 - 0.6), v(-5, y0 + 6), v(-8, y0 + 20), v(-5, y0 + 33), v(0, y0 + 36), v(5, y0 + 33), v(8, y0 + 20), v(5, y0 + 6)];
    const curve = new THREE.CatmullRomCurve3(loop, true, 'centripetal');
    const n = Math.round(curve.getLength() / (2.5 * mm));
    const ballGeo = new THREE.SphereGeometry(1.05 * mm, 14, 10);
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
    const clasp = new THREE.Mesh(new THREE.TorusGeometry(2.4 * mm, 0.85 * mm, 14, 40), metal());
    clasp.scale.set(1, 1.75, 1);
    clasp.position.copy(v(0, y0 + 3.6));
    g.add(clasp);
    const lever = new THREE.Mesh(new THREE.CapsuleGeometry(0.45 * mm, 3.4 * mm, 6, 12), metal());
    lever.position.copy(v(1.9, y0 + 3.2));
    lever.rotation.z = 0.25;
    g.add(lever);
    const eye = new THREE.Mesh(new THREE.TorusGeometry(1.3 * mm, 0.45 * mm, 10, 28), metal());
    eye.rotation.y = Math.PI / 2;
    eye.position.copy(v(0, y0 + 9));
    g.add(eye);
    // crimp end + soft cord loop
    const crimp = new THREE.Mesh(new THREE.CylinderGeometry(1.25 * mm, 1.25 * mm, 4.2 * mm, 20), metal());
    crimp.position.copy(v(0, y0 + 12.4));
    g.add(crimp);
    const cordMat = new THREE.MeshPhysicalMaterial({ color: CORD, roughness: 0.85, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color('#c79a8f') });
    const c0 = y0 + 14;
    g.add(tubeAlong([v(-0.6, c0), v(-5, c0 + 8), v(-6.5, c0 + 22), v(-3, c0 + 34), v(0, c0 + 36), v(3, c0 + 34), v(6.5, c0 + 22), v(5, c0 + 8), v(0.6, c0)], 1 * mm, cordMat));
  }
  return g;
}
