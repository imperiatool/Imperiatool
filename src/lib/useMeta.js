import { useEffect } from 'react';

/**
 * Page title, description and structured data (schema.org JSON-LD) for the
 * current page, so search engines and AI assistants can read what each page
 * offers. Everything here is also written as visible text on the page.
 */
export function useMeta({ title, description, jsonld }) {
  const ld = jsonld ? JSON.stringify(jsonld) : '';
  useEffect(() => {
    if (title) document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    if (description) meta.setAttribute('content', description);
    let script = document.getElementById('page-ld');
    if (ld) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'page-ld';
        document.head.appendChild(script);
      }
      script.textContent = ld;
    } else script?.remove();
  }, [title, description, ld]);
}
