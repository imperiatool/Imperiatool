// Asset library: categories, SVG elements and brand palette.
// Persisted in localStorage — swap the `storage` option for an API/DB
// adapter when you add a backend (see README → "Passare a un backend").
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { uid } from '../lib/id.js';
import { buildSeedLibrary } from '../data/seedLibrary.js';
import { withLabels } from '../data/labels.js';

export const LIBRARY_STORAGE_KEY = 'sticker-builder:library';
export const LIBRARY_VERSION = 2;

export const useLibraryStore = create(
  persist(
    (set, get) => ({
      seeded: false,
      categories: [],
      assets: [],
      palette: [],

      /* --- lifecycle ------------------------------------------------------ */
      ensureSeeded() {
        if (get().seeded) return;
        const seed = buildSeedLibrary();
        set({ ...seed, seeded: true });
      },
      resetToSeed() {
        const seed = buildSeedLibrary();
        set({ ...seed, seeded: true });
      },
      exportLibrary() {
        const { categories, assets, palette } = get();
        return { app: 'sticker-builder', version: LIBRARY_VERSION, exportedAt: new Date().toISOString(), categories, assets, palette };
      },
      importLibrary(data) {
        if (!data || !Array.isArray(data.categories) || !Array.isArray(data.assets) || !Array.isArray(data.palette)) {
          throw new Error('invalid-library');
        }
        set({ ...withLabels(data), seeded: true });
      },

      /* --- categories ----------------------------------------------------- */
      addCategory(partial) {
        const maxZ = Math.max(0, ...get().categories.map((c) => c.zIndex));
        const cat = {
          id: uid('cat'),
          name: 'Nuova categoria',
          zIndex: maxZ + 10,
          multiple: false,
          inRandom: true,
          required: false,
          anchor: { x: 0.5, y: 0.5 },
          fillOutlines: true,
          outlineFill: '#ffffff',
          isBase: false,
          size: 0.5,
          ...partial,
        };
        set({ categories: [...get().categories, cat] });
        return cat;
      },
      updateCategory(id, patch) {
        set({ categories: get().categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
      },
      deleteCategory(id) {
        set({
          categories: get().categories.filter((c) => c.id !== id),
          assets: get().assets.filter((a) => a.categoryId !== id),
        });
      },
      moveCategory(id, dir) {
        const list = [...get().categories];
        const i = list.findIndex((c) => c.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        set({ categories: list });
      },

      /* --- assets --------------------------------------------------------- */
      addAssets(newAssets) {
        const stamped = newAssets.map((a) => ({ id: uid('asset'), createdAt: Date.now(), ...a }));
        set({ assets: [...get().assets, ...stamped] });
        return stamped;
      },
      updateAsset(id, patch) {
        set({ assets: get().assets.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
      },
      deleteAsset(id) {
        set({ assets: get().assets.filter((a) => a.id !== id) });
      },
      moveAsset(id, dir) {
        const list = [...get().assets];
        const i = list.findIndex((a) => a.id === id);
        if (i < 0) return;
        const cat = list[i].categoryId;
        let j = i + dir;
        while (j >= 0 && j < list.length && list[j].categoryId !== cat) j += dir;
        if (j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        set({ assets: list });
      },

      /* --- palette -------------------------------------------------------- */
      addColor(color) {
        const c = { id: uid('c'), name: color.name || color.hex, hex: color.hex.toLowerCase() };
        set({ palette: [...get().palette, c] });
        return c;
      },
      updateColor(id, patch) {
        set({ palette: get().palette.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
      },
      deleteColor(id) {
        set({ palette: get().palette.filter((c) => c.id !== id) });
      },
      moveColor(id, dir) {
        const list = [...get().palette];
        const i = list.findIndex((c) => c.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        set({ palette: list });
      },
    }),
    {
      name: LIBRARY_STORAGE_KEY,
      version: LIBRARY_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ seeded, categories, assets, palette }) => ({ seeded, categories, assets, palette }),
      // v1 → v2: add translations to libraries saved before i18n
      migrate: (state, version) => {
        if (version < 2 && state?.categories) return { ...state, ...withLabels(state) };
        return state;
      },
    },
  ),
);

/* Selectors ---------------------------------------------------------------- */
export const selectCategoriesSorted = (s) => s.categories;
export function assetsByCategory(assets, categoryId) {
  return assets.filter((a) => a.categoryId === categoryId);
}
