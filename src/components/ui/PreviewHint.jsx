/** The one-line instruction under every preview (3D and canvas): same type, place and colour everywhere. */
export default function PreviewHint({ children, className = '' }) {
  return <p className={`px-4 pt-2 text-center text-xs leading-snug text-muted ${className}`}>{children}</p>;
}
