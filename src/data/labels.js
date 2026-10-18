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
  // bodies
  'Raviolo triangolare': { en: 'Triangle raviolo', it: 'Raviolo triangolare', es: 'Raviolo triangular', fr: 'Raviolo triangulaire' },
  'Raviolo quadrato': { en: 'Square raviolo', it: 'Raviolo quadrato', es: 'Raviolo cuadrado', fr: 'Raviolo carré' },
  'Raviolo tondo': { en: 'Round raviolo', it: 'Raviolo tondo', es: 'Raviolo redondo', fr: 'Raviolo rond' },
  Tagliatella: { en: 'Tagliatella', it: 'Tagliatella', es: 'Tagliatella', fr: 'Tagliatelle' },
  // eyes
  Reginette: { en: 'Reginette', it: 'Reginette', es: 'Reginette', fr: 'Reginette' },
  Bucatini: { en: 'Bucatini', it: 'Bucatini', es: 'Bucatini', fr: 'Bucatini' },
  Orecchiette: { en: 'Orecchiette', it: 'Orecchiette', es: 'Orecchiette', fr: 'Orecchiette' },
  'Ravioli quadrati': { en: 'Square ravioli', it: 'Ravioli quadrati', es: 'Ravioli cuadrados', fr: 'Ravioli carrés' },
  'Ravioli triangolari': { en: 'Triangle ravioli', it: 'Ravioli triangolari', es: 'Ravioli triangulares', fr: 'Ravioli triangulaires' },
  'Ravioli tondi': { en: 'Round ravioli', it: 'Ravioli tondi', es: 'Ravioli redondos', fr: 'Ravioli ronds' },
  // mouths: named after pasta shapes
  Maccheroni: { en: 'Macaroni', it: 'Maccheroni', es: 'Macarrones', fr: 'Macaronis' },
  Anelli: { en: 'Anelli', it: 'Anelli', es: 'Anillos', fr: 'Anneaux' },
  Conchiglia: { en: 'Shell', it: 'Conchiglia', es: 'Concha', fr: 'Coquillage' },
  Lasagnetta: { en: 'Lasagnetta', it: 'Lasagnetta', es: 'Lasagnetta', fr: 'Lasagnetta' },
  Cavatappi: { en: 'Cavatappi', it: 'Cavatappi', es: 'Sacacorchos', fr: 'Tire-bouchons' },
  Gnocchi: { en: 'Gnocchi', it: 'Gnocchi', es: 'Ñoquis', fr: 'Gnocchis' },
};

// old sample names → new pasta names (libraries saved by earlier versions)
export const ASSET_RENAMES = {
  Triangolo: 'Raviolo triangolare',
  Tortellino: 'Raviolo quadrato',
  Cerchio: 'Raviolo tondo',
  'Tortellini quadrati': 'Ravioli quadrati',
  'Tortellini triangolari': 'Ravioli triangolari',
  'Tortellini tondi': 'Ravioli tondi',
  Sorriso: 'Maccheroni',
  Stupita: 'Anelli',
  Bacio: 'Conchiglia',
  Baffo: 'Cavatappi',
  Labbra: 'Gnocchi',
};

/** Adds missing translations to a library saved before i18n existed. */
export function withLabels({ categories, palette, assets }) {
  return {
    categories: categories.map((c) => (c.labels || !CATEGORY_LABELS[c.id] ? c : { ...c, labels: CATEGORY_LABELS[c.id] })),
    palette: palette.map((c) => (c.labels || !COLOR_LABELS[c.id] ? c : { ...c, labels: COLOR_LABELS[c.id] })),
    assets: assets.map((a) => {
      const renamed = ASSET_RENAMES[a.name];
      if (renamed) return { ...a, name: renamed, labels: ASSET_LABELS[renamed] };
      return a.labels || !ASSET_LABELS[a.name] ? a : { ...a, labels: ASSET_LABELS[a.name] };
    }),
  };
}
