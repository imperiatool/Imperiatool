// Phone-case configurator state (persisted so a refresh keeps the design).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { COVER_OPTIONS } from '../data/defaults.js';

const RENAMED = { spighe: 'reginette' };

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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (state) => {
        const s = { ...state };
        s.pattern = RENAMED[s.pattern] || s.pattern;
        if (!COVER_OPTIONS.patterns.includes(s.pattern)) s.pattern = 'tagliatelle';
        if (!COVER_OPTIONS.models.some((m) => m.id === s.model)) s.model = COVER_OPTIONS.models[0].id;
        return s;
      },
    },
  ),
);
