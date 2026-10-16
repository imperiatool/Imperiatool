import { useRef, useState } from 'react';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import ConfirmButton from '../ui/ConfirmButton.jsx';
import { useLibraryStore } from '../../store/useLibraryStore.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { downloadBlob } from '../../lib/exportImage.js';
import { useI18n } from '../../i18n/index.js';

export default function DataTab() {
  const { t } = useI18n();
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');

  const exportJson = () => {
    const data = useLibraryStore.getState().exportLibrary();
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `imperia-library-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const importJson = async (file) => {
    try {
      useLibraryStore.getState().importLibrary(JSON.parse(await file.text()));
      setMessage(t('data.imported'));
    } catch (e) {
      setMessage(t('data.error', { msg: e.message === 'invalid-library' ? t('data.invalid') : e.message }));
    }
  };

  return (
    <>
      <SectionTitle title={t('data.title')}>{t('data.desc')}</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-display text-lg font-bold">{t('data.export')}</h2>
          <p className="mb-4 mt-1 text-sm text-muted">{t('data.exportDesc')}</p>
          <Button variant="primary" onClick={exportJson}><Icon name="download" /> {t('data.exportBtn')}</Button>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-bold">{t('data.import')}</h2>
          <p className="mb-4 mt-1 text-sm text-muted">{t('data.importDesc')}</p>
          <Button onClick={() => fileRef.current?.click()}><Icon name="upload" /> {t('data.importBtn')}</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files[0] && importJson(e.target.files[0])} />
        </Card>
        <Card>
          <h2 className="font-display text-lg font-bold">{t('data.reset')}</h2>
          <p className="mb-4 mt-1 text-sm text-muted">{t('data.resetDesc')}</p>
          <ConfirmButton
            onConfirm={() => {
              useLibraryStore.getState().resetToSeed();
              useEditorStore.getState().clear();
              setMessage(t('data.restored'));
            }}
            confirmLabel={t('data.resetConfirm')}
          >
            <Icon name="reset" /> {t('data.resetBtn')}
          </ConfirmButton>
        </Card>
      </div>
      {message && <p className="mt-4 rounded-xl bg-basil/10 px-3 py-2 text-sm text-basil">{message}</p>}
    </>
  );
}
