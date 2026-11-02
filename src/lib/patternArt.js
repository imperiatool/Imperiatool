// Round pattern artwork, from the "Shapes available" icons printed on the
// Imperia phone-case box (raviolo is drawn here in the same style). Shared by the configurator swatches and the box itself.
import icons from '../assets/packaging/shapeIcons.json';

const ICON_FOR = { ravioli: 'ravioli', spaghetti: 'spaghetti', tagliatelle: 'tagliatelle', reginette: 'reginette', sfoglia: 'sfoglia' };

function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Crimped raviolo: a pillow with a ring of fork marks. */
function raviolo(line) {
  const dots = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    return `<circle cx="${(13.2 * Math.cos(a)).toFixed(2)}" cy="${(13.2 * Math.sin(a)).toFixed(2)}" r="1.05" fill="none" stroke="${line}" stroke-width="0.6"/>`;
  }).join('');
  return `<circle r="16.2" fill="none" stroke="${line}" stroke-width="0.6"/><circle r="10.4" fill="none" stroke="${line}" stroke-width="0.6"/>${dots}`;
}

const DRAWN = {
  raviolo,
};

/** SVG markup of a pattern in a 40×40 box centred on 0 (clip it to a circle of r 19.86). */
export function patternMarkup(pattern, color) {
  const line = luminance(color) > 0.72 ? 'rgba(29,29,27,0.45)' : '#ffffff';
  if (DRAWN[pattern]) return DRAWN[pattern](line);
  const key = ICON_FOR[pattern] || 'spaghetti';
  return icons[key]
    .replace(/fill="rgb\(253, 180, 72\)"/g, `fill="${color}"`)
    .replace(/stroke="rgb\(255, 255, 255\)"/g, `stroke="${line}"`)
    .replace(/stroke-width="0\.25px"/g, 'stroke-width="0.55"');
}
