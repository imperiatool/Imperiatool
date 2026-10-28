// Imperia® Stickers: the visitor's collection of sticker designs (kept in this
// browser). Each entry stores the full design (the editor items, so it can be
// reopened and changed), a small preview and the quantity wanted in print.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { uid } from '../lib/id.js';

export const MAX_STICKERS = 24;
export const MAX_QTY = 50;

const copy = (items) => JSON.parse(JSON.stringify(items));

export const useStickerCollection = create(
  persist(
    (set, get) => ({
      stickers: [], // { id, items, thumb, qty, updatedAt }
      editingId: null, // the collection sticker open in the editor (null = a new design)

      /** Adds a design; returns its id (null when the collection is full). */
      add(items, thumb) {
        if (get().stickers.length >= MAX_STICKERS) return null;
        const entry = { id: uid('stk'), items: copy(items), thumb, qty: 1, updatedAt: Date.now() };
        set({ stickers: [...get().stickers, entry], editingId: entry.id });
        return entry.id;
      },
      update(id, items, thumb) {
        set({ stickers: get().stickers.map((s) => (s.id === id ? { ...s, items: copy(items), thumb, updatedAt: Date.now() } : s)) });
      },
      remove(id) {
        set({ stickers: get().stickers.filter((s) => s.id !== id), editingId: get().editingId === id ? null : get().editingId });
      },
      setQty(id, qty) {
        const q = Math.max(1, Math.min(MAX_QTY, Math.round(Number(qty) || 1)));
        set({ stickers: get().stickers.map((s) => (s.id === id ? { ...s, qty: q } : s)) });
      },
      setEditing(id) {
        set({ editingId: id });
      },
    }),
    { name: 'imperia:sticker-collection', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

/** True when the editor shows exactly the saved design. */
export const sameDesign = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const copyItems = copy;
