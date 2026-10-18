// Automatic translation with the translator built into the browser
// (Chrome / Edge 138+, on-device, free, no API key). Feature-detected:
// other browsers simply don't show the result and the admin types names by hand.

export function hasTranslator() {
  return typeof self !== 'undefined' && 'Translator' in self;
}

const cache = new Map();
async function translator(source, target) {
  const key = `${source}>${target}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      (async () => {
        const availability = await self.Translator.availability({ sourceLanguage: source, targetLanguage: target });
        if (availability === 'unavailable') throw new Error('unavailable');
        return self.Translator.create({ sourceLanguage: source, targetLanguage: target });
      })(),
    );
  }
  return cache.get(key);
}

/** Fills every empty language of `labels` translating from `source`. */
export async function autoTranslateLabels(labels, source, languages) {
  const text = labels[source];
  if (!text || !hasTranslator()) return labels;
  const out = { ...labels };
  for (const lang of languages) {
    if (lang === source || out[lang]) continue;
    try {
      const tr = await translator(source, lang);
      out[lang] = await tr.translate(text);
    } catch {
      /* this language pair is not available: leave it empty */
    }
  }
  return out;
}
