import { useEffect, useRef, useState } from 'react';
import StickerCanvas from './StickerCanvas.jsx';
import CustomiserPanel from './CustomiserPanel.jsx';
import ExportModal from './ExportModal.jsx';
import OrderModal from './OrderModal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useLibrary } from '../../hooks/useLibrary.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useI18n } from '../../i18n/index.js';
import PageHeader from '../layout/PageHeader.jsx';
import PreviewHint from '../ui/PreviewHint.jsx';

/**
 * Character editor shared by the Charm and Sticker products.
 * The design is the same: only the final action changes.
 */
export default function EditorPage({ mode = 'charm' }) {
  const { t } = useI18n();
  const library = useLibrary();
  const items = useEditorStore((s) => s.items);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const [modal, setModal] = useState(null); // 'export' | 'order' | null
  const panelRef = useRef(null);
  // Start: puts the first body on the canvas, then shows its section
  const start = () => {
    const firstBase = library.categories.find((c) => c.isBase && library.assets.some((a) => a.categoryId === c.id));
    const body = firstBase && library.assets.find((a) => a.categoryId === firstBase.id);
    // the new body is selected, so its section opens in the panel
    if (body) useEditorStore.getState().addAsset(body, library);
  };
  const s = useEditorStore.getState;

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || modal) return;
      const st = s();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? st.redo() : st.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        st.redo();
      } else if (mod && e.key.toLowerCase() === 'd' && st.selectedId) {
        e.preventDefault();
        st.duplicateItem(st.selectedId);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && st.selectedId) {
        e.preventDefault();
        st.removeItem(st.selectedId);
      } else if (e.key === 'Escape') {
        st.select(null);
      } else if (e.key.startsWith('Arrow') && st.selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? 20 : 4;
        const it = st.items.find((i) => i.uid === st.selectedId);
        if (!it || it.locked) return;
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        st.commitItem(it.uid, { x: it.x + d[0], y: it.y + d[1] });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, s]);

  const cta =
    mode === 'charm' ? (
      <Button variant="primary" size="lg" onClick={() => setModal('order')} disabled={!items.length} data-testid="order-charm">
        <Icon name="cube" /> {t('editor.charmCta')}
      </Button>
    ) : (
      <Button variant="primary" size="lg" onClick={() => setModal('export')} disabled={!items.length} data-testid="create-sticker">
        <Icon name="share" /> {t('editor.stickerCta')}
      </Button>
    );

  const tools = (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="ghost" onClick={() => s().undo()} disabled={!canUndo} title={t('editor.undo')} aria-label={t('editor.undo')}>
        <Icon name="undo" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => s().redo()} disabled={!canRedo} title={t('editor.redo')} aria-label={t('editor.redo')}>
        <Icon name="redo" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => s().clear()} disabled={!items.length} title={t('editor.clear')} aria-label={t('editor.clear')}>
        <Icon name="trash" />
      </Button>
      <Button size="sm" variant="secondary" onClick={() => s().randomize(library)} data-testid="randomize">
        <Icon name="dice" /> {t('editor.randomize')}
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-full flex-col pb-24 lg:h-full lg:pb-0">
      <PageHeader
        title={mode === 'charm' ? t('editor.charmTitle') : t('editor.stickerTitle')}
        subtitle={mode === 'charm' ? t('editor.charmSub') : t('editor.stickerSub')}
        className="border-b border-line px-4 py-4 sm:px-6"
      >
        <div className="hidden lg:block">{cta}</div>
      </PageHeader>
      {/* preview on the left, parts and colours on the right */}
      <div className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(400px,480px)]">
        <section className={`flex flex-col gap-2 p-3 sm:p-5 lg:min-h-0 ${mode === 'sticker' ? 'bg-white' : 'bg-studio'}`}>
          <div className="flex justify-center">{tools}</div>
          <div className="relative grid place-items-center lg:min-h-0 lg:flex-1">
            <div className={`relative aspect-square w-full max-w-[min(100%,calc(100vh-21rem))] overflow-hidden rounded-[28px] bg-white [background-image:radial-gradient(#1d1d1b10_1px,transparent_1px)] [background-size:22px_22px]`}>
              <StickerCanvas assetsById={library.assetsById} label={t('editor.canvasLabel')} outline={mode === 'sticker'} />
              {!items.length && (
                <div className="absolute inset-0 grid place-items-center p-6 text-center">
                  <div className="space-y-4">
                    <p className="text-sm text-muted">{t('editor.emptyHint')}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button variant="primary" onClick={start} data-testid="start">
                        {t('editor.start')}
                      </Button>
                      <Button variant="secondary" onClick={() => s().randomize(library)}>
                        <Icon name="dice" /> {t('editor.randomize')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {items.length > 0 && <PreviewHint className="pt-0">{t('editor.canvasHint')}</PreviewHint>}
        </section>

        <aside className="border-t border-line bg-cream lg:min-h-0 lg:border-l lg:border-t-0">
          <CustomiserPanel ref={panelRef} library={library} />
        </aside>
      </div>

      {/* phones: the final action is always at hand */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="w-full max-w-md [&>button]:w-full [&>button]:justify-center">{cta}</div>
      </div>

      {mode === 'sticker' && <ExportModal open={modal === 'export'} onClose={() => setModal(null)} items={items} library={library} />}
      {mode === 'charm' && <OrderModal open={modal === 'order'} onClose={() => setModal(null)} items={items} library={library} />}
    </div>
  );
}
