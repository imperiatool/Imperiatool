// Geometry for canvas items. An item is drawn centred on (x, y):
//   translate(x y) rotate(rotation) scale(sx sy) translate(-w/2 -h/2)
// with sx = scale * stretchX * (flipX ? -1 : 1), sy likewise.

export const DEG = Math.PI / 180;

export function itemScales(item) {
  return {
    sx: item.scale * item.stretchX * (item.flipX ? -1 : 1),
    sy: item.scale * item.stretchY * (item.flipY ? -1 : 1),
  };
}

export function itemTransform(item) {
  const { sx, sy } = itemScales(item);
  return `translate(${item.x} ${item.y}) rotate(${item.rotation}) scale(${sx} ${sy})`;
}

export function rotate(p, deg) {
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}

/** Local (unrotated, unscaled) point → canvas point. */
export function localToCanvas(item, p) {
  const { sx, sy } = itemScales(item);
  const r = rotate({ x: p.x * sx, y: p.y * sy }, item.rotation);
  return { x: item.x + r.x, y: item.y + r.y };
}

/** Canvas point → item frame (rotation removed, scale kept). */
export function canvasToRotatedFrame(item, p) {
  return rotate({ x: p.x - item.x, y: p.y - item.y }, -item.rotation);
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function angle(center, p) {
  return Math.atan2(p.y - center.y, p.x - center.x) / DEG;
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function normalizeAngle(a) {
  let x = ((a + 180) % 360 + 360) % 360 - 180;
  if (Object.is(x, -0)) x = 0;
  return x;
}

/** Client (mouse) coordinates → SVG user units. */
export function clientToSvg(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const m = svg.getScreenCTM();
  if (!m) return { x: clientX, y: clientY };
  const r = pt.matrixTransform(m.inverse());
  return { x: r.x, y: r.y };
}
