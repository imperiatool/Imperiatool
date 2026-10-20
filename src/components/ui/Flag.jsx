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
  de: (
    <>
      <rect width="60" height="40" fill="#000" />
      <rect y="13.33" width="60" height="13.34" fill="#DD0000" />
      <rect y="26.67" width="60" height="13.33" fill="#FFCE00" />
    </>
  ),
  zh: (
    <>
      <rect width="60" height="40" fill="#EE1C25" />
      <polygon points="10.00,4.00 11.35,8.15 15.71,8.15 12.18,10.71 13.53,14.85 10.00,12.29 6.47,14.85 7.82,10.71 4.29,8.15 8.65,8.15" fill="#FFDE00" />
      <polygon points="21.49,2.82 20.73,3.97 21.58,5.05 20.25,4.68 19.49,5.83 19.43,4.45 18.10,4.08 19.40,3.60 19.34,2.22 20.19,3.30" fill="#FFDE00" />
      <polygon points="25.83,7.49 24.68,8.25 25.05,9.58 23.97,8.73 22.82,9.49 23.30,8.19 22.22,7.34 23.60,7.39 24.08,6.10 24.45,7.43" fill="#FFDE00" />
      <polygon points="24.00,11.10 24.43,12.41 25.81,12.41 24.69,13.22 25.12,14.54 24.00,13.73 22.88,14.54 23.31,13.22 22.19,12.41 23.57,12.41" fill="#FFDE00" />
      <polygon points="21.07,15.43 20.68,16.76 21.82,17.54 20.44,17.57 20.05,18.90 19.59,17.60 18.21,17.64 19.30,16.80 18.84,15.50 19.98,16.27" fill="#FFDE00" />
    </>
  ),
  hi: (
    <>
      <rect width="60" height="40" fill="#fff" />
      <rect width="60" height="13.33" fill="#FF9933" />
      <rect y="26.67" width="60" height="13.33" fill="#138808" />
      <circle cx="30" cy="20" r="5" fill="none" stroke="#000080" strokeWidth="1.2" />
      <circle cx="30" cy="20" r="1" fill="#000080" />
    </>
  ),
};

export default function Flag({ code, className = 'h-4 w-6' }) {
  return (
    <svg viewBox="0 0 60 40" className={`${className} shrink-0 overflow-hidden rounded-[3px] ring-1 ring-ink/10`} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {FLAGS[code]}
    </svg>
  );
}
