// Phone-case configurator state (persisted so a refresh keeps the design).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { COVER_OPTIONS } from '../data/defaults.js';

// old pattern ids → current ones (Ravioli was replaced by Reginette)
const RENAMED = { spighe: 'reginette', ravioli: 'reginette' };

export const useCoverStore = create(
  persist(
    (set) => ({
      pattern: 'tagliatelle',
      color: '#ffb548',
      material: 'aldente',
      model: COVER_OPTIONS.models[0].id,
      set: (patch) => set(patch),
    }),
    {
      name: 'imperia:cover',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (state) => {
        const s = { ...state };
        s.pattern = RENAMED[s.pattern] || s.pattern;
        if (String(s.color).toLowerCase() === '#e3201b') s.color = '#e1201b';
        if (!COVER_OPTIONS.patterns.includes(s.pattern)) s.pattern = 'tagliatelle';
        if (!COVER_OPTIONS.models.some((m) => m.id === s.model)) s.model = COVER_OPTIONS.models[0].id;
        return s;
      },
    },
  ),
);
