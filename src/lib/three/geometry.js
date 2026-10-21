// Geometry helpers shared by the charm and cover builders.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Samples a Path/Shape curve by length (not by a fixed count), so a big circle
 * gets as many points as it needs: round shapes stay round when seen from the side.
 */
export function samplePath(path, step) {
  const pts = [];
  for (const curve of path.curves) {
    const isLine = curve.isLineCurve || curve.type === 'LineCurve';
    const n = isLine ? 1 : Math.max(4, Math.ceil(curve.getLength() / step));
    const cp = curve.getPoints(n);
    for (let i = 0; i < cp.length; i++) {
      const p = cp[i];
      const last = pts[pts.length - 1];
      if (!last || last.distanceToSquared(p) > 1e-6) pts.push(p);
    }
  }
  if (pts.length > 2 && pts[0].distanceToSquared(pts[pts.length - 1]) < 1e-6) pts.pop();
  return pts;
}

/** Rebuilds a shape: length-based sampling + consistent winding. */
export function resampleShape(shape, step) {
  const outer = samplePath(shape, step);
  if (!THREE.ShapeUtils.isClockWise(outer)) outer.reverse();
  const s = new THREE.Shape(outer);
  for (const h of shape.holes) {
    const pts = samplePath(h, step);
    if (pts.length < 3) continue;
    if (THREE.ShapeUtils.isClockWise(pts)) pts.reverse();
    s.holes.push(new THREE.Path(pts));
  }
  return s;
}

/**
 * Welds vertices and recomputes smooth normals (ExtrudeGeometry is faceted
 * otherwise), then adds box-projected UVs so textures have a real-world scale.
 */
export function smoothGeometry(geometry) {
  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  const g = mergeVertices(geometry, 1e-3);
  geometry.dispose();
  g.computeVertexNormals();
  boxUV(g);
  return g;
}

export function boxUV(g) {
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i));
    const ny = Math.abs(nor.getY(i));
    const nz = Math.abs(nor.getZ(i));
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (nz >= nx && nz >= ny) { uv[i * 2] = x; uv[i * 2 + 1] = y; }
    else if (nx >= ny) { uv[i * 2] = y; uv[i * 2 + 1] = z; }
    else { uv[i * 2] = x; uv[i * 2 + 1] = z; }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/** Rounded rectangle centred on (cx, cy). `asHole` → returns a Path. */
export function roundedRect(cx, cy, w, h, r, asHole = false) {
  const p = asHole ? new THREE.Path() : new THREE.Shape();
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  r = Math.min(r, w / 2, h / 2);
  p.moveTo(x0 + r, y0);
  p.lineTo(x0 + w - r, y0);
  p.absarc(x0 + w - r, y0 + r, r, -Math.PI / 2, 0, false);
  p.lineTo(x0 + w, y0 + h - r);
  p.absarc(x0 + w - r, y0 + h - r, r, 0, Math.PI / 2, false);
  p.lineTo(x0 + r, y0 + h);
  p.absarc(x0 + r, y0 + h - r, r, Math.PI / 2, Math.PI, false);
  p.lineTo(x0, y0 + r);
  p.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return p;
}

/** Signed distance to a rounded rectangle (negative inside). */
export function sdRoundRect(x, y, cx, cy, hw, hh, r) {
  const qx = Math.abs(x - cx) - hw + r;
  const qy = Math.abs(y - cy) - hh + r;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * Arc-length position (0..perimeter) of the projection of (x,y) on a rounded
 * rectangle: used to place bumps evenly along a border.
 */
export function roundRectArc(x, y, cx, cy, hw, hh, r) {
  const ex = hw - r;
  const ey = hh - r;
  const dx = x - cx;
  const dy = y - cy;
  const q = (Math.PI / 2) * r;
  const top = 2 * ex;
  const side = 2 * ey;
  // segments clockwise starting at the top-left end of the top edge (y = +hh)
  if (Math.abs(dx) <= ex && dy >= 0) return dx + ex; // top
  if (dx > ex && dy > ey) return top + Math.atan2(dx - ex, dy - ey) * r; // top-right corner
  if (Math.abs(dy) <= ey && dx >= 0) return top + q + (ey - dy); // right
  if (dx > ex && dy < -ey) return top + q + side + Math.atan2(-dy - ey, dx - ex) * r; // bottom-right
  if (Math.abs(dx) <= ex && dy < 0) return top + 2 * q + side + (ex - dx); // bottom
  if (dx < -ex && dy < -ey) return 2 * top + 2 * q + side + Math.atan2(-dx - ex, -dy - ey) * r; // bottom-left
  if (Math.abs(dy) <= ey && dx < 0) return 2 * top + 3 * q + side + (dy + ey); // left
  return 2 * top + 3 * q + 2 * side + Math.atan2(dy - ey, -dx - ex) * r; // top-left
}

export function roundRectPerimeter(hw, hh, r) {
  return 4 * (hw - r) + 4 * (hh - r) + 2 * Math.PI * r;
}

export const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
