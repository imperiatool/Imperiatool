// Color helpers: normalisation to #rrggbb, luminance, contrast picking.

const NAMED = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  gray: '#808080',
  grey: '#808080',
  orange: '#ffa500',
  purple: '#800080',
};

/**
 * Normalises any CSS colour we expect from design tools to lowercase #rrggbb.
 * Returns 'none' for none/transparent, null for values we cannot recolour
 * (url(#gradient), currentColor, inherit…), which are left untouched.
 */
export function normalizeColor(value) {
  if (value == null) return null;
  const v = String(value).trim().toLowerCase();
  if (!v) return null;
  if (v === 'none' || v === 'transparent') return 'none';
  if (NAMED[v]) return NAMED[v];
  let m = v.match(/^#([0-9a-f]{3})$/);
  if (m) {
    const [r, g, b] = m[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  m = v.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/);
  if (m) return `#${m[1]}`;
  m = v.match(/^rgba?\(\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)/);
  if (m) {
    const ch = (s) => {
      const n = s.endsWith('%') ? (parseFloat(s) * 255) / 100 : parseFloat(s);
      return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    };
    return `#${ch(m[1])}${ch(m[2])}${ch(m[3])}`;
  }
  return null;
}

export function isHex(value) {
  return /^#[0-9a-f]{6}$/i.test(value || '');
}

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Picks the palette colour with the best contrast against `against`. */
export function bestContrast(paletteHexes, against) {
  let best = paletteHexes[0];
  let bestRatio = -1;
  for (const hex of paletteHexes) {
    const r = contrastRatio(hex, against);
    if (r > bestRatio) {
      bestRatio = r;
      best = hex;
    }
  }
  return best;
}
