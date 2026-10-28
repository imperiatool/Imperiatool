// Round pattern swatch for the configurator (artwork shared with the box).
import { useId, useMemo } from 'react';
import { patternMarkup } from '../../lib/patternArt.js';

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
