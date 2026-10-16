const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-dark shadow-[0_3px_0_0_#8f100b] active:translate-y-[2px] active:shadow-none',
  secondary: 'bg-paper text-ink border-2 border-ink hover:bg-white shadow-[0_3px_0_0_#3a1f1b] active:translate-y-[2px] active:shadow-none',
  basil: 'bg-basil text-white hover:brightness-110 shadow-[0_3px_0_0_#0d2e1a] active:translate-y-[2px] active:shadow-none',
  ghost: 'text-ink hover:bg-ink/5',
  outline: 'border border-line bg-paper text-ink hover:border-ink/40',
  danger: 'text-brand-dark hover:bg-brand/10',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
  icon: 'h-9 w-9 justify-center',
};

export default function Button({ variant = 'outline', size = 'md', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
