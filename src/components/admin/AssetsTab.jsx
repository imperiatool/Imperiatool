import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Modal from '../ui/Modal.jsx';
import Swatches from '../ui/Swatches.jsx';
import ConfirmButton from '../ui/ConfirmButton.jsx';
import AssetThumb from '../ui/AssetThumb.jsx';
import LabelsEditor from '../ui/LabelsEditor.jsx';
import { useLibrary } from '../../hooks/useLibrary.js';
import { useLibraryStore } from '../../store/useLibraryStore.js';
import { parseSvgText, extractWholeDocument, buildAsset } from '../../lib/svgParser.js';
import { useI18n } from '../../i18n/index.js';
import { snapAssetColors } from '../../data/labels.js';

export default function AssetsTab() {
  const { t, label } = useI18n();
  const library = useLibrary();
  const { categories, assets } = library;
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);

  const shown = categories.filter((c) => filter === 'all' || c.id === filter);

  return (
    <>
      <SectionTitle title={t('as.title')}>
        {t('as.desc')}{' '}
        <Link to="/admin/import" className="font-semibold text-brand underline">{t('as.importLink')}</Link>.
      </SectionTitle>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {[{ id: 'all' }, ...categories].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${filter === c.id ? 'bg-brand text-white' : 'bg-paper hover:bg-ink/5'}`}
          >
            {c.id === 'all' ? t('as.all') : label(c)}{' '}
            {c.id !== 'all' && <span className="opacity-60">({assets.filter((a) => a.categoryId === c.id).length})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {shown.map((cat) => {
          const list = assets.filter((a) => a.categoryId === cat.id);
          return (
            <Card key={cat.id}>
              <h2 className="mb-3 font-display text-lg font-bold">{label(cat)}</h2>
              {list.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {list.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setEditing(a.id)}
                      className="group rounded-2xl border-2 border-line bg-white p-2 text-left transition hover:border-brand"
                    >
                      <AssetThumb asset={a} className="h-24 w-full" idPrefix={`adm-${a.id}`} />
                      <span className="mt-1 block truncate text-sm font-semibold">{label(a)}</span>
                      <span className="flex gap-1 pt-1">
                        {a.slots.map((s) => (
                          <span key={s.id} className="h-3 w-3 rounded-full border border-brand/20" style={{ background: s.original }} />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">{t('as.empty')}</p>
              )}
            </Card>
          );
        })}
      </div>

      <AssetEditor assetId={editing} onClose={() => setEditing(null)} library={library} />
    </>
  );
}

function AssetEditor({ assetId, onClose, library }) {
  const { t, label, slotLabel } = useI18n();
  const { assetsById, categories, palette } = library;
  const asset = assetsById[assetId];
  const { updateAsset, deleteAsset, moveAsset } = useLibraryStore.getState();
  const [error, setError] = useState('');
  if (!asset) return null;

  const updateSlot = (slotId, patch) => updateAsset(asset.id, { slots: asset.slots.map((s) => (s.id === slotId ? { ...s, ...patch } : s)) });

  const replaceDrawing = async (file) => {
    setError('');
    try {
      const parsed = parseSvgText(await file.text());
      const el = extractWholeDocument(parsed);
      if (!el) throw new Error(t('as.noVisible'));
      const cat = categories.find((c) => c.id === asset.categoryId);
      const built = buildAsset(el.rawMarkup, { fillOutlines: cat?.fillOutlines, outlineFill: cat?.outlineFill });
      const snapped = snapAssetColors({ ...asset, ...built }, useLibraryStore.getState().palette);
      updateAsset(asset.id, { markup: snapped.markup, slots: snapped.slots, width: el.width, height: el.height, source: { file: file.name, layer: '—' } });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('as.edit')}
      footer={
        <>
          <ConfirmButton
            onConfirm={() => {
              deleteAsset(asset.id);
              onClose();
            }}
            confirmLabel={t('as.deleteForever')}
          >
            <Icon name="trash" /> {t('common.delete')}
          </ConfirmButton>
          <span className="flex-1" />
          <Button onClick={() => moveAsset(asset.id, -1)} title={t('common.moveBefore')} aria-label={t('common.moveBefore')}><Icon name="up" className="h-4 w-4 -rotate-90" /></Button>
          <Button onClick={() => moveAsset(asset.id, 1)} title={t('common.moveAfter')} aria-label={t('common.moveAfter')}><Icon name="down" className="h-4 w-4 -rotate-90" /></Button>
          <Button variant="secondary" onClick={onClose}>{t('common.done')}</Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div>
          <div className="checker rounded-2xl border border-line p-3">
            <AssetThumb asset={asset} className="aspect-square w-full" idPrefix={`edit-${asset.id}`} />
          </div>
          <label className="mt-3 block">
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold hover:border-brand/50">
              <Icon name="upload" /> {t('as.replace')}
            </span>
            <input type="file" accept=".svg,image/svg+xml" className="hidden" onChange={(e) => e.target.files[0] && replaceDrawing(e.target.files[0])} />
          </label>
          {error && <p className="mt-2 text-sm text-brand-dark">{error}</p>}
          <p className="mt-2 text-xs text-muted">
            {t('as.units', { w: Math.round(asset.width), h: Math.round(asset.height) })}
            {asset.source && <><br />{t('as.source', { file: asset.source.file, layer: asset.source.layer })}</>}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">
            {t('as.name')}
            <input value={asset.name} onChange={(e) => updateAsset(asset.id, { name: e.target.value })} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2" />
          </label>
          <LabelsEditor entity={asset} hint={t('as.namesHint')} onChange={(labels) => updateAsset(asset.id, { labels })} />
          <label className="block text-sm font-medium">
            {t('as.category')}
            <select value={asset.categoryId} onChange={(e) => updateAsset(asset.id, { categoryId: e.target.value })} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{label(c)}</option>
              ))}
            </select>
          </label>

          <div>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">{t('as.zones')}</h3>
            <p className="mb-3 text-xs text-muted">{t('as.zonesHint')}</p>
            <div className="space-y-3">
              {asset.slots.map((s) => (
                <div key={s.id} className="rounded-2xl border border-line bg-white p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-5 w-5 shrink-0 rounded-full border border-brand/20" style={{ background: s.original }} />
                    <span className="flex-1 text-sm font-semibold">{slotLabel(s)}</span>
                    <span className="text-[11px] uppercase text-muted">{s.kind === 'stroke' ? t('as.kind.stroke') : t('as.kind.fill')}</span>
                  </div>
                  <Swatches palette={palette} value={s.original} onPick={(hex) => updateSlot(s.id, { original: hex })} size="h-6 w-6" />
                </div>
              ))}
              {!asset.slots.length && <p className="text-sm text-muted">{t('as.noColors')}</p>}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
