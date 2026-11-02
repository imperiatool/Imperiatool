// 3D charm: every layer of the 2D composition is extruded from its SVG shapes
// and stacked in depth; strokes become rounded "piping" so outlines and inner
// lines (lips, shells…) stay visible in 3D.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { renderAssetMarkup } from './svgParser.js';
import { itemTransform } from './geometry.js';
import { makeMaterial, MATERIAL_SHAPE } from './three/materials.js';
import { resampleShape, samplePath, smoothGeometry } from './three/geometry.js';
import polygonClipping from 'polygon-clipping';
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
        if (pieceIndex != null) {
          const pc = pieces[pieceIndex];
          // details on top (pupils…) keep their own colour all round: only the
          // element's silhouette gets the outline colour on its edge
          if (!pc.sideColor && pc.level === 0) pc.sideColor = style.stroke;
          pc.strokeWidth = Math.max(pc.strokeWidth || 0, (style.strokeWidth ?? 1) * scale);
        }
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
    const resampled = piece.shapes.map((s) => resampleShape(s, step)).filter((s) => s.getPoints().length > 2);
    if (!resampled.length) continue;

    const baseDepth = piece.isFirstItem && piece.level === 0 ? 110 : piece.level === 0 ? 40 : 18;
    const depth = baseDepth * shapeHints.depth;
    // the rounded edge never takes more than 80% of the thickness, so the
    // real height of the piece is exactly `depth` (outlines sit on it, not above)
    const bt = Math.max(0.6, Math.min(Math.min(depth * 0.42, piece.level === 0 ? 26 : 10) * shapeHints.bevel, depth * 0.4));
    // rounded edge width: with an outline it IS the outline (same colour as
    // the sides), as wide as the drawn stroke; never wide enough to fold over
    // how thick the shape really is (≈ inradius = 2·area / perimeter): a
    // rounded edge wider than a fraction of it folds the top face inside out
    // (small crimped pupils came out as a coloured ring with no top)
    let area = 0;
    let perim = 0;
    for (const sh of resampled) {
      const pts = sh.getPoints();
      area += Math.abs(THREE.ShapeUtils.area(pts));
      for (let i = 0; i < pts.length; i++) perim += pts[i].distanceTo(pts[(i + 1) % pts.length]);
    }
    const inradius = perim ? (2 * area) / perim : minDim / 2;
    let bs = piece.sideColor
      ? Math.max(1.2, Math.min(Math.max((piece.strokeWidth || 3) * 1.15, minDim > 60 ? 3 : 1.2), bt * 1.2, minDim * 0.08, 12))
      : Math.max(0.4, Math.min(bt * 0.9, minDim * 0.07, 9));
    bs = Math.max(0.3, Math.min(bs, inradius * 0.22));
    // sharp tips are softly rounded (radius ≈ the rounded edge) so the edge
    // never pokes out like spilled rubber; details on top (pupils) are smoothed
    // a little more, so their small crimps can't fold under the rounded edge
    const shapes = resampled.map((s) => roundCorners(s, Math.max(piece.level > 0 ? bs * 2.4 : bs, 1.5), step, piece.level > 0));

    // what lies underneath: only pieces this one really overlaps (a bounding
    // box is not enough: the mouth used to stack on the eyes, whose box spans
    // the face, and floated in front of the body). Parts that hang past the
    // pieces underneath (eyes sticking out of the head) go down to the back,
    // so nothing floats in the air from the side
    const polys = shapes.map((sh) => ({ outer: sh.getPoints(), holes: sh.holes.map((h) => h.getPoints()) }));
    const samples = [];
    const N = 36;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const q = new THREE.Vector2(box.min.x + ((i + 0.5) / N) * size.x, box.min.y + ((j + 0.5) / N) * size.y);
        if (insidePolys(q, polys)) samples.push(q);
      }
    }
    // a piece lying across parts of different heights (a mouth over the body
    // and the bottom of the eyes) reaches down to the lowest one, so it rests
    // on all of them instead of hovering over the lower part
    let z0 = 0;
    let lowest = Infinity;
    let uncovered = 0;
    if (placed.length) {
      for (const q of samples) {
        let under = null;
        for (const p of placed) if (p.box.containsPoint(q) && insidePolys(q, p.polys)) under = Math.max(under ?? 0, p.top - 2);
        if (under == null) uncovered++;
        else {
          z0 = Math.max(z0, under);
          lowest = Math.min(lowest, under);
        }
      }
    }
    // the piece sits on what is under it (down to the lowest part it touches)
    const z1 = !placed.length || lowest === Infinity ? 0 : lowest; // back of the piece
    // part of it hangs past the pieces underneath (eyes sticking out of the
    // head): that part only gets a support from the back of the charm up to
    // the piece, so from the side nothing floats in the air and nothing goes
    // through the body (the support stops exactly at the body's outline)
    const overhang = placed.length && lowest !== Infinity && uncovered > samples.length * 0.02;

    // the rounded edge is an inward offset of the outline: where a corner is
    // tighter than the offset, the flat top folds over itself and vanishes
    // (a hollow pupil). Check the top that came out and, if it lost most of
    // its area, rebuild with a narrower rounded edge
    const shapeArea = shapes.reduce((a, sh) => a + Math.abs(THREE.ShapeUtils.area(sh.getPoints())) - sh.holes.reduce((h, p) => h + Math.abs(THREE.ShapeUtils.area(p.getPoints())), 0), 0);
    const extrude = (b) =>
      new THREE.ExtrudeGeometry(shapes, {
        depth: Math.max(1, z0 - z1 + depth - bt * 2),
        bevelEnabled: true,
        bevelThickness: bt,
        bevelSize: b,
        bevelOffset: -b,
        bevelSegments: materialId === 'overcooked' ? 10 : 7,
        curveSegments: 1, // already sampled by length
      });
    let geometry = extrude(bs);
    for (let tries = 0; tries < 4 && capArea(geometry) < shapeArea * 0.35; tries++) {
      geometry.dispose();
      bs *= 0.55;
      geometry = extrude(bs);
    }
    geometry = smoothGeometry(geometry);
    // ExtrudeGeometry groups: 0 = front/back faces, 1 = sides incl. the bevel
    const material = piece.sideColor
      ? [makeMaterial(piece.color, materialId, UV_REPEAT), makeMaterial(piece.sideColor, materialId, UV_REPEAT)]
      : makeMaterial(piece.color, materialId, UV_REPEAT);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.body = piece.isFirstItem && piece.level === 0;
    mesh.position.z = z1 + bt;
    root.add(mesh);
    if (overhang) {
      const support = supportGeometry(polys, placed.filter((p) => p.box.intersectsBox(box)).map((p) => p.polys), z1 + bt, Math.min(bt, 4));
      if (support) {
        const m = new THREE.Mesh(support, makeMaterial(piece.sideColor || piece.color, materialId, UV_REPEAT));
        m.position.z = 0.3;
        root.add(m);
      }
    }
    const top = z0 + Math.max(1, depth - bt * 2) + bt * 2;
    piece.bevel = bt;
    piece.bevelSize = bs;
    piece.polys = polys;
    piece.contours = piece.polys.flatMap((q) => [q.outer, ...q.holes]);
    piece.edges = outerEdges(piece.polys, piece.contours);
    piece.top = top;
    placed.push({ box, top, polys });
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
      const piece = s.pieceIndex != null ? pieces[s.pieceIndex] : null;
      // outer edges are drawn by the coloured rounded edge itself. A tube is
      // kept only where the line lies well inside a shape of the same element,
      // so it never sticks out past the edge (lips, shell…)
      const hosts = own && piece ? [piece] : pieces.filter((pc) => pc.item === s.item && pc.polys);
      // like the sticker, a line ends exactly where it meets the outline. In 3D
      // the outline is the coloured rounded edge, so the tube runs on the flat
      // top only and stops right where that edge begins (found precisely by
      // bisection): it never climbs onto or past the edge, from any angle
      const surface = (p) => {
        if (!hosts.length) return base; // a loose line with nothing under it
        let zs = null;
        for (const h of hosts) {
          if (!insidePolys(p, h.polys)) continue;
          if (distToSegments(p, h.edges) < h.bevelSize + r * 0.15) continue;
          if (zs == null || h.top > zs) zs = h.top;
        }
        return zs;
      };
      const point = (p, zs, f = 1) => ({ x: p.x, y: p.y, z: own ? zs - r * 0.3 : zs + r * 0.1 * f, f });
      const edgeBetween = (inP, outP, test = (m) => surface(m) != null) => {
        let a = { x: inP.x, y: inP.y };
        let b = { x: outP.x, y: outP.y };
        for (let k = 0; k < 14; k++) {
          const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          if (test(m)) a = m;
          else b = m;
        }
        return a;
      };
      // the shape under a point, rounded edge included
      const hostAt = (p) => {
        let best = null;
        for (const h of hosts) if (insidePolys(p, h.polys) && (!best || h.top > best.top)) best = h;
        return best;
      };
      // height of the rounded edge at a point (same profile as the extrusion:
      // a quarter ellipse from the flat top down to the outline)
      const edgeZ = (p) => {
        const h = hostAt(p);
        if (!h) return null;
        const k = Math.max(0, Math.min(1, 1 - distToSegments(p, h.edges) / h.bevelSize));
        return h.top - h.bevel * (1 - Math.sqrt(1 - k * k));
      };
      const zs = pts.map(surface);
      // like the sticker, where a line ends on the outline (the corners of the
      // lips) it runs on over the rounded edge, following its curve and
      // tapering, and ends exactly on the outline: it neither stops short nor
      // sticks out. Where it only crosses the edge of another part it stops
      // at the start of the rounded edge, as before
      const reach = (from, dir, e) => {
        if (own || !hosts.length) return [];
        const ext = [];
        let k = from;
        while (k >= 0 && k < pts.length && zs[k] == null && hostAt(pts[k])) {
          ext.push(pts[k]);
          k += dir;
        }
        if (k >= 0 && k < pts.length && zs[k] != null) return []; // back on a flat top: a gap, not an end
        const last = ext.length ? ext[ext.length - 1] : e;
        // the outline crossing (or the end of the line, if it ends on the edge)
        const path = k >= 0 && k < pts.length ? [e, ...ext, edgeBetween(last, pts[k], (m) => !!hostAt(m))] : [e, ...ext];
        let total = 0;
        const acc = [0];
        for (let i = 1; i < path.length; i++) acc.push((total += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y)));
        if (total < 0.5) return [];
        return path.slice(1).map((q, i) => {
          const f = 1 - 0.72 * (acc[i + 1] / total);
          return point(q, edgeZ(q) ?? edgeZ(e) ?? base, f);
        });
      };
      const runs = [];
      for (let i = 0; i < pts.length; i++) {
        if (zs[i] == null) continue;
        let j = i;
        while (j + 1 < pts.length && zs[j + 1] != null) j++;
        const run = [];
        if (i > 0) {
          const e = edgeBetween(pts[i], pts[i - 1]);
          run.push(...reach(i - 1, -1, e).reverse(), point(e, surface(e) ?? zs[i]));
        }
        for (let k = i; k <= j; k++) run.push(point(pts[k], zs[k]));
        if (j < pts.length - 1) {
          const e = edgeBetween(pts[j], pts[j + 1]);
          run.push(point(e, surface(e) ?? zs[j]), ...reach(j + 1, 1, e));
        }
        if (run.length > 2) runs.push(run);
        i = j;
      }
      if (closed && runs.length === 1 && runs[0].length === pts.length) runs[0].loop = true;
      for (const run of runs) {
        const isLoop = !!run.loop;
        const curve = new THREE.CatmullRomCurve3(run.map((p) => new THREE.Vector3(p.x, p.y, p.z)), isLoop, 'centripetal');
        const segments = Math.min(2400, Math.max(16, Math.round(curve.getLength() / (r * 0.7))));
        const tube = new THREE.TubeGeometry(curve, segments, r, 10, isLoop);
        // tapered ends (radius factor f of each point, by length along the line)
        if (run.some((p) => p.f < 1)) {
          const lens = [0];
          for (let i = 1; i < run.length; i++) lens.push(lens[i - 1] + Math.hypot(run[i].x - run[i - 1].x, run[i].y - run[i - 1].y, run[i].z - run[i - 1].z));
          const L = lens[lens.length - 1] || 1;
          const fAt = (u) => {
            const d = u * L;
            let i = 1;
            while (i < lens.length - 1 && lens[i] < d) i++;
            const t = Math.max(0, Math.min(1, (d - lens[i - 1]) / ((lens[i] - lens[i - 1]) || 1)));
            return (run[i - 1].f ?? 1) * (1 - t) + (run[i].f ?? 1) * t;
          };
          const pos = tube.attributes.position;
          const c = new THREE.Vector3();
          const v = new THREE.Vector3();
          for (let i = 0; i <= segments; i++) {
            curve.getPointAt(i / segments, c);
            const f = fAt(i / segments);
            for (let j = 0; j <= 10; j++) {
              const idx = i * 11 + j;
              v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(f).add(c);
              pos.setXYZ(idx, v.x, v.y, v.z);
            }
          }
          tube.computeVertexNormals();
        }
        root.add(new THREE.Mesh(tube, makeMaterial(s.color, materialId, UV_REPEAT)));
        // rounded ends for open lines
        if (!isLoop) {
          for (const p of [run[0], run[run.length - 1]]) {
            const cap = new THREE.Mesh(new THREE.SphereGeometry(r * (p.f ?? 1), 12, 8), makeMaterial(s.color, materialId, UV_REPEAT));
            cap.position.set(p.x, p.y, p.z);
            root.add(cap);
          }
        }
      }
    }
  }

  // SVG is y-down: flip so the charm stands upright
  root.scale.set(1, -1, 1);
  const wrapper = new THREE.Group();
  wrapper.add(root);
  // Imperia logo printed on the back, centred on the body
  addBackLogo(wrapper, sizeMm);
  if (attachment && attachment !== 'none') {
    const box = new THREE.Box3().setFromObject(wrapper);
    const size = box.getSize(new THREE.Vector3());
    const mm = Math.max(size.x, size.y) / sizeMm; // SVG units per millimetre
    // hang point: top of the body, in the middle of its thickness
    const top = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2);
    // hardware a little smaller than life-size reads better next to the charm
    wrapper.add(buildAttachment(attachment, top, mm * 0.72));
  }
  return wrapper;
}

