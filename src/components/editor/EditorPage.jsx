import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [pickerStep, setPickerStep] = useState(0);
  const pickerRef = useRef(null);
  const start = () => {
    setPickerStep(0);
    // on phones the picker sits under the canvas: bring it into view
    if (window.matchMedia('(max-width: 1023px)').matches) pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const s = useEditorStore.getState;

  // progress for the 1-2-3 guide
  const required = library.categories.filter((c) => c.required && library.assets.some((a) => a.categoryId === c.id));
  const picked = required.every((c) => items.some((i) => i.categoryId === c.id)) && items.length > 0;
  const colored = items.some((i) => Object.keys(i.colors || {}).length);
  const guide = useMemo(
    () => [
      { label: t('guide.pick'), done: picked },
      { label: t('guide.color'), done: picked && colored },
      { label: mode === 'charm' ? t('guide.finishCharm') : t('guide.finishSticker'), done: false },
    ],
    [t, picked, colored, mode],
  );

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

  return (
    <div className="grid grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)_310px]">
      {/* 1. pick the pieces */}
      <aside ref={pickerRef} className="order-2 h-[26rem] scroll-mt-2 border-y border-line bg-paper lg:order-1 lg:h-auto lg:min-h-0 lg:border-y-0 lg:border-r">
        <AssetPicker library={library} step={pickerStep} onStepChange={setPickerStep} />
      </aside>

      {/* canvas */}
      <section className="order-1 flex flex-col gap-3 p-3 sm:p-5 lg:order-2 lg:min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-xl font-bold text-brand sm:text-2xl">{mode === 'charm' ? t('editor.charmTitle') : t('editor.stickerTitle')}</h1>
            <p className="text-sm text-muted">{mode === 'charm' ? t('editor.charmSub') : t('editor.stickerSub')}</p>
          </div>
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold" aria-label="steps">
            {guide.map((g, i) => (
              <li key={i} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${g.done ? 'bg-brand text-white' : 'border border-line text-muted'}`}>
                <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${g.done ? 'bg-white/25' : 'bg-ink/10'}`}>
                  {g.done ? <Icon name="check" className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                {g.label}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => s().undo()} disabled={!canUndo} title={t('editor.undo')} aria-label={t('editor.undo')}><Icon name="undo" /></Button>
            <Button size="sm" variant="ghost" onClick={() => s().redo()} disabled={!canRedo} title={t('editor.redo')} aria-label={t('editor.redo')}><Icon name="redo" /></Button>
            <Button size="sm" variant="ghost" onClick={() => s().clear()} disabled={!items.length}><Icon name="trash" /> {t('editor.clear')}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => s().randomize(library)} data-testid="randomize">
              <Icon name="dice" /> {t('editor.randomize')}
            </Button>
            <span className="hidden sm:block">{cta}</span>
          </div>
        </div>

        <div className="relative grid place-items-center lg:min-h-0 lg:flex-1">
          <div className="relative aspect-square w-full max-w-[min(100%,calc(100vh-15rem))] overflow-hidden rounded-[28px] border border-line bg-white [background-image:radial-gradient(#1d1d1b12_1px,transparent_1px)] [background-size:22px_22px]">
            <StickerCanvas assetsById={library.assetsById} label={t('editor.canvasLabel')} />
            {!items.length && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <div className="space-y-4">
                  <p className="font-display text-2xl font-bold sm:text-3xl">{t('editor.emptyTitle')}</p>
                  <p className="text-sm text-muted">{t('editor.emptyHint')}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="primary" size="lg" onClick={start} data-testid="start">
                      <Icon name="arrowRight" /> {t('editor.start')}
                    </Button>
                    <Button variant="secondary" size="lg" onClick={() => s().randomize(library)}>
                      <Icon name="dice" /> {t('editor.randomize')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. colours & adjustments */}
      <aside className="order-3 border-line bg-paper lg:min-h-0 lg:border-l">
        <PropertiesPanel library={library} />
      </aside>

      {/* mobile: the final action is always at hand */}
      <div className="sticky bottom-0 z-20 order-4 flex justify-center border-t border-line bg-white/95 p-3 backdrop-blur sm:hidden">{cta}</div>

      {mode === 'sticker' && <ExportModal open={modal === 'export'} onClose={() => setModal(null)} items={items} library={library} />}
      {mode === 'charm' && <OrderModal open={modal === 'order'} onClose={() => setModal(null)} items={items} library={library} />}
    </div>
  );
}
