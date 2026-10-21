import { useState } from 'react';
import Flag from './Flag.jsx';
import Icon from './Icon.jsx';
import { LANGUAGES, useI18n } from '../../i18n/index.js';
import { autoTranslateLabels, hasTranslator } from '../../lib/translate.js';

/** Edits the per-language names of a category / element / colour. */
export default function LabelsEditor({ entity, onChange, hint }) {
  const { t, lang } = useI18n();
  const labels = entity.labels || {};
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const translate = async () => {
    if (!hasTranslator()) return setMsg(t('labels.noTranslator'));
    // translate from the current UI language, or from any filled-in one
    const source = labels[lang] ? lang : LANGUAGES.find((l) => labels[l.code])?.code;
    const base = source ? labels : { ...labels, [lang]: entity.name };
    setBusy(true);
    const next = await autoTranslateLabels(base, source || lang, LANGUAGES.map((l) => l.code));
    setBusy(false);
    onChange(next);
    setMsg(t('labels.done'));
  };

  return (
    <div>
      {hint && <p className="mb-1.5 text-xs text-muted">{hint}</p>}
      <div className="grid gap-1.5 sm:grid-cols-2">
        {LANGUAGES.map((l) => (
          <label key={l.code} className="flex items-center gap-2 rounded-lg border border-line bg-white px-2 py-1">
            <Flag code={l.code} className="h-3.5 w-5" />
            <input
              value={labels[l.code] ?? ''}
              placeholder={entity.name}
              onChange={(e) => {
                const next = { ...labels, [l.code]: e.target.value };
                if (!e.target.value) delete next[l.code];
                onChange(next);
              }}
              className="min-w-0 flex-1 bg-transparent py-0.5 text-sm outline-none"
              aria-label={`${t('as.name')} (${l.name})`}
            />
          </label>
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={translate}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand hover:bg-brand/10 disabled:opacity-50"
        >
          <Icon name="translate" className="h-3.5 w-3.5" /> {busy ? t('labels.translating') : t('labels.autoTranslate')}
        </button>
        {msg && <span className="text-xs text-muted">{msg}</span>}
      </div>
    </div>
  );
}