/** [[x, y], …] rings for polygon-clipping (outer first, then holes), closed. */
const ring = (pts) => {
  const r = pts.map((p) => [p.x, p.y]);
  if (r.length && (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1])) r.push([...r[0]]);
  return r;
};
const toGeom = (polys) => polys.map((q) => [ring(q.outer), ...q.holes.map(ring)]);

/**
 * The support under the overhanging part of a piece: the piece's outline
 * minus everything already under it, extruded from the back of the charm up
 * to `height`. Thin slivers left along shared edges are dropped.
 */
function supportGeometry(piecePolys, underPolys, height, edge) {
  let parts;
  try {
    parts = polygonClipping.difference(toGeom(piecePolys), ...underPolys.map(toGeom));
  } catch {
    return null;
  }
  const shapes = [];
  for (const poly of parts) {
    const [outer, ...holes] = poly;
    const pts = outer.slice(0, -1).map(([x, y]) => new THREE.Vector2(x, y));
    const area = Math.abs(THREE.ShapeUtils.area(pts));
    let perim = 0;
    for (let i = 0; i < pts.length; i++) perim += pts[i].distanceTo(pts[(i + 1) % pts.length]);
    // a sliver (thinner than about one unit) is a rounding leftover, not an overhang
    if (pts.length < 3 || area < 20 || (2 * area) / perim < 1.5) continue;
    const sh = new THREE.Shape(pts);
    sh.holes = holes.map((h) => new THREE.Path(h.slice(0, -1).map(([x, y]) => new THREE.Vector2(x, y))));
    shapes.push(sh);
  }
  if (!shapes.length) return null;
  const b = Math.max(0.3, Math.min(edge, 3));
  const g = new THREE.ExtrudeGeometry(shapes, {
    depth: Math.max(0.5, height - 0.3 - b * 2),
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b * 0.6,
    bevelOffset: -b * 0.6,
    bevelSegments: 4,
    curveSegments: 1,
  });
  g.translate(0, 0, b);
  return smoothGeometry(g);
}

