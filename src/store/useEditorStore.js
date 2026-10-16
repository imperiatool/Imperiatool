// Canvas state: placed items, selection, undo/redo history.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { uid } from '../lib/id.js';
import { newItem, insertionIndex, placementFor, randomComposition, remapColors } from '../lib/composition.js';

const HISTORY_LIMIT = 80;

export const useEditorStore = create(
  persist(
    (set, get) => {
      /** Saves the current items for undo; call before a change. */
      const snapshot = () => {
        const { items, past } = get();
        set({ past: [...past.slice(-HISTORY_LIMIT + 1), items], future: [] });
      };

      return {
        items: [],
        selectedId: null,
        background: null, // null = transparent, otherwise a palette hex
        past: [],
        future: [],

        snapshot,

        select(id) {
          set({ selectedId: id });
        },

        /** Adds an element (or replaces the one of the same category when `multiple` is false). */
        addAsset(asset, library) {
          const categoriesById = Object.fromEntries(library.categories.map((c) => [c.id, c]));
          const assetsById = Object.fromEntries(library.assets.map((a) => [a.id, a]));
          const category = categoriesById[asset.categoryId];
          if (!category) return;
          snapshot();
          const items = get().items;
          if (!category.multiple) {
            const existing = items.find((it) => it.categoryId === category.id);
            if (existing) {
              const oldAsset = assetsById[existing.assetId];
              const replaced = {
                ...existing,
                assetId: asset.id,
                colors: remapColors(oldAsset, asset, existing.colors),
              };
              set({ items: items.map((it) => (it.uid === existing.uid ? replaced : it)), selectedId: existing.uid });
              return;
            }
          }
          const item = newItem(asset, category, placementFor(asset, category, items, assetsById, categoriesById));
          const at = insertionIndex(items, category, categoriesById);
          set({ items: [...items.slice(0, at), item, ...items.slice(at)], selectedId: item.uid });
        },

        /** Live update (no history entry): use during drags/slider moves, after `snapshot()`. */
        updateItem(id, patch) {
          set({ items: get().items.map((it) => (it.uid === id ? { ...it, ...patch } : it)) });
        },

        /** Update + history entry: for discrete actions (buttons, colour clicks). */
        commitItem(id, patch) {
          snapshot();
          get().updateItem(id, patch);
        },

        setColor(id, slotId, hex) {
          const it = get().items.find((i) => i.uid === id);
          if (!it) return;
          const colors = { ...it.colors };
          if (hex) colors[slotId] = hex;
          else delete colors[slotId];
          get().commitItem(id, { colors });
        },

        removeItem(id) {
          snapshot();
          set({ items: get().items.filter((it) => it.uid !== id), selectedId: null });
        },

        duplicateItem(id) {
          const items = get().items;
          const i = items.findIndex((it) => it.uid === id);
          if (i < 0) return;
          snapshot();
          const copy = { ...items[i], uid: uid('item'), x: items[i].x + 40, y: items[i].y + 40, colors: { ...items[i].colors } };
          set({ items: [...items.slice(0, i + 1), copy, ...items.slice(i + 1)], selectedId: copy.uid });
        },

        moveLayer(id, dir) {
          const items = [...get().items];
          const i = items.findIndex((it) => it.uid === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= items.length) return;
          snapshot();
          [items[i], items[j]] = [items[j], items[i]];
          set({ items });
        },

        randomize(library) {
          const items = randomComposition(library);
          if (!items.length) return;
          snapshot();
          set({ items, selectedId: null });
        },

        clear() {
          if (!get().items.length) return;
          snapshot();
          set({ items: [], selectedId: null });
        },

        setBackground(hex) {
          set({ background: hex });
        },

        /** Removes items whose asset was deleted from the library. */
        pruneMissing(assetIds) {
          const ids = new Set(assetIds);
          const items = get().items.filter((it) => ids.has(it.assetId));
          if (items.length !== get().items.length) set({ items, selectedId: null });
        },

        undo() {
          const { past, items, future } = get();
          if (!past.length) return;
          set({ items: past[past.length - 1], past: past.slice(0, -1), future: [items, ...future], selectedId: null });
        },
        redo() {
          const { past, items, future } = get();
          if (!future.length) return;
          set({ items: future[0], future: future.slice(1), past: [...past, items], selectedId: null });
        },
      };
    },
    {
      name: 'sticker-builder:editor',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ items, background }) => ({ items, background }),
    },
  ),
);
