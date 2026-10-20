// Pill buttons like imperia.com: solid red for the main action, red outline otherwise.
const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  basil: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'border-2 border-brand bg-white text-brand hover:bg-brand/5',
  ghost: 'text-ink hover:bg-ink/5',
  outline: 'border border-line bg-white text-ink hover:border-brand/50',
  danger: 'text-brand-dark hover:bg-brand/10',
};

const SIZES = {
  sm: 'h-8 px-3.5 text-sm gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 justify-center',
};

export default function Button({ variant = 'outline', size = 'md', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center rounded-full font-bold transition disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
