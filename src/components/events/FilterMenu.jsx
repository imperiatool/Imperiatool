import { useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon.jsx';

/**
 * Compact filter: a pill showing "Label: value" that opens a short list of
 * options (each with an optional description). Keyboard and outside-click aware.
 */
export default function FilterMenu({ id, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [right, setRight] = useState(false); // open towards the left near the right edge
  const ref = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];
  const active = value !== options[0].value;

  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const key = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          const r = ref.current?.getBoundingClientRect();
          setRight(Boolean(r && r.left > window.innerWidth / 2));
          setOpen((v) => !v);
        }}
        aria-haspopup="listbox"
        aria-label={`${label}: ${current.label}`}
        aria-expanded={open}
        className={`inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm sm:px-4 transition ${
          active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/40'
        }`}
        data-testid={`filter-${id}`}
      >
        <span className={`hidden sm:inline ${active ? 'text-white/70' : 'text-muted'}`}>{label}:</span>
        <span className="font-semibold">{current.label}</span>
        <Icon name="down" className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" aria-label={label} className={`absolute ${right ? 'right-0' : 'left-0'} top-full z-30 mt-2 w-max min-w-full max-w-[18rem] rounded-2xl border border-line bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]`}>
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${sel ? 'bg-brand/5 text-brand' : 'hover:bg-ink/5'}`}
                  data-testid={`filter-${id}-${o.value}`}
                >
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center">{sel && <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />}</span>
                  <span>
                    <span className="block font-semibold">{o.label}</span>
                    {o.desc && <span className="block text-xs text-muted">{o.desc}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
