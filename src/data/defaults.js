// Default configuration: brand palette, categories and canvas settings.
// Everything here can be changed later from the Admin panel; these values
// are only used on first launch or after "Ripristina libreria".

export const CANVAS_SIZE = 1400; // canvas user units (square artboard)

// Brand palette taken from "Colour_Palette.svg".
export const DEFAULT_PALETTE = [
  { id: 'c-rosso', name: 'Rosso Pomodoro', hex: '#e3201b' },
  { id: 'c-verde', name: 'Verde Basilico', hex: '#1a5632' },
  { id: 'c-marrone', name: 'Marrone Cacao', hex: '#6a3933' },
  { id: 'c-ambra', name: 'Ambra', hex: '#ffb548' },
  { id: 'c-crema', name: 'Crema', hex: '#f8eabe' },
];

/**
 * Category fields:
 *  - zIndex:        drawing order on the canvas (higher = on top)
 *  - multiple:      false → selecting a new element replaces the existing one
 *  - inRandom:      included by the "Randomizza" button
 *  - required:      Randomizza always picks one (otherwise 50% chance)
 *  - anchor:        default position on the canvas (0..1 of the artboard)
 *  - fillOutlines:  outline-only closed shapes get a fillable "Base" slot on import
 *  - outlineFill:   default colour of that Base slot
 *  - size:          base → share of the canvas; others → width relative to the base
 *  - isBase:        other elements are placed and scaled relative to this one (e.g. the body)
 */
export const DEFAULT_CATEGORIES = [
  { id: 'cat-corpi', name: 'Corpi', isBase: true, size: 0.7, zIndex: 10, multiple: false, inRandom: true, required: true, anchor: { x: 0.5, y: 0.5 }, fillOutlines: true, outlineFill: '#e3201b' },
  { id: 'cat-occhi', name: 'Occhi', size: 0.62, zIndex: 20, multiple: false, inRandom: true, required: true, anchor: { x: 0.5, y: 0.3 }, fillOutlines: true, outlineFill: '#ffb548' },
  { id: 'cat-bocche', name: 'Bocche', size: 0.5, zIndex: 30, multiple: false, inRandom: true, required: true, anchor: { x: 0.5, y: 0.66 }, fillOutlines: true, outlineFill: '#6a3933' },
  { id: 'cat-accessori', name: 'Accessori', size: 0.5, zIndex: 40, multiple: true, inRandom: true, required: false, anchor: { x: 0.5, y: 0.12 }, fillOutlines: true, outlineFill: '#1a5632' },
  { id: 'cat-materiali', name: 'Materiali', size: 1, zIndex: 5, multiple: false, inRandom: false, required: false, anchor: { x: 0.5, y: 0.5 }, fillOutlines: false, outlineFill: '#f8eabe' },
];

export const CHARM_OPTIONS = {
  sizes: [
    { id: '3cm', label: '3 cm', price: 9.9 },
    { id: '4cm', label: '4 cm', price: 12.9 },
    { id: '5cm', label: '5 cm', price: 15.9 },
  ],
  finishes: [
    { id: 'opaco', label: 'Opaco' },
    { id: 'lucido', label: 'Lucido' },
    { id: 'glitter', label: 'Glitter' },
  ],
  attachments: [
    { id: 'portachiavi', label: 'Portachiavi' },
    { id: 'catenina', label: 'Catenina' },
    { id: 'spilla', label: 'Spilla' },
  ],
};
