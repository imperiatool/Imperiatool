import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useCartStore } from './store/useCartStore.js';
import Header from './components/layout/Header.jsx';
import EditorPage from './components/editor/EditorPage.jsx';
import CoverPage from './components/cover/CoverPage.jsx';
import AdminPage from './components/admin/AdminPage.jsx';
import HomePage from './components/home/HomePage.jsx';
import EventsPage from './components/events/EventsPage.jsx';
import EventDetailPage from './components/events/EventDetailPage.jsx';
import CartDrawer from './components/shop/CartDrawer.jsx';
import AccountDrawer from './components/shop/AccountDrawer.jsx';
import { useLibraryStore } from './store/useLibraryStore.js';
import { useEditorStore } from './store/useEditorStore.js';
import { useI18n } from './i18n/index.js';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import Footer from './components/layout/Footer.jsx';

export default function App() {
  const seeded = useLibraryStore((s) => s.seeded);
  const assets = useLibraryStore((s) => s.assets);
  const { t, lang } = useI18n();
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // changing page closes the cart / account panels
  const { pathname } = useLocation();
  useEffect(() => useCartStore.getState().show(null), [pathname]);
  // …and opens it from the top (otherwise it keeps the previous page's scroll)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll('main, [data-scroll-root]').forEach((el) => (el.scrollTop = 0));
  }, [pathname]);

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
      {error && <div className="bg-brand px-4 py-2 text-sm text-white">{t('common.initError', { msg: error })}</div>}
      <main className="min-h-0 flex-1 overflow-y-auto">
        {seeded ? (
          // a failure in one page shows a message there, never a blank app;
          // changing page tries again
          <ErrorBoundary
            resetKey={pathname}
            fallback={(retry) => (
              <div className="grid min-h-full place-items-center p-6 text-center" data-testid="page-error">
                <div>
                  <p className="text-base font-semibold">{t('common.pageError')}</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <button type="button" onClick={retry} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white">
                      {t('viewer.retry')}
                    </button>
                    <button type="button" onClick={() => window.location.reload()} className="rounded-full border border-line px-5 py-2 text-sm font-semibold">
                      {t('common.reload')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/case" element={<CoverPage />} />
            <Route path="/cover" element={<Navigate to="/case" replace />} />
            <Route path="/charm" element={<EditorPage mode="charm" key="charm" />} />
            <Route path="/sticker" element={<EditorPage mode="sticker" key="sticker" />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        ) : (
          <div className="grid h-full place-items-center text-muted">{t('common.loading')}</div>
        )}
        {seeded && !pathname.startsWith('/admin') && <Footer />}
      </main>
      <CartDrawer />
      <AccountDrawer />
    </div>
  );
}
