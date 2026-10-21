// Translations of the sample library (categories, colours, elements) and the
// small fixes applied to saved libraries when the app is updated.
// Admins can edit/add translations for any item in the Admin panel.

const L = (en, it, es, fr, de, zh, hi) => ({ en, it, es, fr, de, zh, hi });

export const CATEGORY_LABELS = {
  'cat-corpi': L('Bodies', 'Corpi', 'Cuerpos', 'Corps', 'Körper', '身体', 'शरीर'),
  'cat-occhi': L('Eyes', 'Occhi', 'Ojos', 'Yeux', 'Augen', '眼睛', 'आँखें'),
  'cat-bocche': L('Mouths', 'Bocche', 'Bocas', 'Bouches', 'Münder', '嘴巴', 'मुँह'),
  'cat-accessori': L('Accessories', 'Accessori', 'Accesorios', 'Accessoires', 'Accessoires', '配饰', 'एक्सेसरीज़'),
  'cat-materiali': L('Materials', 'Materiali', 'Materiales', 'Matières', 'Materialien', '材质', 'सामग्री'),
};

// Imperia colour names: tomato, basil, ragù, egg, flour
export const COLOR_LABELS = {
  'c-rosso': L('Tomato', 'Pomodoro', 'Tomate', 'Tomate', 'Tomate', '番茄', 'टमाटर'),
  'c-verde': L('Basil', 'Basilico', 'Albahaca', 'Basilic', 'Basilikum', '罗勒', 'तुलसी'),
  'c-marrone': L('Ragù', 'Ragù', 'Ragú', 'Ragù', 'Ragù', '肉酱', 'रागू'),
  'c-ambra': L('Egg', 'Uovo', 'Huevo', 'Œuf', 'Ei', '蛋黄', 'अंडा'),
  'c-crema': L('Flour', 'Farina', 'Harina', 'Farine', 'Mehl', '面粉', 'आटा'),
};
const COLOR_NAMES = { 'c-rosso': 'Pomodoro', 'c-verde': 'Basilico', 'c-marrone': 'Ragù', 'c-ambra': 'Uovo', 'c-crema': 'Farina' };

// keyed by the Italian name used in the seed
export const ASSET_LABELS = {
  // bodies
  'Tortellino classico': L('Classic tortellino', 'Tortellino classico', 'Tortellino clásico', 'Tortellino classique', 'Klassischer Tortellino', '经典意式饺', 'क्लासिक टॉर्टेलिनो'),
  'Raviolo classico': L('Classic raviolo', 'Raviolo classico', 'Raviolo clásico', 'Raviolo classique', 'Klassischer Raviolo', '经典方饺', 'क्लासिक रैवियोलो'),
  'Raviolo gigante': L('Giant raviolo', 'Raviolo gigante', 'Raviolo gigante', 'Raviolo géant', 'Riesen-Raviolo', '巨型圆饺', 'जायंट रैवियोलो'),
  Tagliatella: L('Tagliatella', 'Tagliatella', 'Tagliatella', 'Tagliatelle', 'Tagliatella', '宽面', 'टैग्लियाटेला'),
  // eyes
  Reginette: L('Reginette', 'Reginette', 'Reginette', 'Reginette', 'Reginette', '花边面', 'रेजिनेट'),
  Bucatini: L('Bucatini', 'Bucatini', 'Bucatini', 'Bucatini', 'Bucatini', '吸管面', 'बुकाटिनी'),
  Orecchiette: L('Orecchiette', 'Orecchiette', 'Orecchiette', 'Orecchiette', 'Orecchiette', '猫耳朵面', 'ओरेकिएट'),
  'Ravioli quadrati': L('Square ravioli', 'Ravioli quadrati', 'Ravioli cuadrados', 'Ravioli carrés', 'Eckige Ravioli', '方形饺', 'चौकोर रैवियोली'),
  'Ravioli triangolari': L('Triangle ravioli', 'Ravioli triangolari', 'Ravioli triangulares', 'Ravioli triangulaires', 'Dreieckige Ravioli', '三角饺', 'तिकोनी रैवियोली'),
  'Ravioli tondi': L('Round ravioli', 'Ravioli tondi', 'Ravioli redondos', 'Ravioli ronds', 'Runde Ravioli', '圆形饺', 'गोल रैवियोली'),
  // mouths: named after pasta shapes
  Maccheroni: L('Macaroni', 'Maccheroni', 'Macarrones', 'Macaronis', 'Makkaroni', '通心粉', 'मैकरोनी'),
  Anelli: L('Anelli', 'Anelli', 'Anillos', 'Anneaux', 'Anelli', '圈圈面', 'अनेली'),
  Conchiglia: L('Shell', 'Conchiglia', 'Concha', 'Coquillage', 'Muschel', '贝壳面', 'शेल पास्ता'),
  Lasagnetta: L('Lasagnetta', 'Lasagnetta', 'Lasagnetta', 'Lasagnetta', 'Lasagnetta', '千层面片', 'लज़ानिएटा'),
  Cavatappi: L('Cavatappi', 'Cavatappi', 'Sacacorchos', 'Tire-bouchons', 'Korkenzieher', '螺旋面', 'कावाटाप्पी'),
  Gnocchi: L('Gnocchi', 'Gnocchi', 'Ñoquis', 'Gnocchis', 'Gnocchi', '团子', 'न्योकी'),
};

