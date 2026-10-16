import { useRef, useState } from 'react';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import ConfirmButton from '../ui/ConfirmButton.jsx';
import { useLibraryStore } from '../../store/useLibraryStore.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { downloadBlob } from '../../lib/exportImage.js';

export default function DataTab() {
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');

  const exportJson = () => {
    const data = useLibraryStore.getState().exportLibrary();
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `sticker-library-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const importJson = async (file) => {
    try {
      useLibraryStore.getState().importLibrary(JSON.parse(await file.text()));
      setMessage('Libreria importata.');
    } catch (e) {
      setMessage(`Errore: ${e.message}`);
    }
  };

  return (
    <>
      <SectionTitle title="Backup libreria">
        La libreria (categorie, elementi, palette) è salvata nel browser. Esportala in JSON per farne un backup, spostarla su un altro computer o pubblicarla come libreria predefinita.
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-display text-lg font-bold">Esporta</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Scarica un file JSON con tutta la libreria.</p>
          <Button variant="primary" onClick={exportJson}><Icon name="download" /> Esporta JSON</Button>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-bold">Importa</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Sostituisce la libreria attuale con quella del file.</p>
          <Button onClick={() => fileRef.current?.click()}><Icon name="upload" /> Importa JSON</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files[0] && importJson(e.target.files[0])} />
        </Card>
        <Card>
          <h2 className="font-display text-lg font-bold">Ripristina</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Torna alla libreria di esempio (perdi le modifiche non esportate).</p>
          <ConfirmButton
            onConfirm={() => {
              useLibraryStore.getState().resetToSeed();
              useEditorStore.getState().clear();
              setMessage('Libreria di esempio ripristinata.');
            }}
            confirmLabel="Sì, ripristina"
          >
            <Icon name="reset" /> Ripristina esempio
          </ConfirmButton>
        </Card>
      </div>
      {message && <p className="mt-4 rounded-xl bg-basil/10 px-3 py-2 text-sm text-basil">{message}</p>}
    </>
  );
}
