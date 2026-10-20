import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Toggle from '../ui/Toggle.jsx';
import Slider from '../ui/Slider.jsx';
import Swatches from '../ui/Swatches.jsx';
import AssetThumb from '../ui/AssetThumb.jsx';
import { useLibrary } from '../../hooks/useLibrary.js';
import { useLibraryStore } from '../../store/useLibraryStore.js';
import { parseSvgText, extractElements, mergeElements, buildAsset, extractPaletteColors } from '../../lib/svgParser.js';
import sampleSvg from '../../data/seed/pasta-characters.svg?raw';
import { useI18n } from '../../i18n/index.js';

const MODES = ['auto', 'children', 'layer'];

export default function ImportTab() {
  const { t, label } = useI18n();
  const library = useLibrary();
  const { categories, palette } = library;
  const addAssets = useLibraryStore((s) => s.addAssets);
  const addColor = useLibraryStore((s) => s.addColor);
  const fileRef = useRef(null);

  const [file, setFile] = useState(null); // { name, parsed }
  const [error, setError] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [layerKey, setLayerKey] = useState(null);
  const [mode, setMode] = useState('auto');
  const [tolerance, setTolerance] = useState(40);
  const [categoryId, setCategoryId] = useState(categories[0]?.id);
  const category = categories.find((c) => c.id === categoryId);
  const [fillOutlines, setFillOutlines] = useState(category?.fillOutlines ?? true);
  const [outlineFill, setOutlineFill] = useState(category?.outlineFill || palette[0]?.hex || '#ffffff');
  const [elements, setElements] = useState([]); // [{el, name, checked}]
  const [notice, setNotice] = useState('');

  // category defaults drive the fill options
  useEffect(() => {
    if (!category) return;
    setFillOutlines(category.fillOutlines ?? true);
    if (category.outlineFill) setOutlineFill(category.outlineFill);
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadText = (name, text) => {
    setError('');
    setNotice('');
    try {
      const parsed = parseSvgText(text);
      setFile({ name, parsed });
      const firstVisible = parsed.layers.find((l) => l.visible) || parsed.layers[0];
      setLayerKey(firstVisible?.key || null);
      // Guess the category from file/layer name (Body → Corpi, Eyes → Occhi…)
      const guess = guessCategory(`${name} ${firstVisible?.name || ''}`, categories);
      if (guess) setCategoryId(guess.id);
    } catch (e) {
      setFile(null);
      setError(e.message);
    }
  };

  const onFile = async (f) => {
    if (!f) return;
    if (!/svg/i.test(f.type) && !/\.svg$/i.test(f.name)) {
      setError(t('imp.notSvg'));
      return;
    }
    loadText(f.name, await f.text());
  };

  const layer = file?.parsed.layers.find((l) => l.key === layerKey);

  // Re-run extraction when the layer or the options change
  useEffect(() => {
    if (!file || !layer) return setElements([]);
    try {
      const els = extractElements(file.parsed, layer, { mode, tolerance });
      setElements(els.map((el, i) => ({ el, name: els.length > 1 ? `${layer.name} ${i + 1}` : layer.name, checked: true })));
    } catch (e) {
      setError(e.message);
    }
  }, [file, layer, mode, tolerance]);

  const previews = useMemo(
    () =>
      elements.map(({ el }, i) => {
        const built = buildAsset(el.rawMarkup, { fillOutlines, outlineFill });
        return { id: `prev-${i}`, width: el.width, height: el.height, ...built };
      }),
    [elements, fillOutlines, outlineFill],
  );

  const checked = elements.filter((e) => e.checked);
  const layers = file ? file.parsed.layers.filter((l) => showHidden || l.visible) : [];

  const mergeSelected = () => {
    const sel = elements.filter((e) => e.checked);
    if (sel.length < 2) return;
    const merged = { el: mergeElements(sel.map((e) => e.el)), name: sel[0].name, checked: true };
    const firstIdx = elements.indexOf(sel[0]);
    const rest = elements.filter((e) => !e.checked);
    rest.splice(Math.min(firstIdx, rest.length), 0, merged);
    setElements(rest);
  };

  const doImport = () => {
    const toAdd = elements
      .map((e, i) => ({ e, p: previews[i] }))
      .filter(({ e }) => e.checked)
      .map(({ e, p }) => ({
        categoryId,
        name: e.name.trim() || 'Elemento',
        width: Math.round(p.width * 100) / 100,
        height: Math.round(p.height * 100) / 100,
        markup: p.markup,
        slots: p.slots,
        source: { file: file.name, layer: layer.id },
      }));
    addAssets(toAdd);
    setNotice(t('imp.imported', { n: toAdd.length, cat: label(category) }));
    setElements((list) => list.map((e) => ({ ...e, checked: false })));
  };

  const importPalette = () => {
    const colors = extractPaletteColors(file.parsed, layer);
    const existing = new Set(palette.map((p) => p.hex.toLowerCase()));
    const fresh = colors.filter((c) => !existing.has(c));
    fresh.forEach((hex) => addColor({ hex, name: hex.toUpperCase() }));
    setNotice(fresh.length ? t('imp.colorsAdded', { n: fresh.length }) : t('imp.noNewColors'));
  };

  return (
    <>
      <SectionTitle title={t('imp.title')}>{t('imp.desc')}</SectionTitle>

      <Card className="mb-5">
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-white/60 p-6 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files[0]);
          }}
        >
          <Icon name="upload" className="h-8 w-8 text-muted" />
          <p className="text-sm text-muted">{t('imp.drop')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={() => fileRef.current?.click()}>{t('imp.choose')}</Button>
            <Button onClick={() => loadText('pasta-characters.svg', sampleSvg)}>{t('imp.sample')}</Button>
          </div>
          <input ref={fileRef} type="file" accept=".svg,image/svg+xml" className="hidden" data-testid="svg-input" onChange={(e) => onFile(e.target.files[0])} />
          {file && <p className="text-sm">{t('imp.loaded', { name: file.name, n: file.parsed.layers.length })}</p>}
          {error && <p className="text-sm text-brand-dark">{error}</p>}
        </div>
      </Card>

      {file && (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-5">
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">{t('imp.layers')}</h2>
              </div>
              <Toggle label={t('imp.showHidden')} checked={showHidden} onChange={setShowHidden} />
              <ul className="scroll-thin mt-2 max-h-72 space-y-1 overflow-y-auto">
                {layers.map((l) => (
                  <li key={l.key}>
                    <button
                      type="button"
                      onClick={() => setLayerKey(l.key)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${l.key === layerKey ? 'bg-brand text-white' : 'hover:bg-ink/5'}`}
                    >
                      <span className="truncate">{l.name}</span>
                      <span className="ml-2 shrink-0 text-xs opacity-70">{l.visible ? '' : `${t('imp.hidden')} · `}{l.childCount}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="space-y-4">
              <h2 className="font-display text-lg font-bold">{t('imp.split')}</h2>
              <div className="space-y-1.5">
                {MODES.map((m) => (
                  <label key={m} className={`block cursor-pointer rounded-xl border p-2.5 text-sm ${mode === m ? 'border-brand bg-white' : 'border-line'}`}>
                    <input type="radio" name="mode" className="mr-2 accent-brand" checked={mode === m} onChange={() => setMode(m)} />
                    <strong>{t(`imp.mode.${m}`)}</strong>
                    <span className="mt-0.5 block text-xs text-muted">{t(`imp.mode.${m}Hint`)}</span>
                  </label>
                ))}
              </div>
              {mode === 'auto' && (
                <Slider label={t('imp.distance')} value={tolerance} min={0} max={200} step={1} format={(v) => t('imp.units', { n: v })} onChange={setTolerance} />
              )}
            </Card>

            <Card className="space-y-4">
              <h2 className="font-display text-lg font-bold">{t('imp.target')}</h2>
              <label className="block text-sm font-medium">
                {t('imp.category')}
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{label(c)}</option>
                  ))}
                </select>
              </label>
              <Toggle label={t('imp.fill')} hint={t('imp.fillHint')} checked={fillOutlines} onChange={setFillOutlines} />
              {fillOutlines && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted">{t('imp.baseColor')}</p>
                  <Swatches palette={palette} value={outlineFill} onPick={setOutlineFill} size="h-7 w-7" />
                </div>
              )}
              <Button size="sm" onClick={importPalette}>
                <Icon name="plus" /> {t('imp.importColors')}
              </Button>
            </Card>
          </div>

          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">
                {t('imp.found', { n: elements.length })} {layer && <span className="text-muted">{t('imp.inLayer', { name: layer.name })}</span>}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => setElements((l) => l.map((e) => ({ ...e, checked: !checked.length })))}>
                  {checked.length ? t('imp.deselectAll') : t('imp.selectAll')}
                </Button>
                <Button size="sm" onClick={mergeSelected} disabled={checked.length < 2} title={t('imp.mergeTitle')}>
                  <Icon name="merge" /> {t('imp.merge')}
                </Button>
                <Button size="sm" variant="primary" onClick={doImport} disabled={!checked.length} data-testid="do-import">
                  {t('imp.importN', { n: checked.length, cat: label(category) })}
                </Button>
              </div>
            </div>
            {notice && <p className="mb-3 rounded-xl bg-brand/10 px-3 py-2 text-sm text-brand">{notice}</p>}
            {elements.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {elements.map((e, i) => (
                  <div key={i} className={`rounded-2xl border-2 p-2 transition ${e.checked ? 'border-brand bg-white' : 'border-line bg-paper opacity-70'}`}>
                    <label className="block cursor-pointer">
                      <div className="checker rounded-xl p-2">
                        <AssetThumb asset={previews[i]} className="h-24 w-full" idPrefix={`imp-${i}`} />
                      </div>
                      <span className="mt-2 flex items-center gap-2 text-xs text-muted">
                        <input type="checkbox" className="accent-brand" checked={e.checked} onChange={(ev) => setElements((l) => l.map((x, j) => (j === i ? { ...x, checked: ev.target.checked } : x)))} />
                        {t('imp.shapes', { n: e.el.memberCount, c: previews[i]?.slots.length })}
                      </span>
                    </label>
                    <input
                      value={e.name}
                      onChange={(ev) => setElements((l) => l.map((x, j) => (j === i ? { ...x, name: ev.target.value } : x)))}
                      className="mt-1.5 w-full rounded-lg border border-line bg-white px-2 py-1 text-sm"
                      aria-label={t('imp.elementName')}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">{t('imp.none')}</p>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

const HINTS = [
  [/body|bod|corp/i, /corp/i],
  [/eye|occh/i, /occh/i],
  [/mouth|bocc|lip/i, /bocc/i],
  [/access|hat|cappell/i, /access/i],
  [/materi|texture/i, /materi/i],
];

function guessCategory(text, categories) {
  for (const [re, catRe] of HINTS) {
    if (re.test(text)) {
      const c = categories.find((x) => catRe.test(x.name));
      if (c) return c;
    }
  }
  return null;
}
