import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header.jsx';
import EditorPage from './components/editor/EditorPage.jsx';
import AdminPage from './components/admin/AdminPage.jsx';
import { useLibraryStore } from './store/useLibraryStore.js';
import { useEditorStore } from './store/useEditorStore.js';

export default function App() {
  const seeded = useLibraryStore((s) => s.seeded);
  const assets = useLibraryStore((s) => s.assets);
  const [error, setError] = useState(null);

  // First launch: import the sample SVG into the library.
  useEffect(() => {
    try {
      useLibraryStore.getState().ensureSeeded();
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  }, []);

  // Keep the canvas consistent when the admin deletes elements.
  useEffect(() => {
    if (seeded) useEditorStore.getState().pruneMissing(assets.map((a) => a.id));
  }, [assets, seeded]);

  return (
    <div className="flex h-full flex-col">
      <Header />
      {error && <div className="bg-brand px-4 py-2 text-sm text-white">Errore di inizializzazione: {error}</div>}
      <main className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        {seeded ? (
          <Routes>
            <Route path="/" element={<EditorPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <div className="grid h-full place-items-center text-muted">Caricamento libreria…</div>
        )}
      </main>
    </div>
  );
}
