import { useEffect, useRef, useState } from 'react';
import { Studio } from '../../lib/three/studio.js';
import { buildCharm } from '../../lib/charm3d.js';
import { buildCover } from '../../lib/cover3d.js';
import { buildPackaging } from '../../lib/packaging3d.js';
import Icon from '../ui/Icon.jsx';
import { useI18n } from '../../i18n/index.js';

/**
 * 3D product preview (lazy-loaded: Three.js is only downloaded when needed).
 *   kind="charm"     → items + assetsById + material (+ attachment, sizeMm)
 *   kind="cover"     → cover = { pattern, color, material, model }
 *   kind="packaging" → cover + { colorId, colorName, modelLabel }: the retail box
 * `onReady(api)` receives { snapshot() }.
 */
export default function Viewer3D({ kind, items, assetsById, material, attachment, sizeMm, cover, onReady, className = '', hint = true }) {
  const { t } = useI18n();
  const hostRef = useRef(null);
  const studioRef = useRef(null);
  const [error, setError] = useState(false);
  const [spin, setSpin] = useState(true);

  useEffect(() => {
    try {
      studioRef.current = new Studio(hostRef.current);
      studioRef.current.setAutoRotate(true);
      onReady?.({ snapshot: (q, max) => studioRef.current?.snapshot(q, max) });
    } catch (e) {
      console.error(e);
      setError(true);
    }
    return () => {
      studioRef.current?.dispose();
      studioRef.current = null;
      onReady?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const coverKey = cover ? JSON.stringify(cover) : '';
  const lastKind = useRef(kind);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const studio = studioRef.current;
    if (!studio) return;
    // switching case ↔ box: frame the new object from the front again
    if (lastKind.current !== kind) studio.reframe = true;
    lastKind.current = kind;
    let cancelled = false;
    try {
      if (kind === 'packaging') {
        setBusy(true);
        buildPackaging(cover)
          .then((obj) => {
            if (cancelled) return;
            studio.setObject(obj, { height: 2.3 });
          })
          .catch((e) => console.error(e))
          .finally(() => !cancelled && setBusy(false));
      } else if (kind === 'cover') studio.setObject(buildCover(cover), { height: 2.2 });
      else studio.setObject(buildCharm(items || [], assetsById || {}, material, { attachment, sizeMm }), { height: 2 });
    } catch (e) {
      console.error(e);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, items, assetsById, material, coverKey, attachment, sizeMm]);

  useEffect(() => studioRef.current?.setAutoRotate(spin), [spin]);

  // "jelly" bounce when the material changes: you can see how soft it is
  const mat = kind === 'charm' ? material : cover?.material;
  const firstMat = useRef(true);
  useEffect(() => {
    if (firstMat.current) {
      firstMat.current = false;
      return;
    }
    const strength = { overcooked: 0.11, aldente: 0.035, raw: 0 }[mat] ?? 0;
    if (strength && kind !== 'packaging') studioRef.current?.wobble(strength);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mat]);

  const btn = 'grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-sm ring-1 ring-ink/10 transition hover:text-brand active:scale-95';
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={hostRef} className="absolute inset-0" data-testid="viewer-3d" onPointerDown={() => setSpin(false)} />
      {error ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">{t('order.webglError')}</div>
      ) : (
        <>
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <button type="button" className={btn} onClick={() => studioRef.current?.zoom(0.75)} title={t('viewer.zoomIn')} aria-label={t('viewer.zoomIn')} data-testid="zoom-in">
              <Icon name="plus" className="h-5 w-5" />
            </button>
            <button type="button" className={btn} onClick={() => studioRef.current?.zoom(1.33)} title={t('viewer.zoomOut')} aria-label={t('viewer.zoomOut')}>
              <Icon name="minus" className="h-5 w-5" />
            </button>
            <button type="button" className={btn} onClick={() => studioRef.current?.resetView()} title={t('viewer.reset')} aria-label={t('viewer.reset')}>
              <Icon name="reset" className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={`${btn} ${spin ? '!bg-brand !text-white !ring-brand' : ''}`}
              onClick={() => setSpin((s) => !s)}
              title={t('order.autoRotate')}
              aria-label={t('order.autoRotate')}
              aria-pressed={spin}
            >
              <Icon name="rotate" className="h-5 w-5" />
            </button>
          </div>
          {busy && <div className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs font-semibold text-muted">{t('order.loading3d')}</div>}
          {hint && (
            <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-muted">
              {t('order.preview3d')}
            </p>
          )}
        </>
      )}
    </div>
  );
}
