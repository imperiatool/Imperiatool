// Bottom of the site, with the company details of the official Imperia
// website (wording kept as given). Link destinations are listed here: a
// label with no verified destination is shown as text, never as a link that
// goes nowhere. Fill `href` once the official address of each page is confirmed.
import { useCartStore } from '../../store/useCartStore.js';

const COMPANY = [
  { title: 'Administration and Logistics', lines: ['Imperia & Monferrina S.p.a.', 'Via Vittime di Piazza Fontana, 48', '10024 Moncalieri (TO) – Italy'] },
  { title: 'Production and Service', lines: ['Imperia & Monferrina S.p.a.', 'S.S. n. 457 – Via Statale, 27/A', 'I-14033 Castell’Alfero (AT) – Italy'] },
  { title: 'Registered office', lines: ['Registro Imprese di Roma', 'n. 03773641000', 'I-00198 Roma, Via Savoia, 82'] },
  { title: 'Tax information', lines: ['P. Iva e C.F. IT 03773641000', 'Capitale Sociale i.v. € 5.700.000', 'Posizione Estero Rm 026455'] },
];

// groups as on the official site; `href: null` = destination not verified yet
// ('account' opens this app's own account panel)
export const FOOTER_LINKS = [
  [
    { label: 'Shop online', href: null },
    { label: 'My Account', action: 'account' },
    { label: 'Recycling', href: null },
    { label: 'Contacts & Inquiry', href: null },
    { label: 'Assistance', href: null },
  ],
  [{ label: 'User’s Guide', href: null }],
  [
    { label: 'Corporate', href: null },
    { label: 'Informative Privacy', href: null },
    { label: 'Whistleblowing', href: null },
  ],
  [{ label: 'Dichiarazione di accessibilità', href: null }],
  [{ label: 'Credits', href: null }],
];

export default function Footer() {
  const show = useCartStore((s) => s.show);
  const item = (l) => {
    if (l.action === 'account')
      return (
        <button type="button" onClick={() => show('account')} className="text-left hover:underline hover:underline-offset-4" data-testid="footer-account">
          {l.label}
        </button>
      );
    if (l.href)
      return (
        <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:underline hover:underline-offset-4">
          {l.label}
        </a>
      );
    return <span>{l.label}</span>;
  };
  return (
    <footer className="border-t border-line bg-cream px-4 pb-28 pt-10 text-ink sm:px-6 lg:pb-10" data-testid="site-footer">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {COMPANY.map((c) => (
            <address key={c.title} className="not-italic">
              <p className="text-[15px] font-bold">{c.title}</p>
              <p className="mt-2 text-sm leading-relaxed">
                {c.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </p>
            </address>
          ))}
        </div>
        <nav aria-label="Imperia" className="mt-10 grid gap-6 border-t border-line pt-8 text-sm sm:grid-cols-3 lg:grid-cols-5">
          {FOOTER_LINKS.map((group, i) => (
            <ul key={i} className="space-y-1.5">
              {group.map((l) => (
                <li key={l.label}>{item(l)}</li>
              ))}
            </ul>
          ))}
        </nav>
      </div>
    </footer>
  );
}
