// First-run library: the sample Illustrator file is imported with the very
// same pipeline the Admin panel uses, so the seed doubles as a live example.
import sampleSvg from './seed/pasta-characters.svg?raw';
import { DEFAULT_CATEGORIES, DEFAULT_PALETTE } from './defaults.js';
import { parseSvgText, extractElements, elementsToAssets } from '../lib/svgParser.js';
import { uid } from '../lib/id.js';

// layer id in the SVG → category + names (in reading order: rows, then left→right)
const SEED_LAYERS = [
  {
    layer: 'Body',
    categoryId: 'cat-corpi',
    names: ['Triangolo', 'Tortellino', 'Cerchio', 'Tagliatella'],
  },
  {
    layer: 'Eyes',
    categoryId: 'cat-occhi',
    names: ['Reginette', 'Bucatini', 'Orecchiette', 'Tortellini quadrati', 'Tortellini triangolari', 'Tortellini tondi'],
  },
  {
    layer: 'Mouths',
    categoryId: 'cat-bocche',
    names: ['Sorriso', 'Stupita', 'Bacio', 'Lasagnetta', 'Baffo', 'Labbra'],
  },
];

export function buildSeedLibrary() {
  const parsed = parseSvgText(sampleSvg);
  const assets = [];
  for (const cfg of SEED_LAYERS) {
    const layer = parsed.layers.find((l) => l.id === cfg.layer);
    if (!layer) continue;
    const category = DEFAULT_CATEGORIES.find((c) => c.id === cfg.categoryId);
    const elements = extractElements(parsed, layer, { mode: 'auto', tolerance: 40 });
    const built = elementsToAssets(elements, {
      fillOutlines: category.fillOutlines,
      outlineFill: category.outlineFill,
    });
    built.forEach((a, i) =>
      assets.push({
        id: uid('asset'),
        categoryId: cfg.categoryId,
        name: cfg.names[i] || `${category.name} ${i + 1}`,
        source: { file: 'pasta-characters.svg', layer: cfg.layer },
        createdAt: Date.now(),
        ...a,
      }),
    );
  }
  return {
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    palette: DEFAULT_PALETTE.map((c) => ({ ...c })),
    assets,
  };
}
