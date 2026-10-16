import { LANGUAGES, useI18n } from '../../i18n/index.js';

/** Edits the per-language names of a category / element / colour. */
export default function LabelsEditor({ entity, onChange, hint }) {
  const { t } = useI18n();
  const labels = entity.labels || {};
  return (
    <div>
      {hint && <p className="mb-1.5 text-xs text-muted">{hint}</p>}
      <div className="grid gap-1.5 sm:grid-cols-2">
        {LANGUAGES.map((l) => (
          <label key={l.code} className="flex items-center gap-2 rounded-lg border border-line bg-white px-2 py-1">
            <span className="w-6 shrink-0 text-[11px] font-bold text-muted">{l.label}</span>
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
    </div>
  );
}
