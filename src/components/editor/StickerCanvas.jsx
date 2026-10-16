import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore.js';
import { renderAssetMarkup } from '../../lib/svgParser.js';
import { CANVAS_SIZE } from '../../data/defaults.js';
import {
  itemTransform, localToCanvas, canvasToRotatedFrame, dist, angle, clamp, normalizeAngle, clientToSvg,
} from '../../lib/geometry.js';

const SNAP = 12; // canvas units for centre snapping (scaled by zoom)

/** One placed element. Memoised: only re-renders when its own data changes. */
const CanvasItem = memo(function CanvasItem({ item, asset, onPointerDown }) {
  const html = useMemo(() => renderAssetMarkup(asset, item.colors, item.uid), [asset, item.colors, item.uid]);
  return (
    <g
      transform={itemTransform(item)}
      onPointerDown={item.locked ? undefined : (e) => onPointerDown(e, item, 'move')}
      style={{ cursor: item.locked ? 'default' : 'move', pointerEvents: item.locked ? 'none' : undefined }}
      data-item={item.uid}
    >
      <g transform={`translate(${-asset.width / 2} ${-asset.height / 2})`} dangerouslySetInnerHTML={{ __html: html }} />
    </g>
  );
});

/** Selection frame with scale (corners), stretch (sides) and rotate handles. */
function Handles({ item, asset, unit, onPointerDown }) {
  const w = asset.width / 2;
  const h = asset.height / 2;
  const P = (x, y) => localToCanvas(item, { x, y });
  const corners = [P(-w, -h), P(w, -h), P(w, h), P(-w, h)];
  const sides = { stretchX: [P(-w, 0), P(w, 0)], stretchY: [P(0, -h), P(0, h)] };
  const top = P(0, -h);
  const dir = { x: top.x - item.x, y: top.y - item.y };
  const len = Math.hypot(dir.x, dir.y) || 1;
  const rot = { x: top.x + (dir.x / len) * 44 * unit, y: top.y + (dir.y / len) * 44 * unit };
  const r = 8 * unit;
  const sw = 2 * unit;

  const handle = (p, mode, key, cursor, shape = 'circle') =>
    shape === 'circle' ? (
      <circle key={key} cx={p.x} cy={p.y} r={r} fill="#fff" stroke="#3a1f1b" strokeWidth={sw} style={{ cursor }} onPointerDown={(e) => onPointerDown(e, item, mode)} data-handle={mode} />
    ) : (
      <rect key={key} x={p.x - r * 0.8} y={p.y - r * 0.8} width={r * 1.6} height={r * 1.6} rx={r * 0.3} fill="#ffb548" stroke="#3a1f1b" strokeWidth={sw} style={{ cursor }} onPointerDown={(e) => onPointerDown(e, item, mode)} data-handle={mode} />
    );

  return (
    <g>
      <polygon points={corners.map((c) => `${c.x},${c.y}`).join(' ')} fill="none" stroke="#e3201b" strokeWidth={sw} strokeDasharray={`${6 * unit} ${4 * unit}`} pointerEvents="none" />
      <line x1={top.x} y1={top.y} x2={rot.x} y2={rot.y} stroke="#e3201b" strokeWidth={sw} pointerEvents="none" />
      {sides.stretchX.map((p, i) => handle(p, 'stretchX', `sx${i}`, 'ew-resize', 'rect'))}
      {sides.stretchY.map((p, i) => handle(p, 'stretchY', `sy${i}`, 'ns-resize', 'rect'))}
      {corners.map((p, i) => handle(p, 'scale', `c${i}`, i % 2 ? 'nesw-resize' : 'nwse-resize'))}
      <circle cx={rot.x} cy={rot.y} r={r * 1.1} fill="#e3201b" stroke="#3a1f1b" strokeWidth={sw} style={{ cursor: 'grab' }} onPointerDown={(e) => onPointerDown(e, item, 'rotate')} data-handle="rotate" />
    </g>
  );
}

/** Selection outline for a locked layer (no handles). */
function LockedFrame({ item, asset, unit }) {
  const w = asset.width / 2;
  const h = asset.height / 2;
  const pts = [[-w, -h], [w, -h], [w, h], [-w, h]].map(([x, y]) => localToCanvas(item, { x, y }));
  return (
    <polygon points={pts.map((c) => `${c.x},${c.y}`).join(' ')} fill="none" stroke="#7a5f58" strokeWidth={2 * unit} strokeDasharray={`${3 * unit} ${5 * unit}`} pointerEvents="none" />
  );
}

