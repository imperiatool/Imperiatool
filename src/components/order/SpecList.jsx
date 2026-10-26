import { useI18n } from '../../i18n/index.js';

/**
 * Product specifications: the same fields, order and wording as the box,
 * updated live with the selections. Rows without a value are left out.
 */
export default function SpecList({ rows, testid = 'specs' }) {
  const { t } = useI18n();
  const list = rows.filter(([, v]) => v);
  return (
    <section className="rounded-2xl bg-cream p-4" data-testid={testid}>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted">{t('spec.title')}</h3>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
        {list.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[11px] font-semibold uppercase leading-5 tracking-wide text-ink/60">{t(k)}</dt>
            <dd className="font-medium" data-testid={`${testid}-${k.split('.')[1]}`}>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