/** Area of the flat top of an extrusion (front cap triangles, before merging). */
function capArea(geometry) {
  const pos = geometry.attributes.position;
  const cap = geometry.groups.filter((g) => g.materialIndex === 0);
  let zTop = -Infinity;
  for (let i = 0; i < pos.count; i++) zTop = Math.max(zTop, pos.getZ(i));
  let area = 0;
  for (const g of cap) {
    for (let t = g.start; t < g.start + g.count; t += 3) {
      if (pos.getZ(t) < zTop - 1e-4 || pos.getZ(t + 1) < zTop - 1e-4 || pos.getZ(t + 2) < zTop - 1e-4) continue;
      const ax = pos.getX(t + 1) - pos.getX(t);
      const ay = pos.getY(t + 1) - pos.getY(t);
      const bx = pos.getX(t + 2) - pos.getX(t);
      const by = pos.getY(t + 2) - pos.getY(t);
      area += (ax * by - ay * bx) / 2;
    }
  }
  return Math.abs(area);
}

/** Moving-average of the contour: rounds tips to about `radius`. */
function smoothLoop(pts, radius, step, measured = false) {
  const n = pts.length;
  // window measured on the real spacing of the points (curves come back from
  // getPoints() denser than the resampling step): with the nominal step the
  // corners stayed much sharper than `radius`, and the rounded edge of small
  // details (triangle pupils) folded over itself and lost its flat top
  let len = 0;
  for (let i = 0; i < n; i++) len += Math.hypot(pts[(i + 1) % n].x - pts[i].x, pts[(i + 1) % n].y - pts[i].y);
  const spacing = n && measured ? Math.max(1e-3, Math.min(step, len / n)) : step;
  const k = Math.max(1, Math.round(radius / spacing / 2));
  if (n < k * 4) return pts;
  let cur = pts.map((p) => new THREE.Vector2(p.x, p.y));
  for (let pass = 0; pass < 2; pass++) {
    cur = cur.map((_, i) => {
      let x = 0;
      let y = 0;
      for (let j = -k; j <= k; j++) {
        const q = cur[(i + j + n) % n];
        x += q.x;
        y += q.y;
      }
      return new THREE.Vector2(x / (2 * k + 1), y / (2 * k + 1));
    });
  }
  return cur;
}
function roundCorners(shape, radius, step, measured = false) {
  const s = new THREE.Shape(smoothLoop(shape.getPoints(), radius, step, measured));
  s.holes = shape.holes.map((h) => new THREE.Path(smoothLoop(h.getPoints(), radius, step, measured)));
  return s;
}

