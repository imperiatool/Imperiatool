// Imperia® Events — concept programme.
// Everything here is ILLUSTRATIVE: the events, venues, dates and places are
// fictional sample listings for a brand-extension prototype. Nothing is on
// sale and no booking is ever sent anywhere.
//
// Texts: `en` is required, `it` is optional (other languages fall back to English).
// Prices are in the currency of the event's country (no conversion).
import reginetteImg from '../assets/events/reginette.webp';
import sculptureImg from '../assets/events/sculpture.webp';
import spaghettiImg from '../assets/events/spaghetti.webp';
import gnocchiImg from '../assets/events/gnocchi.webp';
import fusilliImg from '../assets/events/fusilli.webp';
import ravioliImg from '../assets/events/ravioli.webp';

export const EVENT_TYPES = ['workshop', 'shapelab', 'supper', 'collab'];
export const EVENT_FORMATS = ['hands-on', 'social', 'design-led'];
export const EVENT_COUNTRIES = ['it', 'uk'];
export const PRICE_BANDS = ['free', 'under25', '25to50', 'over50'];
export const CURRENCY_OF = { it: 'EUR', uk: 'GBP' };

/** Price band of an amount (same thresholds in £ and €). */
export function priceBand(price) {
  if (!price) return 'free';
  if (price < 25) return 'under25';
  if (price <= 50) return '25to50';
  return 'over50';
}

/** filters = { type, country, format, price } — 'all' (or empty) means no filter */
export function filterEvents(list, { type, country, format, price } = {}) {
  const on = (v) => v && v !== 'all';
  return list.filter(
    (e) =>
      (!on(type) || e.type === type) &&
      (!on(country) || e.country === country) &&
      (!on(format) || e.formats.includes(format)) &&
      (!on(price) || priceBand(e.price) === price),
  );
}

/** Text of a field in the current language (English fallback). */
export const tx = (field, lang) => (field && typeof field === 'object' && !Array.isArray(field) ? field[lang] ?? field.en : field);

