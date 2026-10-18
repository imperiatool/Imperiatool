// Small inline SVG flags (emoji flags do not render on Windows).
const FLAGS = {
  en: (
    <>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0l60 40M60 0L0 40" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="7" />
    </>
  ),
  es: (
    <>
      <rect width="60" height="40" fill="#AA151B" />
      <rect y="10" width="60" height="20" fill="#F1BF00" />
    </>
  ),
  fr: (
    <>
      <rect width="60" height="40" fill="#fff" />
      <rect width="20" height="40" fill="#002395" />
      <rect x="40" width="20" height="40" fill="#ED2939" />
    </>
  ),
  it: (
    <>
      <rect width="60" height="40" fill="#fff" />
      <rect width="20" height="40" fill="#009246" />
      <rect x="40" width="20" height="40" fill="#CE2B37" />
    </>
  ),
};

export default function Flag({ code, className = 'h-4 w-6' }) {
  return (
    <svg viewBox="0 0 60 40" className={`${className} shrink-0 overflow-hidden rounded-[3px] ring-1 ring-ink/15`} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {FLAGS[code]}
    </svg>
  );
}
