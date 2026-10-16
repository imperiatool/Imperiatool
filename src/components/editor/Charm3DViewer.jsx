import { useEffect, useRef, useState } from 'react';
import { CharmScene } from '../../lib/charm3d.js';
import { useI18n } from '../../i18n/index.js';

/**
 * Interactive 3D charm. Loaded lazily (Three.js is ~600 KB), so the editor
 * stays light until someone opens "Order 3D Charm".
 * `onReady(api)` receives { snapshot() } to capture the current view.
 */
export default function Charm3DViewer({ items, assetsById, material, autoRotate = true, onReady, className = '' }) {
  const { t } = useI18n();
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      sceneRef.current = new CharmScene(hostRef.current);
      onReady?.({ snapshot: () => sceneRef.current?.snapshot() });
    } catch (e) {
      console.error(e);
      setError(true);
    }
    return () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
      onReady?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sceneRef.current?.setDesign(items, assetsById, material);
  }, [items, assetsById, material]);

  useEffect(() => {
    sceneRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  return (
    <div ref={hostRef} className={`relative overflow-hidden ${className}`} data-testid="charm-3d">
      {error && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">{t('order.webglError')}</div>}
    </div>
  );
}
