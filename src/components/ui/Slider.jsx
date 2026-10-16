/**
 * Labelled range input. `onStart` fires once at the beginning of a drag so the
 * caller can save an undo snapshot; `onChange` fires continuously.
 */
export default function Slider({ label, value, min, max, step = 1, format = (v) => v, onChange, onStart, onReset }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        <span className="flex items-center gap-2">
          <span className="tabular-nums text-ink">{format(value)}</span>
          {onReset && (
            <button type="button" onClick={onReset} className="rounded px-1 text-[11px] text-muted underline-offset-2 hover:text-ink hover:underline">
              reset
            </button>
          )}
        </span>
      </div>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={onStart}
        onKeyDown={onStart}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}
