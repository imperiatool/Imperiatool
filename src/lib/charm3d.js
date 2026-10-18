// 3D charm: every layer of the 2D composition is extruded from its SVG shapes
// and stacked in depth; strokes become rounded "piping" so outlines and inner
// lines (lips, shells…) stay visible in 3D.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { renderAssetMarkup } from './svgParser.js';
import { itemTransform } from './geometry.js';
import { makeMaterial, MATERIAL_SHAPE } from './three/materials.js';
import { resampleShape, samplePath, smoothGeometry } from './three/geometry.js';

// canvas units per mm: a 1000-unit body ≈ 40 mm charm → grain tile of ~8 mm
const UV_REPEAT = 1 / 200;

function itemScale(item) {
  return item.scale * (Math.abs(item.stretchX) + Math.abs(item.stretchY)) / 2;
}

/**
 * @returns THREE.Group in SVG units (y is flipped so the charm stands upright)
 */
export function buildCharm(items, assetsById, materialId = 'aldente') {
  const shapeHints = MATERIAL_SHAPE[materialId] || MATERIAL_SHAPE.aldente;
  const visible = items.filter((it) => !it.hidden && assetsById[it.assetId]);
  const root = new THREE.Group();
  if (!visible.length) return root;

  const loader = new SVGLoader();
  const pieces = [];
  const strokes = [];

  visible.forEach((item, index) => {
    const asset = assetsById[item.assetId];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><g transform="${itemTransform(item)}"><g transform="translate(${-asset.width / 2} ${-asset.height / 2})">${renderAssetMarkup(asset, item.colors, `c${index}`)}</g></g></svg>`;
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
    const bt = Math.min(depth * 0.42, piece.level === 0 ? 26 : 10) * shapeHints.bevel;
    // a wide inward bevel self-intersects on tight waves (raviolo edges)
    const bs = Math.min(bt * 0.9, minDim * 0.12, 11);

    let z0 = 0;
    for (const p of placed) if (p.box.intersectsBox(box)) z0 = Math.max(z0, p.top - 2);

    let geometry = new THREE.ExtrudeGeometry(shapes, {
      depth: Math.max(1, depth - bt * 2),
      bevelEnabled: true,
      bevelThickness: Math.max(0.6, bt),
      bevelSize: Math.max(0.4, bs),
      bevelOffset: -Math.max(0.4, bs),
      bevelSegments: materialId === 'overcooked' ? 10 : 7,
      curveSegments: 1, // already sampled by length
    });
    geometry = smoothGeometry(geometry);
    const mesh = new THREE.Mesh(geometry, makeMaterial(piece.color, materialId, UV_REPEAT));
    mesh.position.z = z0 + Math.max(0.6, bt);
    root.add(mesh);
    const top = z0 + depth;
    piece.top = top;
    placed.push({ box, top });
    itemTop.set(piece.item, Math.max(itemTop.get(piece.item) ?? 0, top));
  }

  /* ---- strokes → rounded piping ---------------------------------------- */
  for (const s of strokes) {
    const r = Math.max(s.width * 0.6, 3.2);
    const z = (s.pieceIndex != null ? pieces[s.pieceIndex].top : itemTop.get(s.item) ?? 0) - r * 0.35;
    for (const sub of s.path.subPaths) {
      const pts = samplePath(sub, Math.max(2, r * 0.8));
      if (pts.length < 2) continue;
      const first = sub.getPoint(0);
      const lastP = sub.getPoint(1);
      const closed = sub.autoClose || first.distanceTo(lastP) < 0.5;
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p.x, p.y, z)), closed, 'centripetal');
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
  return wrapper;
}
