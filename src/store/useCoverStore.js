// Phone-cover configurator state (persisted so a refresh keeps the design).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { COVER_OPTIONS } from '../data/defaults.js';

export const useCoverStore = create(
  persist(
    (set) => ({
      pattern: 'tagliatelle',
      color: '#ffb548',
      material: 'aldente',
      model: COVER_OPTIONS.models[0].id,
      set: (patch) => set(patch),
    }),
    { name: 'imperia:cover', storage: createJSONStorage(() => localStorage) },
  ),
);
