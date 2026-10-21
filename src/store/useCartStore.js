// Shopping cart (persisted in this browser) and the visitor's profile.
// Prices are kept in EUR parts and converted for display (see i18n/convertPrice).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { uid } from '../lib/id.js';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, type: 'case' | 'charm', title, summary, preview, price: [eur...], qty, config }
      profile: null, // { name, email, phone }
      open: null, // 'cart' | 'account' | null (UI panel)

      add(item) {
        const entry = { id: uid('cart'), qty: 1, addedAt: Date.now(), ...item };
        set({ items: [...get().items, entry], open: 'cart' });
        return entry;
      },
      setQty(id, qty) {
        set({ items: get().items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(50, qty)) } : i)) });
      },
      remove(id) {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      clear() {
        set({ items: [] });
      },
      setProfile(profile) {
        set({ profile });
      },
      show(panel) {
        set({ open: panel });
      },
    }),
    {
      name: 'imperia:cart',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ items, profile }) => ({ items, profile }),
    },
  ),
);

export const cartCount = (items) => items.reduce((n, i) => n + i.qty, 0);
