import { useState } from 'react';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Toggle from '../ui/Toggle.jsx';
import Slider from '../ui/Slider.jsx';
import Swatches from '../ui/Swatches.jsx';
import ConfirmButton from '../ui/ConfirmButton.jsx';
import LabelsEditor from '../ui/LabelsEditor.jsx';
import { useLibrary } from '../../hooks/useLibrary.js';
import { useLibraryStore } from '../../store/useLibraryStore.js';
import { useI18n } from '../../i18n/index.js';

const pct = (v) => `${Math.round(v * 100)}%`;

export default function CategoriesTab() {
  const { t, lang } = useI18n();
  const { categories, assets, palette } = useLibrary();
  const { addCategory, updateCategory, deleteCategory, moveCategory } = useLibraryStore.getState();
  const [newName, setNewName] = useState('');

  return (
    <>
      <SectionTitle title={t('cat.title')}>{t('cat.desc')}</SectionTitle>

      <form
        className="mb-5 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const name = newName.trim();
          if (!name) return;
          addCategory({ name, labels: { [lang]: name } });
          setNewName('');
        }}
      >
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('cat.newPh')} className="min-w-64 flex-1 rounded-xl border border-line bg-white px-3 py-2" aria-label={t('cat.newPh')} />
        <Button type="submit" variant="primary"><Icon name="plus" /> {t('cat.add')}</Button>
      </form>

      <div className="space-y-4">
        {categories.map((c, i) => {
          const count = assets.filter((a) => a.categoryId === c.id).length;
          const up = (patch) => updateCategory(c.id, patch);
          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={c.labels?.[lang] ?? c.name}
                  onChange={(e) => up({ labels: { ...(c.labels || {}), [lang]: e.target.value } })}
                  className="min-w-48 flex-1 rounded-xl border border-line bg-white px-3 py-2 font-display text-lg font-bold"
                  aria-label={t('cat.name')}
                />
                <span className="text-sm text-muted">{t('cat.count', { n: count })}</span>
                <Button size="icon" variant="ghost" onClick={() => moveCategory(c.id, -1)} disabled={i === 0} aria-label={t('common.moveUp')}><Icon name="up" /></Button>
                <Button size="icon" variant="ghost" onClick={() => moveCategory(c.id, 1)} disabled={i === categories.length - 1} aria-label={t('common.moveDown')}><Icon name="down" /></Button>
                <ConfirmButton size="sm" onConfirm={() => deleteCategory(c.id)} confirmLabel={count ? t('cat.deleteWith', { n: count }) : undefined}>
                  <Icon name="trash" /> {t('common.delete')}
                </ConfirmButton>
              </div>

              <div className="mt-4 grid gap-x-8 gap-y-2 md:grid-cols-3">
                <div>
                  <Toggle label={t('cat.base')} hint={t('cat.baseHint')} checked={c.isBase} onChange={(v) => up({ isBase: v })} />
                  <Toggle label={t('cat.multiple')} hint={t('cat.multipleHint')} checked={c.multiple} onChange={(v) => up({ multiple: v })} />
                </div>
                <div>
                  <Toggle label={t('cat.random')} checked={c.inRandom} onChange={(v) => up({ inRandom: v })} />
                  <Toggle label={t('cat.required')} hint={t('cat.requiredHint')} checked={c.required} onChange={(v) => up({ required: v })} />
                </div>
                <label className="block text-sm font-medium">
                  {t('cat.z')}
                  <input type="number" value={c.zIndex} onChange={(e) => up({ zIndex: parseInt(e.target.value || '0', 10) })} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-1.5" />
                </label>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-ink">{t('cat.more')}</summary>
                <div className="mt-3 grid gap-5 md:grid-cols-2">
                  <LabelsEditor entity={c} hint={t('as.namesHint')} onChange={(labels) => up({ labels })} />
                  <div className="space-y-3">
                    <p className="text-xs text-muted">{t('cat.anchorHint')}</p>
                    <Slider label={t('cat.h')} value={c.anchor?.x ?? 0.5} min={0} max={1} step={0.01} format={pct} onChange={(v) => up({ anchor: { ...c.anchor, x: v } })} />
                    <Slider label={t('cat.v')} value={c.anchor?.y ?? 0.5} min={0} max={1} step={0.01} format={pct} onChange={(v) => up({ anchor: { ...c.anchor, y: v } })} />
                    <Slider label={c.isBase ? t('cat.sizeBase') : t('cat.sizeOther')} value={c.size ?? 0.5} min={0.1} max={1.5} step={0.01} format={pct} onChange={(v) => up({ size: v })} />
                  </div>
                  <div className="space-y-2">
                    <Toggle label={t('cat.fill')} checked={c.fillOutlines} onChange={(v) => up({ fillOutlines: v })} />
                    <p className="text-xs text-muted">{t('cat.baseColor')}</p>
                    <Swatches palette={palette} value={c.outlineFill} onPick={(hex) => up({ outlineFill: hex })} size="h-6 w-6" />
                  </div>
                </div>
              </details>
            </Card>
          );
        })}
      </div>
    </>
  );
}