export default function StickerCanvas({ assetsById, svgRef: externalRef, label }) {
  const items = useEditorStore((s) => s.items);
  const selectedId = useEditorStore((s) => s.selectedId);
  const background = useEditorStore((s) => s.background);
  const localRef = useRef(null);
  const svgRef = externalRef || localRef;
  const drag = useRef(null);
  const [unit, setUnit] = useState(1);
  const [guides, setGuides] = useState({ v: false, h: false });

  // canvas units per screen pixel, so handles keep a constant on-screen size
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setUnit(CANVAS_SIZE / Math.max(1, el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [svgRef]);

  const startDrag = (e, item, mode) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const { select } = useEditorStore.getState();
    select(item.uid);
    const start = clientToSvg(svgRef.current, e.clientX, e.clientY);
    drag.current = { mode, id: item.uid, start, orig: { ...item }, snapped: false, pointerId: e.pointerId };
    svgRef.current.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const store = useEditorStore.getState();
    const p = clientToSvg(svgRef.current, e.clientX, e.clientY);
    if (!d.snapped) {
      if (dist(p, d.start) < 1.5 * unit) return; // ignore micro-moves on click
      store.snapshot();
      d.snapped = true;
    }
    const o = d.orig;
    const center = { x: o.x, y: o.y };
    let patch = {};

    if (d.mode === 'move') {
      let x = o.x + (p.x - d.start.x);
      let y = o.y + (p.y - d.start.y);
      const mid = CANVAS_SIZE / 2;
      const snapV = !e.altKey && Math.abs(x - mid) < SNAP * unit;
      const snapH = !e.altKey && Math.abs(y - mid) < SNAP * unit;
      if (snapV) x = mid;
      if (snapH) y = mid;
      setGuides({ v: snapV, h: snapH });
      patch = { x: round(x), y: round(y) };
    } else if (d.mode === 'scale') {
      const f = dist(center, p) / Math.max(1e-6, dist(center, d.start));
      patch = { scale: round(clamp(o.scale * f, 0.05, 8), 1000) };
    } else if (d.mode === 'stretchX' || d.mode === 'stretchY') {
      const axis = d.mode === 'stretchX' ? 'x' : 'y';
      const a = canvasToRotatedFrame(o, d.start)[axis];
      const b = canvasToRotatedFrame(o, p)[axis];
      const ratio = Math.abs(a) < 1e-6 ? 1 : b / a;
      patch = { [d.mode]: round(clamp(o[d.mode] * ratio, 0.1, 6), 1000) };
    } else if (d.mode === 'rotate') {
      let rot = normalizeAngle(o.rotation + angle(center, p) - angle(center, d.start));
      if (e.shiftKey) rot = Math.round(rot / 15) * 15;
      patch = { rotation: round(rot, 10) };
    }
    store.updateItem(d.id, patch);
  };

  const endDrag = () => {
    if (drag.current) svgRef.current?.releasePointerCapture?.(drag.current.pointerId);
    drag.current = null;
    setGuides({ v: false, h: false });
  };

  const selected = items.find((it) => it.uid === selectedId);
  const selectedAsset = selected && assetsById[selected.assetId];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
      className="block h-full w-full touch-none select-none"
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerDown={() => useEditorStore.getState().select(null)}
      role="application"
      aria-label={label}
    >
      {background && <rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill={background} />}
      <g data-layer="content">
        {items.map((it) =>
          assetsById[it.assetId] && !it.hidden ? <CanvasItem key={it.uid} item={it} asset={assetsById[it.assetId]} onPointerDown={startDrag} /> : null,
        )}
      </g>
      <g data-layer="ui">
        {guides.v && <line x1={CANVAS_SIZE / 2} x2={CANVAS_SIZE / 2} y1={0} y2={CANVAS_SIZE} stroke="#1a5632" strokeWidth={unit} strokeDasharray={`${8 * unit}`} />}
        {guides.h && <line y1={CANVAS_SIZE / 2} y2={CANVAS_SIZE / 2} x1={0} x2={CANVAS_SIZE} stroke="#1a5632" strokeWidth={unit} strokeDasharray={`${8 * unit}`} />}
        {selected && selectedAsset && !selected.hidden && !selected.locked && (
          <Handles item={selected} asset={selectedAsset} unit={unit} onPointerDown={startDrag} />
        )}
        {selected && selectedAsset && !selected.hidden && selected.locked && <LockedFrame item={selected} asset={selectedAsset} unit={unit} />}
      </g>
    </svg>
  );
}

function round(n, f = 100) {
  return Math.round(n * f) / f;
}
