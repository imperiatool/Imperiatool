import { useEffect, useState } from 'react';
import AssetPicker from './AssetPicker.jsx';
import StickerCanvas from './StickerCanvas.jsx';
import PropertiesPanel from './PropertiesPanel.jsx';
import ExportModal from './ExportModal.jsx';
import OrderModal from './OrderModal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useLibrary } from '../../hooks/useLibrary.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useI18n } from '../../i18n/index.js';

export default function EditorPage() {
  const { t } = useI18n();
  const library = useLibrary();
  const items = useEditorStore((s) => s.items);
  const background = useEditorStore((s) => s.background);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const [modal, setModal] = useState(null); // 'export' | 'order' | null

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || modal) return;
      const s = useEditorStore.getState();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? s.redo() : s.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        s.redo();
      } else if (mod && e.key.toLowerCase() === 'd' && s.selectedId) {
        e.preventDefault();
        s.duplicateItem(s.selectedId);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && s.selectedId) {
        e.preventDefault();
        s.removeItem(s.selectedId);
      } else if (e.key === 'Escape') {
        s.select(null);
      } else if (e.key.startsWith('Arrow') && s.selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? 20 : 4;
        const it = s.items.find((i) => i.uid === s.selectedId);
        if (!it || it.locked) return;
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        s.commitItem(it.uid, { x: it.x + d[0], y: it.y + d[1] });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const s = useEditorStore.getState;

  return (
    <div className="grid grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
      {/* Elements */}
      <aside className="order-2 h-80 border-y-2 border-ink/10 bg-paper lg:order-1 lg:h-auto lg:min-h-0 lg:border-y-0 lg:border-r-2">
        <AssetPicker library={library} />
      </aside>

      {/* Canvas + actions */}
      <section className="order-1 flex flex-col gap-3 p-3 sm:p-5 lg:order-2 lg:min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => s().undo()} disabled={!canUndo} title={t('editor.undo')} aria-label={t('editor.undo')}><Icon name="undo" /></Button>
            <Button size="icon" variant="ghost" onClick={() => s().redo()} disabled={!canRedo} title={t('editor.redo')} aria-label={t('editor.redo')}><Icon name="redo" /></Button>
            <Button size="sm" variant="ghost" onClick={() => s().clear()} disabled={!items.length}><Icon name="trash" /> {t('editor.clear')}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => s().randomize(library)} data-testid="randomize">
              <Icon name="dice" /> {t('editor.randomize')}
            </Button>
            <Button variant="primary" onClick={() => setModal('export')} disabled={!items.length} data-testid="create-sticker">
              <Icon name="download" /> {t('editor.createSticker')}
            </Button>
            <Button variant="basil" onClick={() => setModal('order')} disabled={!items.length} data-testid="order-charm">
              <Icon name="cube" /> {t('editor.orderCharm')}
            </Button>
          </div>
        </div>

        <div className="relative grid place-items-center lg:min-h-0 lg:flex-1">
          <div className={`relative aspect-square w-full max-w-[min(100%,calc(100vh-11rem))] overflow-hidden rounded-[28px] border-2 border-ink shadow-[0_6px_0_0_#3a1f1b] ${background ? '' : 'checker'}`}>
            <StickerCanvas assetsById={library.assetsById} label={t('editor.canvasLabel')} />
            {!items.length && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center p-8 text-center">
                <div>
                  <p className="font-display text-2xl font-extrabold">{t('editor.emptyTitle')}</p>
                  <p className="mt-1 text-sm text-muted">{t('editor.emptyHint')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Properties */}
      <aside className="order-3 border-ink/10 bg-paper lg:min-h-0 lg:border-l-2">
        <PropertiesPanel library={library} />
      </aside>

      <ExportModal open={modal === 'export'} onClose={() => setModal(null)} items={items} library={library} background={background} />
      <OrderModal open={modal === 'order'} onClose={() => setModal(null)} items={items} library={library} />
    </div>
  );
}
