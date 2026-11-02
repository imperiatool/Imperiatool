// Round pattern artwork, from the "Shapes available" icons printed on the
// Imperia phone-case box (raviolo, maccheroni and penne are drawn here in the
// same style). Shared by the configurator swatches and the box itself.
import icons from '../assets/packaging/shapeIcons.json';

const ICON_FOR = { spaghetti: 'spaghetti', tagliatelle: 'tagliatelle', reginette: 'reginette', sfoglia: 'sfoglia' };

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

/** Short tubes in staggered rows (maccheroni) or ridged diagonal tubes (penne). */
function tubes(line, { angle, len, r, sx, sy, ridges = 0 }) {
  const out = [];
  for (let row = -5; row <= 5; row++) {
    for (let k = -4; k <= 4; k++) {
      const u = k * sx + (row & 1) * sx * 0.5;
      const v = row * sy;
      out.push(`<rect x="${(u - len / 2).toFixed(2)}" y="${(v - r).toFixed(2)}" width="${len}" height="${r * 2}" rx="${r}" fill="none" stroke="${line}" stroke-width="0.6"/>`);
      for (let i = 1; i < ridges; i++) {
        const y = v - r + (2 * r * i) / ridges;
        out.push(`<line x1="${(u - len / 2 + r * 0.6).toFixed(2)}" y1="${y.toFixed(2)}" x2="${(u + len / 2 - r * 0.6).toFixed(2)}" y2="${y.toFixed(2)}" stroke="${line}" stroke-width="0.35"/>`);
      }
    }
  }
  return `<g transform="rotate(${angle})">${out.join('')}</g>`;
}

const DRAWN = {
  raviolo,
  maccheroni: (line) => tubes(line, { angle: 0, len: 8.5, r: 1.7, sx: 10.5, sy: 4.6 }),
  penne: (line) => tubes(line, { angle: -45, len: 11, r: 1.8, sx: 13.5, sy: 5, ridges: 3 }),
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
