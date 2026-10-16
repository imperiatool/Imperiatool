import { useState } from 'react';
import AssetThumb from '../ui/AssetThumb.jsx';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useI18n } from '../../i18n/index.js';

/** Category tabs + grid of elements. Click to add (or swap) an element. */
export default function AssetPicker({ library }) {
  const { t, label } = useI18n();
  const { categories, assets } = library;
  const visible = categories.filter((c) => assets.some((a) => a.categoryId === c.id));
  const [active, setActive] = useState(visible[0]?.id);
  const items = useEditorStore((s) => s.items);
  const addAsset = useEditorStore((s) => s.addAsset);

  const current = visible.find((c) => c.id === active) || visible[0];
  const list = current ? assets.filter((a) => a.categoryId === current.id) : [];
  const usedIds = new Set(items.map((i) => i.assetId));

  if (!visible.length) {
    return <p className="p-4 text-sm text-muted">{t('picker.empty')}</p>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex gap-1 overflow-x-auto border-b border-line p-2 scroll-thin" role="tablist">
        {visible.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === current?.id}
            onClick={() => setActive(c.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              c.id === current?.id ? 'bg-ink text-cream' : 'text-ink hover:bg-ink/5'
            }`}
          >
            {label(c)}
          </button>
        ))}
      </div>
      <div className="scroll-thin grid flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto p-3 lg:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => addAsset(a, library)}
            title={t(current.multiple ? 'picker.add' : 'picker.use', { name: label(a) })}
            className={`group flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition hover:-translate-y-0.5 hover:border-ink ${
              usedIds.has(a.id) ? 'border-brand bg-brand/5' : 'border-line bg-paper'
            }`}
          >
            <AssetThumb asset={a} className="h-16 w-full" />
            <span className="w-full truncate text-center text-[11px] font-medium text-muted group-hover:text-ink">{label(a)}</span>
          </button>
        ))}
      </div>
      <p className="border-t border-line px-3 py-2 text-[11px] text-muted">
        {t(current?.multiple ? 'picker.hintMultiple' : 'picker.hintSingle')}
      </p>
    </div>
  );
}
