// Round pattern swatches, drawn from the "Shapes available" icons printed on
// the Imperia phone-case box. Shapes take the chosen colour, lines stay light.
import { useId, useMemo } from 'react';
import icons from '../../assets/packaging/shapeIcons.json';

// pattern id → icon on the box (raviolo has no box icon: drawn here)
const ICON_FOR = { spaghetti: 'spaghetti', tagliatelle: 'tagliatelle', ravioli: 'ravioli', reginette: 'reginette', sfoglia: 'sfoglia' };

function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Crimped raviolo: a pillow with a ring of fork marks. */
function ravioloMarkup(line) {
  const dots = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    return `<circle cx="${(13.2 * Math.cos(a)).toFixed(2)}" cy="${(13.2 * Math.sin(a)).toFixed(2)}" r="1.05" fill="none" stroke="${line}" stroke-width="0.6"/>`;
  }).join('');
  return `<circle r="16.2" fill="none" stroke="${line}" stroke-width="0.6"/><circle r="10.4" fill="none" stroke="${line}" stroke-width="0.6"/>${dots}`;
}

export function patternMarkup(pattern, color) {
  const line = luminance(color) > 0.72 ? 'rgba(29,29,27,0.45)' : '#ffffff';
  const key = ICON_FOR[pattern];
  if (!key) return ravioloMarkup(line);
  return icons[key]
    .replace(/fill="rgb\(253, 180, 72\)"/g, `fill="${color}"`)
    .replace(/stroke="rgb\(255, 255, 255\)"/g, `stroke="${line}"`)
    .replace(/stroke-width="0\.25px"/g, 'stroke-width="0.55"');
}

export default function PatternIcon({ pattern, color, className = 'h-14 w-14' }) {
  const clip = useId().replace(/:/g, '');
  const inner = useMemo(() => patternMarkup(pattern, color), [pattern, color]);
  return (
    <svg viewBox="-20 -20 40 40" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <circle r="19.86" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x="-21" y="-21" width="42" height="42" fill={color} />
        <g dangerouslySetInnerHTML={{ __html: inner }} />
      </g>
    </svg>
  );
}