// visual = the pasta object (rendered with the app's 3D studio, see
// scripts/render-events.py) + palette colours for the object and its backdrop
export const EVENTS = [
  {
    id: 'shape-of-pasta',
    number: '01',
    type: 'workshop',
    kind: { en: 'Pasta Workshop', it: 'Workshop di pasta' },
    formats: ['hands-on'],
    country: 'it',
    city: { en: 'Milan', it: 'Milano' },
    venue: 'Laboratorio Forma',
    start: '2026-11-21T11:00',
    minutes: 150,
    price: 35,
    places: 12,
    level: 'raw',
    visual: { shape: 'reginette', color: '#ffb548', finish: 'raw', bg: '#e1201b', ink: '#ffffff', img: reginetteImg },
    title: { en: 'Shape of Pasta', it: 'Shape of Pasta' },
    short: {
      en: 'Fresh dough, a few simple tools and the shapes that made Italian pasta famous.',
      it: 'Impasto fresco, pochi strumenti e le forme che hanno reso famosa la pasta italiana.',
    },
    description: {
      en: 'A hands-on morning on how one sheet of dough becomes dozens of shapes. We start with flour and eggs, roll the sheet by hand and by machine, then cut, fold, pinch and ruffle it into the classics, from tagliatelle to reginette. You leave knowing why each shape exists, and with a box of the ones you made.',
      it: 'Una mattinata pratica per scoprire come una sola sfoglia diventa decine di forme. Si parte da farina e uova, si tira la sfoglia a mano e a macchina, poi si taglia, si piega, si pizzica e si arriccia nei grandi classici, dalle tagliatelle alle reginette. Esci sapendo perché esiste ogni forma, con una scatola di quelle che hai fatto.',
    },
    included: {
      en: ['All ingredients and an apron', 'Use of pasta machines and cutters', 'A printed shape guide', 'A box to take your pasta home'],
      it: ['Tutti gli ingredienti e un grembiule', 'Macchine per la pasta e tagliapasta', 'Una guida stampata alle forme', 'Una scatola per portare a casa la tua pasta'],
    },
    make: {
      en: ['Fresh egg dough from scratch', 'Tagliatelle, pappardelle and reginette', 'Your own signature cut'],
      it: ['Impasto all’uovo da zero', 'Tagliatelle, pappardelle e reginette', 'Un tuo taglio personale'],
    },
  },
  {
    id: 'shape-lab',
    number: '02',
    type: 'shapelab',
    kind: { en: 'Shape Lab', it: 'Shape Lab' },
    formats: ['design-led', 'hands-on'],
    country: 'uk',
    city: { en: 'London', it: 'Londra' },
    venue: 'The Fold Studio',
    start: '2026-11-28T14:00',
    minutes: 180,
    price: 28,
    places: 16,
    level: 'raw',
    visual: { shape: 'sculpture', color: '#e1201b', finish: 'aldente', bg: '#f8eabe', ink: '#1d1d1b', img: sculptureImg },
    title: { en: 'Shape Lab: Beyond the Classic', it: 'Shape Lab: oltre i classici' },
    short: {
      en: 'Pasta as a design material: folds, ridges and forms that don’t exist yet.',
      it: 'La pasta come materiale di design: pieghe, righe e forme che ancora non esistono.',
    },
    description: {
      en: 'A playful design session that treats dough like clay. Guided by a few rules of pasta geometry (how ridges hold sauce, how folds keep their shape when cooked), you sketch, prototype and photograph your own experimental shapes. No cooking experience needed; curiosity is the only requirement.',
      it: 'Una sessione di design giocosa che tratta l’impasto come argilla. Partendo da alcune regole della geometria della pasta (come le righe trattengono il sugo, come le pieghe resistono alla cottura), disegni, prototipi e fotografi le tue forme sperimentali. Non serve saper cucinare: basta la curiosità.',
    },
    included: {
      en: ['Coloured doughs and shaping tools', 'Sketchbook and shape cards', 'A photo corner to document your work', 'Tea, coffee and something sweet'],
      it: ['Impasti colorati e attrezzi per modellare', 'Quaderno e schede delle forme', 'Un angolo foto per documentare il lavoro', 'Tè, caffè e qualcosa di dolce'],
    },
    make: {
      en: ['A set of shape studies', 'One original pasta shape, named by you', 'A printed shape card to keep'],
      it: ['Una serie di studi di forma', 'Una forma di pasta originale, con il nome che scegli tu', 'Una scheda stampata da conservare'],
    },
  },
  {
    id: 'pasta-after-hours',
    number: '03',
    type: 'supper',
    kind: { en: 'Supper Club', it: 'Supper club' },
    formats: ['social'],
    country: 'uk',
    city: { en: 'Manchester', it: 'Manchester' },
    venue: 'Long Table Room',
    start: '2026-12-04T19:30',
    minutes: 180,
    price: 32,
    places: 24,
    level: 'raw',
    visual: { shape: 'spaghetti', color: '#ffb548', finish: 'aldente', bg: '#6a3933', ink: '#ffffff', img: spaghettiImg },
    title: { en: 'Pasta After Hours', it: 'Pasta After Hours' },
    short: {
      en: 'One long table, fresh pasta, a playlist and people you haven’t met yet.',
      it: 'Una lunga tavolata, pasta fresca, una playlist e persone che non conosci ancora.',
    },
    description: {
      en: 'An evening built around the social side of Italian food. Guests sit together at one long table for three relaxed courses of fresh pasta, served family-style, while a guest selector looks after the music. Halfway through, everyone gets their hands floury for a quick round of shaping.',
      it: 'Una serata dedicata al lato sociale del cibo italiano. Si siede tutti insieme a un’unica lunga tavolata per tre portate di pasta fresca servite al centro, mentre un selector pensa alla musica. A metà serata, tutti con le mani nella farina per un giro veloce di forme.',
    },
    included: {
      en: ['Three sharing courses of fresh pasta', 'A welcome drink', 'Live DJ selection', 'A mini shaping session at the table'],
      it: ['Tre portate di pasta fresca da condividere', 'Un drink di benvenuto', 'Selezione musicale dal vivo', 'Una mini sessione di forme al tavolo'],
    },
    make: {
      en: ['New friends around one table', 'A plate of spaghetti twirled your way', 'The evening’s playlist, to take home'],
      it: ['Nuovi amici attorno a un tavolo', 'Un piatto di spaghetti arrotolati a modo tuo', 'La playlist della serata, da portare a casa'],
    },
  },
  {
    id: 'aperitivo-al-dente',
    number: '04',
    type: 'supper',
    kind: { en: 'Social Aperitivo', it: 'Aperitivo' },
    formats: ['social'],
    country: 'it',
    city: { en: 'Bologna', it: 'Bologna' },
    venue: 'Bancone 42',
    start: '2026-12-11T18:30',
    minutes: 120,
    price: 25,
    places: 30,
    level: 'raw',
    visual: { shape: 'gnocchi', color: '#f8eabe', finish: 'raw', bg: '#1a5632', ink: '#ffffff', img: gnocchiImg },
    title: { en: 'Aperitivo & Al Dente', it: 'Aperitivo & Al Dente' },
    short: {
      en: 'A contemporary aperitivo of handmade pasta bites and unexpected pairings.',
      it: 'Un aperitivo contemporaneo di bocconi di pasta fatta a mano e abbinamenti inattesi.',
    },
    description: {
      en: 'The Bolognese ritual of aperitivo, reworked. Small handmade bites, from crisp gnocchi to filled pasta in a glass, are paired with bitter, sparkling and alcohol-free drinks around a standing counter. Easy to drop into, easy to stay late.',
      it: 'Il rito bolognese dell’aperitivo, rivisitato. Piccoli bocconi fatti a mano, dagli gnocchi croccanti alla pasta ripiena nel bicchiere, abbinati a drink amari, frizzanti e analcolici attorno a un bancone. Facile arrivare, difficile andare via presto.',
    },
    included: {
      en: ['Five handmade pasta bites', 'Two drinks (alcohol-free options)', 'A live gnocchi-rolling demo', 'Recipe cards for every bite'],
      it: ['Cinque bocconi di pasta fatta a mano', 'Due drink (anche analcolici)', 'Una dimostrazione dal vivo di gnocchi rigati', 'Le ricette di ogni boccone'],
    },
    make: {
      en: ['Ridged gnocchi on the board, your first time or your hundredth', 'Your favourite pairing of the night', 'An easy aperitivo to host at home'],
      it: ['Gnocchi rigati sul tagliere, che sia la prima o la centesima volta', 'Il tuo abbinamento preferito della serata', 'Un aperitivo facile da rifare a casa'],
    },
  },
  {
    id: 'make-shoot-share',
    number: '05',
    type: 'collab',
    kind: { en: 'Creative Collaboration', it: 'Collaborazione creativa' },
    formats: ['design-led', 'social'],
    country: 'uk',
    city: { en: 'Liverpool', it: 'Liverpool' },
    venue: 'Frame Kitchen',
    start: '2027-01-16T13:00',
    minutes: 150,
    price: 20,
    places: 14,
    level: 'aldente',
    visual: { shape: 'fusilli', color: '#1a5632', finish: 'aldente', bg: '#ffb548', ink: '#1d1d1b', img: fusilliImg },
    title: { en: 'Make, Shoot, Share', it: 'Make, Shoot, Share' },
    short: {
      en: 'Food styling, photography and short-form video, with pasta as the subject.',
      it: 'Food styling, fotografia e video brevi, con la pasta come protagonista.',
    },
    description: {
      en: 'A creative afternoon with a food stylist and a content creator. In small teams you build a set around a pasta shape (its spirals, ridges and textures), then light it, shoot it and edit a short vertical story on your phone. The best frames go up on the studio wall at the end.',
      it: 'Un pomeriggio creativo con una food stylist e un content creator. In piccoli gruppi costruisci un set attorno a una forma di pasta (spirali, righe, texture), poi la illumini, la fotografi e monti una breve storia verticale con il telefono. Alla fine le inquadrature migliori finiscono sulla parete dello studio.',
    },
    included: {
      en: ['Styled sets, props and coloured pasta', 'Lighting kit and phone rigs', 'Editing tips from the creators', 'Your best shot printed'],
      it: ['Set, oggetti di scena e pasta colorata', 'Luci e supporti per il telefono', 'Consigli di montaggio dai creator', 'Lo scatto migliore stampato'],
    },
    make: {
      en: ['A styled still-life shoot', 'A 15-second vertical story', 'A print of your favourite frame'],
      it: ['Uno still life in stile editoriale', 'Una storia verticale di 15 secondi', 'La stampa della tua inquadratura preferita'],
    },
  },
  {
    id: 'pasta-club-sunday',
    number: '06',
    type: 'workshop',
    kind: { en: 'Pasta Workshop · Social', it: 'Workshop di pasta · Social' },
    formats: ['hands-on', 'social'],
    country: 'it',
    city: { en: 'Florence', it: 'Firenze' },
    venue: 'Casa Sfoglia',
    start: '2027-01-24T11:30',
    minutes: 210,
    price: 30,
    places: 10,
    level: 'aldente',
    visual: { shape: 'ravioli', color: '#ffb548', finish: 'raw', bg: '#ececea', ink: '#1d1d1b', img: ravioliImg },
    title: { en: 'Pasta Club: Sunday Edition', it: 'Pasta Club: Sunday Edition' },
    short: {
      en: 'A slow Sunday in a small group: make ravioli, cook them, share the table.',
      it: 'Una domenica lenta in piccolo gruppo: fare i ravioli, cuocerli, condividere la tavola.',
    },
    description: {
      en: 'Ten people, one kitchen and the whole of Sunday lunch. You make filled pasta the traditional way, then try a couple of contemporary fillings and folds, cook everything together and sit down to eat what you made. Small on purpose, so there’s time to talk.',
      it: 'Dieci persone, una cucina e tutto il pranzo della domenica. Prepari la pasta ripiena come da tradizione, poi provi un paio di ripieni e chiusure contemporanei, si cuoce tutto insieme e ci si siede a mangiare quello che si è fatto. Piccolo di proposito, per avere tempo di parlare.',
    },
    included: {
      en: ['All ingredients and an apron', 'Hands-on teaching in a group of ten', 'Sunday lunch with what you made', 'Coffee and a seasonal dessert'],
      it: ['Tutti gli ingredienti e un grembiule', 'Lezione pratica in un gruppo di dieci', 'Il pranzo della domenica con ciò che hai preparato', 'Caffè e un dolce di stagione'],
    },
    make: {
      en: ['Classic ricotta ravioli', 'Two contemporary fillings and folds', 'A shared Sunday lunch'],
      it: ['Ravioli classici di ricotta', 'Due ripieni e chiusure contemporanei', 'Un pranzo domenicale condiviso'],
    },
  },
];

export const eventById = (id) => EVENTS.find((e) => e.id === id);