// old sample names → current names (libraries saved by earlier versions)
export const ASSET_RENAMES = {
  Triangolo: 'Tortellino classico',
  Tortellino: 'Raviolo classico',
  Cerchio: 'Raviolo gigante',
  'Raviolo triangolare': 'Tortellino classico',
  'Raviolo quadrato': 'Raviolo classico',
  'Raviolo tondo': 'Raviolo gigante',
  'Tortellini quadrati': 'Ravioli quadrati',
  'Tortellini triangolari': 'Ravioli triangolari',
  'Tortellini tondi': 'Ravioli tondi',
  Sorriso: 'Maccheroni',
  Stupita: 'Anelli',
  Bacio: 'Conchiglia',
  Baffo: 'Cavatappi',
  Labbra: 'Gnocchi',
};

/* ---- colours: only the brand palette, never black ----------------------- */
const rgb = (hex) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const isHex = (h) => typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h);

/** Nearest palette colour; near-black becomes ragù (brown), never basil. */
export function snapToPalette(hex, palette) {
  if (!isHex(hex) || !palette.length) return hex;
  if (palette.some((p) => p.hex.toLowerCase() === hex.toLowerCase())) return hex.toLowerCase();
  const [r, g, b] = rgb(hex);
  if (0.2126 * r + 0.7152 * g + 0.0722 * b < 40) {
    const brown = palette.find((p) => p.id === 'c-marrone');
    if (brown) return brown.hex;
  }
  let best = palette[0].hex;
  let bestD = Infinity;
  for (const p of palette) {
    const [pr, pg, pb] = rgb(p.hex);
    const d = (pr - r) ** 2 * 0.3 + (pg - g) ** 2 * 0.59 + (pb - b) ** 2 * 0.11;
    if (d < bestD) [best, bestD] = [p.hex, d];
  }
  return best;
}

/** Default colours of an element snapped to the palette (no black). */
export function snapAssetColors(asset, palette) {
  if (!asset.slots?.length || !palette?.length) return asset;
  let changed = false;
  const slots = asset.slots.map((s) => {
    const original = snapToPalette(s.original, palette);
    if (original === s.original) return s;
    changed = true;
    return { ...s, original };
  });
  return changed ? { ...asset, slots } : asset;
}

/** Eyes: "Base" is the eye, the inner fill is the pupil. */
function withEyeRoles(asset) {
  if (asset.categoryId !== 'cat-occhi' || !asset.slots) return asset;
  const slots = asset.slots.map((s) => {
    if (s.role) return s;
    const m = String(s.label || '').match(/^(\S+)/);
    const word = m?.[1]?.toLowerCase();
    if (word === 'base') return { ...s, role: 'eye' };
    if (word === 'riempimento' || word === 'dettagli') return { ...s, role: 'pupil' };
    return s;
  });
  return { ...asset, slots };
}

/**
 * Brings a library (seed, import or saved by an older version) up to date:
 * translations, current element names, eye/pupil zones, palette-only colours.
 * `force` refreshes the labels of the sample items (used by migrations).
 */
export function withLabels({ categories, palette, assets }, { force = false } = {}) {
  const pal = palette.map((c) => {
    if (!COLOR_LABELS[c.id]) return c;
    if (force) return { ...c, name: COLOR_NAMES[c.id], labels: COLOR_LABELS[c.id] };
    return c.labels ? c : { ...c, labels: COLOR_LABELS[c.id] };
  });
  return {
    categories: categories.map((c) => (CATEGORY_LABELS[c.id] && (force || !c.labels) ? { ...c, labels: CATEGORY_LABELS[c.id] } : c)),
    palette: pal,
    assets: assets.map((a) => {
      let out = a;
      const renamed = ASSET_RENAMES[a.name];
      if (renamed) out = { ...a, name: renamed, labels: ASSET_LABELS[renamed] };
      else if (ASSET_LABELS[a.name] && (force || !a.labels)) out = { ...a, labels: ASSET_LABELS[a.name] };
      return snapAssetColors(withEyeRoles(out), pal);
    }),
  };
}
