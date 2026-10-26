import { useI18n } from '../../i18n/index.js';

/**
 * Product specifications written like the back of the box: one line per
 * field, "Label: value" with the label in bold, same order and wording as the
 * packaging; updated live with the selections. Rows without a value are left out.
 */
export default function SpecList({ rows, testid = 'specs' }) {
  const { t } = useI18n();
  const list = rows.filter(([, v]) => v);
  return (
    <section className="border-t border-line pt-4" data-testid={testid}>
      <h3 className="text-[15px] font-bold uppercase leading-tight tracking-[-0.01em] text-brand">{t('spec.title')}</h3>
      <ul className="mt-2.5 space-y-0.5 text-[15px] leading-snug tracking-[-0.01em] text-ink">
        {list.map(([k, v]) => (
          <li key={k} data-testid={`${testid}-${k.split('.')[1]}`}>
            <span className="font-bold">{t(k)}:</span> {v}
          </li>
        ))}
      </ul>
    </section>
  );
}
