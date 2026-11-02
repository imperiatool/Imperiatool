import { useEffect, useId, useRef } from 'react';

// Where the sticker's own silhouette reaches furthest towards the bottom-right
// corner (x + y, in % of the image), measured on previews/sticker.png.
const CORNER = 159.5;
// How far the fold travels in at the top of the lift (same units).
const LIFT = 27;
const PERIOD = 4200; // ms for one lift and settle; the next lift follows straight away

/**
 * Fold depth 0…1 over one period: it starts lifting at once, the breeze
 * holds it up with a light flutter, it lays back down and lifts again, with
 * no pause in between.
 */
export function peelAt(p) {
  const base = Math.abs(Math.sin(Math.PI * p)) ** 1.6;
  return Math.max(0, Math.min(1, base * (1 + 0.07 * Math.sin(p * Math.PI * 6))));
}

/**
 * Home, Stickers card: the bottom-right corner of the sticker keeps lifting
 * and laying back down, like a corner caught by a breeze. The rest of the
 * sticker never moves. The lifted corner is the same artwork folded over its
 * fold line (the white back of the sticker shows, shaded towards the fold) and
 * looks shorter while it stands up. Pure display: no pointer input, and it
 * rests flat when motion is reduced.
 */
export default function StickerPeel({ src }) {
  const id = useId().replace(/:/g, '');
  const refs = useRef({});

  useEffect(() => {
    const r = refs.current;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    let io;
    if (typeof IntersectionObserver !== 'undefined' && r.svg) {
      io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(r.svg);
    }
    const set = (k) => {
      const c = CORNER - LIFT * k; // fold line: x + y = c
      // the sticker without the lifted corner
      r.base?.setAttribute('points', `-10,-10 110,-10 110,${c - 110} ${c - 110},110 -10,110`);
      // the corner beyond the fold (in the artwork's own coordinates)
      r.tri?.setAttribute('points', `${c - 110},110 110,${c - 110} 120,120`);
      // folded over the line, foreshortened while it stands up (a curl)
      const s = 0.3 + 0.62 * k;
      const p = c / 2;
      r.flap?.setAttribute('transform', `translate(${p} ${p}) rotate(45) scale(${s} 1) rotate(-45) translate(${-p} ${-p}) matrix(0 -1 -1 0 ${c} ${c})`);
      r.flap?.setAttribute('opacity', k > 0.001 ? '1' : '0');
      // shading of the back: darker at the fold, light at the tip
      r.grad?.setAttribute('x1', String(p));
      r.grad?.setAttribute('y1', String(p));
      r.grad?.setAttribute('x2', String(CORNER / 2));
      r.grad?.setAttribute('y2', String(CORNER / 2));
      // the soft shadow the lifted corner casts
      r.shadow?.setAttribute('stdDeviation', String(0.6 + 1.6 * k));
      // the shade on the table where the corner has come away: the shape of
      // the lifted corner itself, soft, stronger as it lifts higher
      r.under?.setAttribute('opacity', (0.32 * k).toFixed(3));
      r.underClip?.setAttribute('points', `${c - 110},110 110,${c - 110} 120,120`);
    };
    set(0);
    if (reduce) return () => io?.disconnect();
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      // (the first frame's time can be a little earlier than t0: keep p in 0…1)
      if (visible && !document.hidden) set(peelAt((((now - t0) % PERIOD) + PERIOD) % PERIOD / PERIOD));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  const keep = (k) => (el) => {
    refs.current[k] = el;
  };
  return (
    <svg ref={keep('svg')} viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true" data-testid="sticker-peel">
      <defs>
        <clipPath id={`${id}-base`} clipPathUnits="userSpaceOnUse">
          <polygon ref={keep('base')} points="-10,-10 110,-10 110,110 -10,110" />
        </clipPath>
        <clipPath id={`${id}-tri`} clipPathUnits="userSpaceOnUse">
          <polygon ref={keep('tri')} points="110,110 110,110 110,110" />
        </clipPath>
        {/* the white back of the sticker, in the shape of the folded corner */}
        <filter id={`${id}-white`} x="-10%" y="-10%" width="120%" height="120%">
          <feFlood floodColor="#ffffff" />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
          <image href={src} x="0" y="0" width="100" height="100" filter={`url(#${id}-white)`} />
        </mask>
        <linearGradient ref={keep('grad')} id={`${id}-shade`} gradientUnits="userSpaceOnUse" x1="50" y1="50" x2="80" y2="80">
          <stop offset="0" stopColor="#d4d4cf" />
          <stop offset="0.35" stopColor="#efefeb" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <clipPath id={`${id}-under`} clipPathUnits="userSpaceOnUse">
          <polygon ref={keep('underClip')} points="110,110 110,110 110,110" />
        </clipPath>
        <filter id={`${id}-shade-under`} x="-10%" y="-10%" width="120%" height="120%">
          <feFlood floodColor="#3a2a1a" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id={`${id}-drop`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur ref={keep('shadow')} in="SourceAlpha" stdDeviation="0.6" />
          <feOffset dx="-0.6" dy="0.9" result="b" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.28" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g ref={keep('under')} opacity="0" clipPath={`url(#${id}-under)`}>
        <image href={src} x="0.6" y="1.2" width="100" height="100" filter={`url(#${id}-shade-under)`} />
      </g>
      <image href={src} x="0" y="0" width="100" height="100" clipPath={`url(#${id}-base)`} />
      <g filter={`url(#${id}-drop)`}>
        <g ref={keep('flap')} opacity="0">
          <g clipPath={`url(#${id}-tri)`}>
            <rect x="-20" y="-20" width="140" height="140" fill={`url(#${id}-shade)`} mask={`url(#${id}-mask)`} />
          </g>
        </g>
      </g>
    </svg>
  );
}
