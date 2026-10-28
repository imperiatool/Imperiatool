import { useEffect, useRef, useState } from 'react';

/**
 * Home, Experiences card: the spaghetti nest turns slowly on the plate, as if
 * a fork were twirling and gathering it. It is the same 3D nest as the image
 * (same studio, colour and finish), so the lighting and shadow stay put while
 * the pasta turns. The still image shows first and stays when motion is
 * reduced, when WebGL is missing, or until the 3D is ready; the canvas never
 * takes pointer or touch input (the card link and page scrolling work as before).
 */
export default function SpaghettiTwirl({ src, className = '' }) {
  const host = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let studio = null;
    let raf = 0;
    let cancelled = false;
    const start = async () => {
      try {
        const [THREE, { Studio }, { buildPasta }] = await Promise.all([import('three'), import('../../lib/three/studio.js'), import('../../lib/pasta3d.js')]);
        if (cancelled || !host.current) return;
        studio = new Studio(host.current, { transparent: true });
        studio.controls.enabled = false;
        studio.renderer.domElement.style.pointerEvents = 'none';
        studio.renderer.domElement.style.touchAction = 'auto';
        // the image's own nest: same shape, colour, finish and camera angle
        studio.setObject(buildPasta({ shape: 'spaghetti', color: '#ffb548', finish: 'aldente' }), { height: 1.3 });
        const pivot = studio.object;
        const holder = pivot.children[0];
        const box = new THREE.Box3().setFromObject(holder);
        const centre = box.getCenter(new THREE.Vector3());
        const az = 0.3;
        const el = 0.62;
        const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
        // frame it like the still image: the nest fills about three quarters of the square
        const pts = [];
        holder.traverse((o) => {
          if (!o.isMesh) return;
          const pos = o.geometry.attributes.position;
          for (let i = 0; i < pos.count; i += 37) pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld));
        });
        let d = studio.fitDistance * 1.02;
        const target = centre.clone();
        for (let k = 0; k < 3; k++) {
          studio.camera.position.copy(target).addScaledVector(dir, d);
          studio.camera.lookAt(target);
          studio.camera.updateMatrixWorld();
          const b = new THREE.Box2();
          for (const p of pts) {
            const q = p.clone().project(studio.camera);
            b.expandByPoint(new THREE.Vector2(q.x, q.y));
          }
          const ext = Math.max(b.max.x - b.min.x, b.max.y - b.min.y) / 2;
          d *= ext / 0.74;
          // re-centre: move the target by the offset of the projected box
          const off = b.getCenter(new THREE.Vector2());
          const right = new THREE.Vector3().setFromMatrixColumn(studio.camera.matrixWorld, 0);
          const up = new THREE.Vector3().setFromMatrixColumn(studio.camera.matrixWorld, 1);
          const h = Math.tan((studio.camera.fov * Math.PI) / 360) * d;
          target.addScaledVector(right, off.x * h).addScaledVector(up, off.y * h);
        }
        studio.controls.target.copy(target);
        studio.camera.position.copy(target).addScaledVector(dir, d);
        studio.camera.lookAt(target);
        studio.controls.update();

        // twirl: a continuous turn whose pace breathes a little, the axis
        // circling slightly (the fork gathering), the strands drawn in a touch
        let angle = 0;
        let last = performance.now();
        const t0 = last;
        const tick = (now) => {
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          const t = (now - t0) / 1000;
          angle -= dt * 0.62 * (1 + 0.28 * Math.sin(t * 0.55));
          pivot.rotation.set(0.035 * Math.sin(t * 0.9), angle, 0.035 * Math.cos(t * 0.9));
          const g = 0.5 + 0.5 * Math.sin(t * 1.1);
          holder.scale.set(holder.userData.s * (1 - 0.025 * g), holder.userData.s * (1 + 0.02 * g), holder.userData.s * (1 - 0.025 * g));
          raf = requestAnimationFrame(tick);
        };
        holder.userData.s = holder.scale.x;
        raf = requestAnimationFrame(tick);
        // show the 3D once its first frames are drawn
        setTimeout(() => !cancelled && setLive(true), 150);
      } catch {
        /* no WebGL: the still image stays */
      }
    };
    // after the page has settled, so the home appears as fast as before
    const idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 600);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
      cancelAnimationFrame(raf);
      try {
        studio?.dispose?.();
      } catch {
        /* already gone */
      }
    };
  }, []);

  return (
    <>
      <img src={src} alt="" className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${live ? 'opacity-0' : 'opacity-100'} ${className}`} />
      <div ref={host} aria-hidden="true" className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${live ? 'opacity-100' : 'opacity-0'}`} data-testid="spaghetti-twirl" />
    </>
  );
}
