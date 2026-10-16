import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Toggle from '../ui/Toggle.jsx';
import Slider from '../ui/Slider.jsx';
import Swatches from '../ui/Swatches.jsx';
import { buildStickerSvg, svgToPngBlob, downloadBlob, canShareFiles, shareBlob } from '../../lib/exportImage.js';
import { CANVAS_SIZE } from '../../data/defaults.js';

const SIZES = [512, 1024, 2048];

export default function ExportModal({ open, onClose, items, library, background }) {
  const { assetsById, palette } = library;
  const [outline, setOutline] = useState(true);
  const [outlineColor, setOutlineColor] = useState('#ffffff');
  const [outlineWidth, setOutlineWidth] = useState(26);
  const [useBg, setUseBg] = useState(false);
  const [size, setSize] = useState(1024);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => setMessage(''), [open]);

  const outlinePalette = useMemo(() => [{ id: 'white', name: 'Bianco', hex: '#ffffff' }, ...palette], [palette]);

  const result = useMemo(
    () =>
      open
        ? buildStickerSvg(items, assetsById, {
            outline: { enabled: outline, color: outlineColor, width: outlineWidth },
            background: useBg ? background : null,
            canvasSize: CANVAS_SIZE,
          })
        : null,
    [open, items, assetsById, outline, outlineColor, outlineWidth, useBg, background],
  );
  const previewUrl = useMemo(() => (result ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}` : ''), [result]);
  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  const png = () => svgToPngBlob(result.svg, result.width, result.height, size);

  const run = async (fn) => {
    setBusy(true);
    setMessage('');
    try {
      await fn();
    } catch (e) {
      if (e?.name !== 'AbortError') setMessage(e.message || 'Operazione non riuscita');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crea sticker"
      footer={
        <>
          <Button onClick={() => run(async () => downloadBlob(new Blob([result.svg], { type: 'image/svg+xml' }), `sticker-${stamp()}.svg`))} disabled={busy}>
            <Icon name="download" /> SVG vettoriale
          </Button>
          {canShareFiles() && (
            <Button variant="secondary" onClick={() => run(async () => shareBlob(await png(), `sticker-${stamp()}.png`))} disabled={busy}>
              <Icon name="share" /> Condividi
            </Button>
          )}
          <Button variant="primary" onClick={() => run(async () => downloadBlob(await png(), `sticker-${stamp()}.png`))} disabled={busy} data-testid="download-png">
            <Icon name="download" /> Scarica PNG
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <div className="checker grid min-h-72 place-items-center rounded-2xl border border-line p-4">
          {previewUrl && <img src={previewUrl} alt="Anteprima sticker" className="max-h-[52vh] w-auto max-w-full drop-shadow-lg" />}
        </div>
        <div className="space-y-4">
          <Toggle label="Bordo sticker" hint="Contorno fustellato attorno alla sagoma" checked={outline} onChange={setOutline} />
          {outline && (
            <>
              <Slider label="Spessore bordo" value={outlineWidth} min={6} max={60} step={1} onChange={setOutlineWidth} />
              <div>
                <p className="mb-1 text-xs font-medium text-muted">Colore bordo</p>
                <Swatches palette={outlinePalette} value={outlineColor} onPick={setOutlineColor} size="h-7 w-7" />
              </div>
            </>
          )}
          <Toggle
            label="Includi sfondo"
            hint={background ? 'Usa il colore di sfondo della tela' : 'Nessuno sfondo impostato: PNG trasparente'}
            checked={useBg && !!background}
            onChange={setUseBg}
          />
          <div>
            <p className="mb-1 text-xs font-medium text-muted">Risoluzione PNG (lato lungo)</p>
            <div className="flex gap-1.5">
              {SIZES.map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)} className={`rounded-lg border px-2.5 py-1 text-sm font-semibold ${s === size ? 'border-ink bg-ink text-cream' : 'border-line bg-paper'}`}>
                  {s}px
                </button>
              ))}
            </div>
          </div>
          {message && <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand-dark">{message}</p>}
        </div>
      </div>
    </Modal>
  );
}
