/**
 * Same title block on every product page (Case, Charm, Sticker):
 * red product name + one line on how it works.
 */
export default function PageHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-4 gap-y-2 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-brand sm:text-[28px]" data-testid="page-title">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