/** Segments on the outside of the union of shapes (where shapes overlap, the
 *  shared lines – like the middle of the lips – are not edges). */
function outerEdges(polys, contours) {
  const segs = [];
  for (const c of contours) {
    for (let i = 0, n = c.length; i < n; i++) {
      const a = c[i];
      const b = c[(i + 1) % n];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const nx = (-(b.y - a.y) / len) * 1.5;
      const ny = ((b.x - a.x) / len) * 1.5;
      const inA = insidePolys({ x: mx + nx, y: my + ny }, polys);
      const inB = insidePolys({ x: mx - nx, y: my - ny }, polys);
      if (inA !== inB) segs.push([a, b]);
    }
  }
  return segs;
}

function distToSegments(p, segs) {
  let best = Infinity;
  for (const [a, b] of segs) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l2 = dx * dx + dy * dy || 1;
    const u = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
    const ex = a.x + u * dx - p.x;
    const ey = a.y + u * dy - p.y;
    best = Math.min(best, ex * ex + ey * ey);
  }
  return Math.sqrt(best);
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

/* ---- back logo ---------------------------------------------------------- */
let logoTexture = null;
/** Logo width on the phone cases (mm), used on the charms too. */
const LOGO_MM = 19;

function addBackLogo(wrapper, sizeMm = 40) {
  // measure the body only (eyes and mouth may stick out of it)
  wrapper.updateMatrixWorld(true);
  const box = new THREE.Box3();
  wrapper.traverse((o) => o.isMesh && o.userData.body && box.expandByObject(o));
  if (box.isEmpty()) box.setFromObject(wrapper);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  if (!logoTexture) {
    logoTexture = new THREE.TextureLoader().load(logoUrl);
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    logoTexture.anisotropy = 8;
  }
  const ratio = 1800 / 388;
  const all = new THREE.Box3().setFromObject(wrapper).getSize(new THREE.Vector3());
  const mm = Math.max(all.x, all.y) / sizeMm; // SVG units per millimetre
  // tall bodies (Reginetta): vertical along the body, centred, small enough to
  // leave a clear margin on both sides (about a third of the width);
  // the others: horizontal, centred, towards the bottom. Same size as on the
  // cases, but always well inside the body.
  const vertical = size.y > size.x * 1.6;
  const long = vertical ? size.y : size.x;
  const short = vertical ? size.x : size.y;
  const w = vertical ? Math.min(LOGO_MM * 0.6 * mm, long * 0.3, short * 0.3 * ratio) : Math.min(LOGO_MM * mm, long * 0.5, short * 0.55 * ratio);
  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w / ratio),
    new THREE.MeshPhysicalMaterial({ map: logoTexture, transparent: true, alphaTest: 0.05, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -2 }),
  );
  decal.rotation.set(0, Math.PI, vertical ? Math.PI / 2 : 0); // faces the back
  const cx = (box.min.x + box.max.x) / 2;
  const cy = vertical ? (box.min.y + box.max.y) / 2 : box.min.y + size.y * 0.24;
  decal.position.set(cx, cy, box.min.z - 0.4);
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
