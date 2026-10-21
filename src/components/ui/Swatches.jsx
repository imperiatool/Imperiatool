import { useI18n } from '../../i18n/index.js';

/** Row of brand-palette swatches. The only way to pick a colour in the app. */
export default function Swatches({ palette, value, onPick, size = 'h-8 w-8', extra }) {
  const { label } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {palette.map((c) => {
        const active = value && value.toLowerCase() === c.hex.toLowerCase();
        return (
          <button
            key={c.id}
            type="button"
            title={`${label(c)} ${c.hex}`}
            aria-label={label(c)}
            aria-pressed={active}
            onClick={() => onPick(c.hex)}
            className={`${size} rounded-full border border-brand/20 transition hover:scale-110 ${active ? 'ring-2 ring-brand ring-offset-2 ring-offset-paper' : ''}`}
            style={{ background: c.hex }}
          />
        );
      })}
      {extra}
    </div>
  );
}
