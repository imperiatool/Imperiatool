// Translations of the sample library (categories, colours, elements).
// Admins can edit/add translations for any item in the Admin panel.

export const CATEGORY_LABELS = {
  'cat-corpi': { en: 'Bodies', it: 'Corpi', es: 'Cuerpos', fr: 'Corps' },
  'cat-occhi': { en: 'Eyes', it: 'Occhi', es: 'Ojos', fr: 'Yeux' },
  'cat-bocche': { en: 'Mouths', it: 'Bocche', es: 'Bocas', fr: 'Bouches' },
  'cat-accessori': { en: 'Accessories', it: 'Accessori', es: 'Accesorios', fr: 'Accessoires' },
  'cat-materiali': { en: 'Materials', it: 'Materiali', es: 'Materiales', fr: 'Matières' },
};

export const COLOR_LABELS = {
  'c-rosso': { en: 'Tomato Red', it: 'Rosso Pomodoro', es: 'Rojo Tomate', fr: 'Rouge Tomate' },
  'c-verde': { en: 'Basil Green', it: 'Verde Basilico', es: 'Verde Albahaca', fr: 'Vert Basilic' },
  'c-marrone': { en: 'Cocoa Brown', it: 'Marrone Cacao', es: 'Marrón Cacao', fr: 'Brun Cacao' },
  'c-ambra': { en: 'Amber', it: 'Ambra', es: 'Ámbar', fr: 'Ambre' },
  'c-crema': { en: 'Cream', it: 'Crema', es: 'Crema', fr: 'Crème' },
};

// keyed by the Italian name used in the seed
export const ASSET_LABELS = {
  Triangolo: { en: 'Triangle', it: 'Triangolo', es: 'Triángulo', fr: 'Triangle' },
  Tortellino: { en: 'Tortellino', it: 'Tortellino', es: 'Tortellino', fr: 'Tortellino' },
  Cerchio: { en: 'Circle', it: 'Cerchio', es: 'Círculo', fr: 'Cercle' },
  Tagliatella: { en: 'Tagliatella', it: 'Tagliatella', es: 'Tagliatella', fr: 'Tagliatella' },
  Reginette: { en: 'Reginette', it: 'Reginette', es: 'Reginette', fr: 'Reginette' },
  Bucatini: { en: 'Bucatini', it: 'Bucatini', es: 'Bucatini', fr: 'Bucatini' },
  Orecchiette: { en: 'Orecchiette', it: 'Orecchiette', es: 'Orecchiette', fr: 'Orecchiette' },
  'Tortellini quadrati': { en: 'Square tortellini', it: 'Tortellini quadrati', es: 'Tortellini cuadrados', fr: 'Tortellini carrés' },
  'Tortellini triangolari': { en: 'Triangle tortellini', it: 'Tortellini triangolari', es: 'Tortellini triangulares', fr: 'Tortellini triangulaires' },
  'Tortellini tondi': { en: 'Round tortellini', it: 'Tortellini tondi', es: 'Tortellini redondos', fr: 'Tortellini ronds' },
  Sorriso: { en: 'Smile', it: 'Sorriso', es: 'Sonrisa', fr: 'Sourire' },
  Stupita: { en: 'Surprised', it: 'Stupita', es: 'Sorprendida', fr: 'Étonnée' },
  Bacio: { en: 'Kiss', it: 'Bacio', es: 'Beso', fr: 'Bisou' },
  Lasagnetta: { en: 'Lasagnetta', it: 'Lasagnetta', es: 'Lasagnetta', fr: 'Lasagnetta' },
  Baffo: { en: 'Moustache', it: 'Baffo', es: 'Bigote', fr: 'Moustache' },
  Labbra: { en: 'Lips', it: 'Labbra', es: 'Labios', fr: 'Lèvres' },
};

/** Adds missing translations to a library saved before i18n existed. */
export function withLabels({ categories, palette, assets }) {
  return {
    categories: categories.map((c) => (c.labels || !CATEGORY_LABELS[c.id] ? c : { ...c, labels: CATEGORY_LABELS[c.id] })),
    palette: palette.map((c) => (c.labels || !COLOR_LABELS[c.id] ? c : { ...c, labels: COLOR_LABELS[c.id] })),
    assets: assets.map((a) => (a.labels || !ASSET_LABELS[a.name] ? a : { ...a, labels: ASSET_LABELS[a.name] })),
  };
}
