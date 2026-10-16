import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLibraryStore } from '../store/useLibraryStore.js';

/** Library data + lookup maps, memoised. */
export function useLibrary() {
  const { categories, assets, palette } = useLibraryStore(
    useShallow((s) => ({ categories: s.categories, assets: s.assets, palette: s.palette })),
  );
  return useMemo(
    () => ({
      categories,
      assets,
      palette,
      assetsById: Object.fromEntries(assets.map((a) => [a.id, a])),
      categoriesById: Object.fromEntries(categories.map((c) => [c.id, c])),
    }),
    [categories, assets, palette],
  );
}
