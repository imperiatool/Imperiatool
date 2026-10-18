// Little 2D pictograms of the cover patterns (shown on the pattern buttons).
const W = 40;
const H = 72;

function body(p, color, dark) {
  const dots = (x1, y1, x2, y2, n) =>
    Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      return <circle key={`${x1}${y1}${i}`} cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r="0.7" fill={dark} />;
    });
  switch (p) {
    case 'raviolo':
      return Array.from({ length: 26 }, (_, i) => {
        const per = 2 * (W - 8) + 2 * (H - 8);
        let s = (i / 26) * per;
        let x;
        let y;
        if (s < W - 8) [x, y] = [4 + s, 4];
        else if ((s -= W - 8) < H - 8) [x, y] = [W - 4, 4 + s];
        else if ((s -= H - 8) < W - 8) [x, y] = [W - 4 - s, H - 4];
        else [x, y] = [4, H - 4 - (s - (W - 8))];
        return <circle key={i} cx={x} cy={y} r="1.8" fill={dark} opacity="0.55" />;
      });
    case 'ravioli':
      return [0, 1, 2, 3].flatMap((c) =>
        [0, 1, 2, 3, 4, 5, 6].map((r) =>
          c < 2 && r < 2 ? null : <rect key={`${c}${r}`} x={4.5 + c * 8} y={4.5 + r * 9.2} width="6" height="7" rx="2" fill={dark} opacity="0.35" />,
        ),
      );
    case 'sfoglia':
      return [
        ...[1, 2, 3].flatMap((c) => dots(4 + c * 8, c < 3 ? 4 : 4, 4 + c * 8, H - 4, 14)),
        ...[1, 2, 3, 4, 5, 6].flatMap((r) => dots(4, 4 + r * 9.2, W - 4, 4 + r * 9.2, 8)),
      ];
    case 'tagliatelle':
      return [0, 1, 2, 3].map((c) => (
        <path key={c} d={`M${8 + c * 8} ${c < 2 ? 26 : 5} q 3 4 0 8 t 0 8 t 0 8 t 0 8 t 0 8 t 0 8${c < 2 ? '' : ' t 0 8 t 0 8'}`} fill="none" stroke={dark} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      ));
    case 'spaghetti':
      return Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={5 + i * 3} x2={5 + i * 3} y1={i < 6 ? 25 : 5} y2={H - 5} stroke={dark} strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
      ));
    case 'spighe':
      return [14, 28].flatMap((cx, ci) =>
        Array.from({ length: ci === 0 ? 7 : 10 }, (_, i) => {
          const y = (ci === 0 ? 30 : 6) + i * 4.4;
          return (
            <g key={`${ci}${i}`} stroke={dark} strokeWidth="1.6" strokeLinecap="round" opacity="0.5">
              <line x1={cx} y1={y + 2} x2={cx - 3} y2={y} />
              <line x1={cx} y1={y + 2} x2={cx + 3} y2={y} />
            </g>
          );
        }),
      );
    default:
      return null;
  }
}

export default function PatternIcon({ pattern, color = '#ffb548', dark = '#3a1f1b', className = 'h-16 w-9' }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      <rect x="0.8" y="0.8" width={W - 1.6} height={H - 1.6} rx="7" fill={color} stroke={dark} strokeOpacity="0.25" />
      <rect x="4" y="4" width="15" height="16" rx="4" fill="#efe9df" stroke={dark} strokeOpacity="0.3" />
      {body(pattern, color, dark)}
    </svg>
  );
}
