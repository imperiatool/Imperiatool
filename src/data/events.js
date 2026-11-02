// Imperia® Events — concept programme.
// Everything here is ILLUSTRATIVE: events, venues, dates and places are
// fictional sample listings for a brand-extension prototype. Nothing is on
// sale and no booking is ever sent anywhere.
//
// Every text is given in the seven languages of the app (L(en, it, es, fr, de, zh, hi)).
// Prices are plain numbers, shown in £ or € by the interface language (no conversion).
import reginetteImg from '../assets/events/reginette.webp';
import sculptureImg from '../assets/events/sculpture.webp';
import spaghettiImg from '../assets/events/spaghetti.webp';
import gnocchiImg from '../assets/events/gnocchi.webp';
import fusilliImg from '../assets/events/fusilli.webp';
import ravioliImg from '../assets/events/ravioli.webp';
import tagliatelleImg from '../assets/events/tagliatelle.webp';

const L = (en, it, es, fr, de, zh, hi) => ({ en, it, es, fr, de, zh, hi });

export const EVENT_TYPES = ['workshop', 'shapelab', 'supper', 'collab'];
export const EVENT_FORMATS = ['hands-on', 'social', 'design-led'];
export const EVENT_COUNTRIES = ['it', 'uk'];
// experience levels: Beginner, Intermediate, Advanced (stored with the names of
// the Imperia finishes they replace: Raw, Al Dente, Overcooked)
export const EVENT_LEVELS = ['raw', 'aldente', 'overcooked'];
// 'featured' = the programme's own order (01 to 06)
export const EVENT_SORTS = ['featured', 'date', 'priceAsc', 'priceDesc'];

// Experience prices follow the language of the interface: the same number in
// pounds (English) or euros (Italian and the other European languages). No
// exchange-rate conversion is ever applied.
const EXPERIENCE_CURRENCY = { en: 'GBP', it: 'EUR', es: 'EUR', fr: 'EUR', de: 'EUR', zh: 'GBP', hi: 'GBP' };
export const experienceCurrency = (lang) => EXPERIENCE_CURRENCY[lang] || 'GBP';
/** The one price formatter of the Experiences (cards, detail pages, booking, summaries). */
export function formatExperiencePrice(amount, lang, locale) {
  const n = Number(amount) || 0;
  const whole = Number.isInteger(n);
  return n.toLocaleString(locale, { style: 'currency', currency: experienceCurrency(lang), minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
}

/** filters = { type, country, format, level } — 'all' (or empty) means no filter */
export function filterEvents(list, { type, country, format, level } = {}) {
  const on = (v) => v && v !== 'all';
  return list.filter(
    (e) =>
      (!on(type) || e.type === type) &&
      (!on(country) || e.country === country) &&
      (!on(format) || e.formats.includes(format)) &&
      (!on(level) || e.level === level),
  );
}

/** Sorted copy: programme order (default), by date or by price. */
export function sortEvents(list, sort = 'featured') {
  const byNumber = (a, b) => (a.number || '').localeCompare(b.number || '');
  // experiences without a published date (sold out) go last when sorting by date
  const byDate = (a, b) => (a.start || '9999').localeCompare(b.start || '9999') || byNumber(a, b);
  const out = [...list];
  if (sort === 'date') return out.sort(byDate);
  if (sort === 'priceAsc') return out.sort((a, b) => a.price - b.price || byNumber(a, b));
  if (sort === 'priceDesc') return out.sort((a, b) => b.price - a.price || byNumber(a, b));
  return out.sort(byNumber);
}

/** Text of a field in the current language (English fallback). */
export const tx = (field, lang) => (field && typeof field === 'object' && !Array.isArray(field) ? field[lang] ?? field.en : field);

// The six in-person Experiences, in the order they are shown.
// visual = the pasta object (rendered with the app's 3D studio, see
// scripts/render-events.py) + its backdrop: the Imperia colours in turn
// (red, yellow, basil green, cream)
// Titles are the experiences' own names and stay the same in every language.
const N = (name) => L(name, name, name, name, name, name, name);

export const EVENTS = [
  {
    id: 'cecconis',
    shapes: L('Fresh pasta made from scratch, rolled and shaped by hand', 'Pasta fresca fatta da zero, tirata e modellata a mano', 'Pasta fresca hecha desde cero, estirada y formada a mano', 'Des pâtes fraîches faites maison, abaissées et façonnées à la main', 'Frische Pasta von Grund auf, von Hand ausgerollt und geformt', '从零开始的新鲜意面，手工擀制和塑形', 'शुरू से बना ताज़ा पास्ता, हाथ से बेला और आकार दिया हुआ'),
    number: '01',
    type: 'workshop',
    formats: ['hands-on'],
    country: 'uk',
    city: L('London', 'Londra', 'Londres', 'Londres', 'London', '伦敦', 'लंदन'),
    venue: 'Cecconi’s',
    venueFirst: true,
    // sold out: no date, length or places were ever published for it, so none are shown
    start: null,
    minutes: null,
    price: 45,
    places: null,
    level: 'raw',
    soldOut: true,
    visual: { shape: 'tagliatelle', color: '#ffb548', finish: 'raw', bg: '#e1201b', ink: '#ffffff', img: tagliatelleImg },
    title: N('Cecconi’s × Imperia'),
    subtitle: L('Traditional Pasta Masterclass', 'Masterclass di pasta tradizionale', 'Masterclass de pasta tradicional', 'Masterclass de pâtes traditionnelles', 'Masterclass für traditionelle Pasta', '传统意面大师课', 'पारंपरिक पास्ता मास्टरक्लास'),
    short: L(
      'A traditional Italian pasta-making experience in collaboration with Cecconi’s, bringing the art of handmade pasta to London.',
      'Un’esperienza di pasta fatta a mano secondo la tradizione italiana, in collaborazione con Cecconi’s, che porta a Londra l’arte della pasta fresca.',
      'Una experiencia de pasta tradicional italiana en colaboración con Cecconi’s, que lleva a Londres el arte de la pasta hecha a mano.',
      'Une expérience de pâtes italiennes traditionnelles en collaboration avec Cecconi’s, qui apporte à Londres l’art des pâtes faites main.',
      'Ein traditionelles italienisches Pasta-Erlebnis in Zusammenarbeit mit Cecconi’s, das die Kunst handgemachter Pasta nach London bringt.',
      '与 Cecconi’s 合作的传统意大利手工意面体验，把手工意面的技艺带到伦敦。',
      'Cecconi’s के साथ मिलकर पारंपरिक इतालवी पास्ता बनाने का अनुभव, जो हाथ से बने पास्ता की कला को लंदन लाता है।',
    ),
    description: L(
      'Discover the art of traditional Italian pasta-making in a special collaboration between Imperia and Cecconi’s. Learn to prepare fresh pasta from scratch, explore traditional techniques and enjoy a hands-on experience inspired by Italian food culture.',
      'Scopri l’arte della pasta fatta a mano secondo la tradizione italiana, in una collaborazione speciale tra Imperia e Cecconi’s. Impara a preparare la pasta fresca da zero, esplora le tecniche tradizionali e vivi un’esperienza pratica ispirata alla cultura gastronomica italiana.',
      'Descubre el arte de la pasta tradicional italiana en una colaboración especial entre Imperia y Cecconi’s. Aprende a preparar pasta fresca desde cero, explora las técnicas tradicionales y disfruta de una experiencia práctica inspirada en la cultura gastronómica italiana.',
      'Découvrez l’art des pâtes italiennes traditionnelles dans une collaboration spéciale entre Imperia et Cecconi’s. Apprenez à préparer des pâtes fraîches de A à Z, explorez les techniques traditionnelles et profitez d’une expérience pratique inspirée de la culture culinaire italienne.',
      'Entdecke die Kunst der traditionellen italienischen Pasta in einer besonderen Zusammenarbeit von Imperia und Cecconi’s. Lerne, frische Pasta von Grund auf zuzubereiten, entdecke traditionelle Techniken und genieße ein praktisches Erlebnis, inspiriert von der italienischen Esskultur.',
      '在 Imperia 与 Cecconi’s 的特别合作中，探索传统意大利手工意面的技艺。学习从零开始制作新鲜意面，了解传统技法，享受一次受意大利饮食文化启发的动手体验。',
      'Imperia और Cecconi’s के एक खास सहयोग में पारंपरिक इतालवी पास्ता बनाने की कला खोजें। शुरू से ताज़ा पास्ता बनाना सीखें, पारंपरिक तकनीकें जानें और इतालवी खान-पान संस्कृति से प्रेरित एक हैंड्स-ऑन अनुभव का आनंद लें।',
    ),
    included: [
      L('Traditional pasta-making masterclass', 'Masterclass di pasta tradizionale', 'Masterclass de pasta tradicional', 'Masterclass de pâtes traditionnelles', 'Masterclass für traditionelle Pasta', '传统意面制作大师课', 'पारंपरिक पास्ता बनाने की मास्टरक्लास'),
      L('Ingredients and pasta-making equipment', 'Ingredienti e attrezzatura per la pasta', 'Ingredientes y utensilios para hacer pasta', 'Ingrédients et matériel pour les pâtes', 'Zutaten und Pasta-Ausrüstung', '食材和制面工具', 'सामग्री और पास्ता बनाने का सामान'),
      L('Guided instruction', 'Istruzioni guidate', 'Instrucción guiada', 'Accompagnement guidé', 'Angeleitete Schritte', '全程指导', 'मार्गदर्शन के साथ सिखाना'),
      L('Hands-on pasta preparation', 'Preparazione pratica della pasta', 'Preparación práctica de la pasta', 'Préparation pratique des pâtes', 'Pasta selbst zubereiten', '亲手制作意面', 'खुद हाथ से पास्ता तैयार करना'),
    ],
    make: [
      L('Discover the basics of fresh pasta', 'Scopri le basi della pasta fresca', 'Descubre lo básico de la pasta fresca', 'Découvrez les bases des pâtes fraîches', 'Lerne die Grundlagen frischer Pasta kennen', '了解新鲜意面的基础', 'ताज़ा पास्ता की बुनियादी बातें जानें'),
      L('Prepare and work your own dough', 'Prepara e lavora il tuo impasto', 'Prepara y trabaja tu propia masa', 'Préparez et travaillez votre propre pâte', 'Bereite deinen eigenen Teig zu und bearbeite ihn', '准备并揉制你自己的面团', 'अपना आटा तैयार करें और गूँधें'),
      L('Learn traditional rolling and shaping techniques', 'Impara le tecniche tradizionali per tirare e modellare la sfoglia', 'Aprende las técnicas tradicionales de estirado y formado', 'Apprenez les techniques traditionnelles pour abaisser et façonner', 'Lerne traditionelle Techniken zum Ausrollen und Formen', '学习传统的擀面和塑形技法', 'बेलने और आकार देने की पारंपरिक तकनीकें सीखें'),
      L('Create your own handmade pasta', 'Crea la tua pasta fatta a mano', 'Crea tu propia pasta hecha a mano', 'Créez vos propres pâtes faites main', 'Stelle deine eigene handgemachte Pasta her', '做出属于你的手工意面', 'अपना खुद का हाथ से बना पास्ता तैयार करें'),
    ],
  },
  {
    id: 'pasta-atelier',
    shapes: L('Classic folds and ridges, then a shape of your own', 'Pieghe e rigature classiche, poi una forma tutta tua', 'Pliegues y estrías clásicos, y luego una forma propia', 'Plis et stries classiques, puis une forme à vous', 'Klassische Falten und Rillen, dann eine eigene Form', '经典的褶皱与纹路，再做出你自己的形状', 'क्लासिक मोड़ और धारियाँ, फिर आपका अपना आकार'),
    number: '02',
    type: 'shapelab',
    formats: ['design-led', 'hands-on'],
    country: 'uk',
    city: L('London', 'Londra', 'Londres', 'Londres', 'London', '伦敦', 'लंदन'),
    venue: 'The Fold Studio',
    start: '2026-11-28T14:00',
    minutes: 180,
    price: 28,
    places: 16,
    level: 'aldente',
    visual: { shape: 'sculpture', color: '#e1201b', finish: 'aldente', bg: '#ffb548', ink: '#1d1d1b', img: sculptureImg },
    title: N('Pasta Atelier'),
    subtitle: L('Pasta Design Workshop', 'Workshop di design della pasta', 'Taller de diseño de pasta', 'Atelier de design des pâtes', 'Pasta-Design-Workshop', '意面设计工作坊', 'पास्ता डिज़ाइन वर्कशॉप'),
    short: L(
      'A creative workshop where pasta becomes a material for experimentation, exploring shapes, folds, textures and unexpected forms.',
      'Un workshop creativo in cui la pasta diventa materia di sperimentazione, tra forme, pieghe, texture e forme inaspettate.',
      'Un taller creativo en el que la pasta se convierte en material de experimentación, explorando formas, pliegues, texturas y formas inesperadas.',
      'Un atelier créatif où les pâtes deviennent une matière d’expérimentation, entre formes, plis, textures et formes inattendues.',
      'Ein kreativer Workshop, in dem Pasta zum Material für Experimente wird: Formen, Falten, Texturen und unerwartete Gestalten.',
      '一场创意工作坊，意面成为实验的材料，探索形状、褶皱、纹理和意想不到的造型。',
      'एक रचनात्मक वर्कशॉप जहाँ पास्ता प्रयोग की सामग्री बन जाता है: आकार, मोड़, बनावट और अनोखे रूप।',
    ),
    description: L(
      'The Pasta Atelier is a space for pasta experimentation and creative exploration. Beyond traditional recipes, participants work with coloured doughs, tools and different techniques to develop original pasta shapes. Through folds, grooves, textures and hands-on experimentation, each participant creates a unique pasta form.',
      'Il Pasta Atelier è uno spazio di sperimentazione e di esplorazione creativa della pasta. Oltre le ricette tradizionali, i partecipanti lavorano con impasti colorati, attrezzi e tecniche diverse per sviluppare forme di pasta originali. Tra pieghe, scanalature, texture e sperimentazione pratica, ogni partecipante crea una forma di pasta unica.',
      'El Pasta Atelier es un espacio de experimentación y exploración creativa con la pasta. Más allá de las recetas tradicionales, los participantes trabajan con masas de colores, herramientas y distintas técnicas para desarrollar formas de pasta originales. A través de pliegues, estrías, texturas y experimentación práctica, cada participante crea una forma de pasta única.',
      'Le Pasta Atelier est un espace d’expérimentation et d’exploration créative autour des pâtes. Au-delà des recettes traditionnelles, les participants travaillent avec des pâtes colorées, des outils et différentes techniques pour créer des formes de pâtes originales. À travers plis, rainures, textures et expérimentation pratique, chaque participant crée une forme de pâte unique.',
      'Das Pasta Atelier ist ein Raum für Experimente und kreative Entdeckungen mit Pasta. Über traditionelle Rezepte hinaus arbeiten die Teilnehmenden mit farbigen Teigen, Werkzeugen und verschiedenen Techniken, um eigene Pastaformen zu entwickeln. Mit Falten, Rillen, Texturen und praktischem Ausprobieren gestaltet jede und jeder eine einzigartige Pastaform.',
      'Pasta Atelier 是一个进行意面实验和创意探索的空间。在传统食谱之外，参与者使用彩色面团、工具和不同技法，开发原创的意面形状。 通过褶皱、凹槽、纹理和动手实验，每位参与者都会创造出独一无二的意面造型。',
      'Pasta Atelier पास्ता के साथ प्रयोग और रचनात्मक खोज की जगह है। पारंपरिक रेसिपी से आगे, प्रतिभागी रंगीन आटे, औज़ारों और अलग-अलग तकनीकों से मौलिक पास्ता आकार बनाते हैं। मोड़, खाँचे, बनावट और हाथों से प्रयोग के ज़रिए हर प्रतिभागी एक अनोखा पास्ता रूप बनाता है।',
    ),
    included: [
      L('Coloured pasta doughs', 'Impasti colorati per la pasta', 'Masas de pasta de colores', 'Pâtes colorées', 'Farbige Pastateige', '彩色意面面团', 'रंगीन पास्ता आटा'),
      L('Pasta-making tools', 'Attrezzi per la pasta', 'Herramientas para hacer pasta', 'Outils pour façonner les pâtes', 'Pasta-Werkzeuge', '制面工具', 'पास्ता बनाने के औज़ार'),
      L('Sketchbook', 'Quaderno per gli schizzi', 'Cuaderno de bocetos', 'Carnet de croquis', 'Skizzenbuch', '速写本', 'स्केचबुक'),
      L('Reference sheets', 'Schede di riferimento', 'Fichas de referencia', 'Fiches de référence', 'Referenzblätter', '参考资料', 'संदर्भ शीट'),
      L('Refreshments', 'Rinfresco', 'Refrigerios', 'Rafraîchissements', 'Erfrischungen', '茶点', 'जलपान'),
    ],
    make: [
      L('Explore different pasta shapes and textures', 'Esplora diverse forme e texture di pasta', 'Explora distintas formas y texturas de pasta', 'Explorez différentes formes et textures de pâtes', 'Entdecke verschiedene Pastaformen und Texturen', '探索不同的意面形状和纹理', 'अलग-अलग पास्ता आकार और बनावट जानें'),
      L('Experiment with coloured doughs', 'Sperimenta con gli impasti colorati', 'Experimenta con masas de colores', 'Expérimentez avec des pâtes colorées', 'Experimentiere mit farbigen Teigen', '尝试彩色面团', 'रंगीन आटे के साथ प्रयोग करें'),
      L('Play with folds, grooves and sculptural techniques', 'Gioca con pieghe, scanalature e tecniche scultoree', 'Juega con pliegues, estrías y técnicas escultóricas', 'Jouez avec les plis, les rainures et des techniques sculpturales', 'Spiele mit Falten, Rillen und skulpturalen Techniken', '玩转褶皱、凹槽和雕塑技法', 'मोड़, खाँचों और मूर्तिकला जैसी तकनीकों से खेलें'),
      L('Sketch and develop original ideas', 'Disegna e sviluppa idee originali', 'Dibuja y desarrolla ideas originales', 'Dessinez et développez des idées originales', 'Skizziere und entwickle eigene Ideen', '画草图并发展原创想法', 'मौलिक विचार स्केच करें और विकसित करें'),
      L('Create your own experimental pasta shape', 'Crea la tua forma di pasta sperimentale', 'Crea tu propia forma de pasta experimental', 'Créez votre propre forme de pâte expérimentale', 'Gestalte deine eigene experimentelle Pastaform', '创造你自己的实验性意面形状', 'अपना खुद का प्रयोगात्मक पास्ता आकार बनाएँ'),
    ],
  },
  {
    id: 'make-shoot-share',
    shapes: L('Fresh fusilli', 'Fusilli freschi', 'Fusilli frescos', 'Fusilli frais', 'Frische Fusilli', '新鲜螺旋面', 'ताज़ा फ़्यूज़िली'),
    number: '03',
    type: 'collab',
    formats: ['design-led', 'social'],
    country: 'uk',
    city: L('Liverpool', 'Liverpool', 'Liverpool', 'Liverpool', 'Liverpool', '利物浦', 'लिवरपूल'),
    venue: 'Frame Kitchen',
    start: '2027-01-17T13:00',
    minutes: 150,
    price: 20,
    places: 14,
    level: 'aldente',
    visual: { shape: 'fusilli', color: '#ffb548', finish: 'aldente', bg: '#1a5632', ink: '#ffffff', img: fusilliImg },
    title: N('Pasta Shoot'),
    subtitle: L('Pasta Styling & Photography', 'Styling e fotografia della pasta', 'Estilismo y fotografía de pasta', 'Stylisme et photographie des pâtes', 'Pasta-Styling & Fotografie', '意面造型与摄影', 'पास्ता स्टाइलिंग और फ़ोटोग्राफ़ी'),
    short: L(
      'A creative session exploring the visual side of pasta through food styling, composition and photography.',
      'Una sessione creativa che esplora il lato visivo della pasta attraverso il food styling, la composizione e la fotografia.',
      'Una sesión creativa que explora el lado visual de la pasta a través del estilismo gastronómico, la composición y la fotografía.',
      'Une séance créative qui explore le côté visuel des pâtes à travers le stylisme culinaire, la composition et la photographie.',
      'Eine kreative Session über die visuelle Seite der Pasta: Foodstyling, Bildkomposition und Fotografie.',
      '一场创意课程，通过美食造型、构图和摄影探索意面的视觉之美。',
      'फ़ूड स्टाइलिंग, कंपोज़िशन और फ़ोटोग्राफ़ी के ज़रिए पास्ता के दृश्य पक्ष को खोजने वाला एक रचनात्मक सेशन।',
    ),
    description: L(
      'Explore pasta as a visual subject. Pasta Shoot brings together food, styling and photography in a hands-on creative session. Discover how shapes, colours, textures and composition can transform a simple pasta dish into an image worth sharing.',
      'Esplora la pasta come soggetto visivo. Pasta Shoot unisce cibo, styling e fotografia in una sessione creativa e pratica. Scopri come forme, colori, texture e composizione possono trasformare un semplice piatto di pasta in un’immagine da condividere.',
      'Explora la pasta como tema visual. Pasta Shoot reúne comida, estilismo y fotografía en una sesión creativa y práctica. Descubre cómo las formas, los colores, las texturas y la composición pueden convertir un sencillo plato de pasta en una imagen que merece la pena compartir.',
      'Explorez les pâtes comme sujet visuel. Pasta Shoot réunit cuisine, stylisme et photographie dans une séance créative et pratique. Découvrez comment les formes, les couleurs, les textures et la composition peuvent transformer un simple plat de pâtes en une image à partager.',
      'Entdecke Pasta als Bildmotiv. Pasta Shoot verbindet Essen, Styling und Fotografie in einer praktischen, kreativen Session. Erfahre, wie Formen, Farben, Texturen und Komposition aus einem einfachen Pastagericht ein Bild machen, das man gern teilt.',
      '把意面当作视觉主题来探索。Pasta Shoot 在一场动手的创意课程中融合了美食、造型和摄影。了解形状、色彩、纹理和构图如何把一盘简单的意面变成值得分享的照片。',
      'पास्ता को एक दृश्य विषय के रूप में खोजें। Pasta Shoot एक हैंड्स-ऑन रचनात्मक सेशन में खाना, स्टाइलिंग और फ़ोटोग्राफ़ी को साथ लाता है। जानें कि आकार, रंग, बनावट और कंपोज़िशन एक साधारण पास्ता डिश को शेयर करने लायक तस्वीर में कैसे बदल सकते हैं।',
    ),
    included: [
      L('Pasta styling materials', 'Materiali per lo styling della pasta', 'Materiales de estilismo para la pasta', 'Matériel de stylisme pour les pâtes', 'Materialien für das Pasta-Styling', '意面造型材料', 'पास्ता स्टाइलिंग की सामग्री'),
      L('Visual references and creative inspiration', 'Riferimenti visivi e ispirazione creativa', 'Referencias visuales e inspiración creativa', 'Références visuelles et inspiration créative', 'Visuelle Referenzen und kreative Inspiration', '视觉参考与创意灵感', 'दृश्य संदर्भ और रचनात्मक प्रेरणा'),
      L('Photography equipment and setup: lighting kit and phone rigs', 'Attrezzatura e set fotografico: luci e supporti per il telefono', 'Equipo y set de fotografía: iluminación y soportes para el móvil', 'Matériel et installation photo : éclairage et supports pour téléphone', 'Fotoausrüstung und Set: Licht und Handyhalterungen', '摄影器材与布景：灯光设备和手机支架', 'फ़ोटोग्राफ़ी उपकरण और सेटअप: लाइटिंग किट और फ़ोन स्टैंड'),
    ],
    make: [
      L('Explore pasta shapes, colours and textures', 'Esplora forme, colori e texture della pasta', 'Explora formas, colores y texturas de la pasta', 'Explorez les formes, les couleurs et les textures des pâtes', 'Entdecke Pastaformen, Farben und Texturen', '探索意面的形状、色彩和纹理', 'पास्ता के आकार, रंग और बनावट जानें'),
      L('Experiment with food styling and composition', 'Sperimenta con il food styling e la composizione', 'Experimenta con el estilismo gastronómico y la composición', 'Expérimentez le stylisme culinaire et la composition', 'Experimentiere mit Foodstyling und Komposition', '尝试美食造型与构图', 'फ़ूड स्टाइलिंग और कंपोज़िशन के साथ प्रयोग करें'),
      L('Arrange and style your own pasta scene', 'Allestisci e cura la tua scena di pasta', 'Monta y estiliza tu propia escena de pasta', 'Composez et stylisez votre propre scène de pâtes', 'Arrangiere und style deine eigene Pasta-Szene', '布置并设计你自己的意面场景', 'अपना खुद का पास्ता दृश्य सजाएँ और स्टाइल करें'),
      L('Photograph your creations', 'Fotografa le tue creazioni', 'Fotografía tus creaciones', 'Photographiez vos créations', 'Fotografiere deine Kreationen', '拍摄你的作品', 'अपनी रचनाओं की फ़ोटो लें'),
      L('Develop images ready to share', 'Realizza immagini pronte da condividere', 'Crea imágenes listas para compartir', 'Réalisez des images prêtes à partager', 'Erstelle Bilder, die bereit zum Teilen sind', '制作可随时分享的照片', 'शेयर करने के लिए तैयार तस्वीरें बनाएँ'),
    ],
  },
  {
    id: 'aperitivo',
    shapes: L('Ridged gnocchi and filled pasta', 'Gnocchi rigati e pasta ripiena', 'Ñoquis con estrías y pasta rellena', 'Gnocchis striés et pâtes farcies', 'Gerillte Gnocchi und gefüllte Pasta', '带纹路的团子和带馅意面', 'धारीदार न्योकी और भरवाँ पास्ता'),
    number: '04',
    type: 'supper',
    kindKey: 'aperitivo',
    formats: ['social'],
    country: 'it',
    city: L('Bologna', 'Bologna', 'Bolonia', 'Bologne', 'Bologna', '博洛尼亚', 'बोलोन्या'),
    venue: 'Bancone 42',
    start: '2026-12-11T18:30',
    minutes: 120,
    price: 25,
    places: 30,
    level: 'raw',
    visual: { shape: 'gnocchi', color: '#ffb548', finish: 'raw', bg: '#f8eabe', ink: '#1d1d1b', img: gnocchiImg },
    title: N('Imperia Aperitivo'),
    subtitle: L('Social Experience', 'Esperienza conviviale', 'Experiencia social', 'Expérience conviviale', 'Geselliges Erlebnis', '社交体验', 'सामाजिक अनुभव'),
    short: L(
      'A relaxed Italian-inspired gathering where pasta, drinks and good company come together.',
      'Un incontro rilassato di ispirazione italiana, dove pasta, drink e buona compagnia si ritrovano insieme.',
      'Un encuentro relajado de inspiración italiana donde se unen la pasta, las bebidas y la buena compañía.',
      'Une rencontre détendue d’inspiration italienne où se retrouvent pâtes, boissons et bonne compagnie.',
      'Ein entspanntes Treffen nach italienischem Vorbild, bei dem Pasta, Drinks und gute Gesellschaft zusammenkommen.',
      '一场轻松的意式聚会，意面、饮品和好友欢聚一堂。',
      'इतालवी अंदाज़ की एक सुकून भरी मुलाक़ात, जहाँ पास्ता, ड्रिंक्स और अच्छी संगत साथ आते हैं।',
    ),
    description: L(
      'More than an aperitivo, this is an opportunity to connect through food. Imperia Aperitivo brings people together in a relaxed setting inspired by Italian social culture, where sharing, conversation and creativity take centre stage.',
      'Più di un aperitivo, è un’occasione per entrare in contatto attraverso il cibo. Imperia Aperitivo riunisce le persone in un ambiente rilassato, ispirato alla cultura conviviale italiana, dove condivisione, conversazione e creatività sono protagoniste.',
      'Más que un aperitivo, es una oportunidad para conectar a través de la comida. Imperia Aperitivo reúne a las personas en un ambiente relajado inspirado en la cultura social italiana, donde compartir, conversar y crear son los protagonistas.',
      'Plus qu’un apéritif, c’est l’occasion de se rencontrer autour de la cuisine. Imperia Aperitivo réunit les gens dans un cadre détendu inspiré de la convivialité italienne, où le partage, la conversation et la créativité sont à l’honneur.',
      'Mehr als ein Aperitivo: eine Gelegenheit, über das Essen in Kontakt zu kommen. Imperia Aperitivo bringt Menschen in entspannter Atmosphäre zusammen, inspiriert von der italienischen Geselligkeit, bei der Teilen, Gespräche und Kreativität im Mittelpunkt stehen.',
      '这不只是一场开胃酒会，更是一个通过美食相互连接的机会。Imperia Aperitivo 在受意大利社交文化启发的轻松氛围中把人们聚在一起，分享、交流和创意是这里的主角。',
      'यह सिर्फ़ एक अपेरिटिवो नहीं, बल्कि खाने के ज़रिए जुड़ने का मौक़ा है। Imperia Aperitivo इतालवी सामाजिक संस्कृति से प्रेरित एक सुकून भरे माहौल में लोगों को साथ लाता है, जहाँ साझा करना, बातचीत और रचनात्मकता केंद्र में होते हैं।',
    ),
    included: [
      L('The aperitivo experience', 'L’esperienza dell’aperitivo', 'La experiencia del aperitivo', 'L’expérience de l’apéritif', 'Das Aperitivo-Erlebnis', '开胃酒会体验', 'अपेरिटिवो का अनुभव'),
      L('Two drinks (alcohol-free options) and five handmade pasta bites', 'Due drink (anche analcolici) e cinque bocconi di pasta fatta a mano', 'Dos bebidas (también sin alcohol) y cinco bocados de pasta hecha a mano', 'Deux boissons (options sans alcool) et cinq bouchées de pâtes faites main', 'Zwei Drinks (auch alkoholfrei) und fünf handgemachte Pasta-Häppchen', '两杯饮品（可选无酒精）和五款手工意面小食', 'दो ड्रिंक्स (बिना अल्कोहल विकल्प भी) और हाथ से बने पास्ता के पाँच बाइट्स'),
      L('A live gnocchi-rolling demo', 'Una dimostrazione dal vivo di gnocchi rigati', 'Una demostración en directo de ñoquis', 'Une démonstration de gnocchis en direct', 'Eine Live-Vorführung zum Gnocchi-Rollen', '现场团子制作演示', 'न्योकी बनाने का लाइव डेमो'),
    ],
    make: [
      L('Meet other pasta enthusiasts', 'Incontra altri appassionati di pasta', 'Conoce a otros apasionados de la pasta', 'Rencontrez d’autres passionnés de pâtes', 'Triff andere Pasta-Fans', '结识其他意面爱好者', 'दूसरे पास्ता प्रेमियों से मिलें'),
      L('Enjoy an Italian-inspired aperitivo', 'Goditi un aperitivo di ispirazione italiana', 'Disfruta de un aperitivo de inspiración italiana', 'Profitez d’un apéritif d’inspiration italienne', 'Genieße einen Aperitivo nach italienischem Vorbild', '享受一场意式风格的开胃酒会', 'इतालवी अंदाज़ के अपेरिटिवो का आनंद लें'),
      L('Share food, ideas and conversations', 'Condividi cibo, idee e conversazioni', 'Comparte comida, ideas y conversaciones', 'Partagez cuisine, idées et conversations', 'Teile Essen, Ideen und Gespräche', '分享美食、想法和交谈', 'खाना, विचार और बातचीत साझा करें'),
      L('Discover Imperia through a relaxed social experience', 'Scopri Imperia in un’esperienza conviviale e rilassata', 'Descubre Imperia en una experiencia social relajada', 'Découvrez Imperia lors d’une expérience conviviale et détendue', 'Entdecke Imperia bei einem entspannten geselligen Erlebnis', '在轻松的社交体验中认识 Imperia', 'एक सुकून भरे सामाजिक अनुभव में Imperia को जानें'),
    ],
  },
  {
    id: 'pasta-after-hours',
    shapes: L('Fresh pasta shaped by hand at the table', 'Pasta fresca fatta a mano al tavolo', 'Pasta fresca hecha a mano en la mesa', 'Pâtes fraîches façonnées à la main à table', 'Frische, am Tisch von Hand geformte Pasta', '在餐桌上手工制作的新鲜意面', 'टेबल पर हाथ से बना ताज़ा पास्ता'),
    number: '05',
    type: 'supper',
    formats: ['social'],
    country: 'uk',
    city: L('Manchester', 'Manchester', 'Mánchester', 'Manchester', 'Manchester', '曼彻斯特', 'मैनचेस्टर'),
    venue: 'Long Table Room',
    start: '2026-12-04T19:30',
    minutes: 180,
    price: 32,
    places: 24,
    level: 'raw',
    visual: { shape: 'spaghetti', color: '#ffb548', finish: 'aldente', bg: '#e1201b', ink: '#ffffff', img: spaghettiImg },
    title: N('Pasta After Hours'),
    subtitle: L('Pasta Supper Club', 'Supper club della pasta', 'Supper club de pasta', 'Supper club des pâtes', 'Pasta-Supper-Club', '意面晚餐俱乐部', 'पास्ता सपर क्लब'),
    short: L(
      'An evening of handmade pasta, a three-course dinner, drinks and music, bringing Italian food culture to the table.',
      'Una serata di pasta fatta a mano, una cena di tre portate, drink e musica, che porta in tavola la cultura gastronomica italiana.',
      'Una velada de pasta hecha a mano, una cena de tres platos, bebidas y música que lleva a la mesa la cultura gastronómica italiana.',
      'Une soirée de pâtes faites main, un dîner en trois plats, des boissons et de la musique, pour mettre la culture culinaire italienne à table.',
      'Ein Abend mit handgemachter Pasta, einem Drei-Gänge-Menü, Drinks und Musik, der die italienische Esskultur auf den Tisch bringt.',
      '一个手工意面、三道菜晚餐、饮品与音乐的夜晚，把意大利饮食文化带上餐桌。',
      'हाथ से बने पास्ता, तीन कोर्स के डिनर, ड्रिंक्स और संगीत की एक शाम, जो इतालवी खान-पान संस्कृति को मेज़ तक लाती है।',
    ),
    description: L(
      'Pasta After Hours combines the pleasure of making pasta with the atmosphere of an Italian supper club. Prepare handmade pasta, sit down for a three-course dinner and enjoy a drink and a DJ set. An evening where food, music and people come together.',
      'Pasta After Hours unisce il piacere di fare la pasta all’atmosfera di un supper club italiano. Prepara la pasta a mano, siediti per una cena di tre portate e goditi un drink e un DJ set. Una serata in cui cibo, musica e persone si incontrano.',
      'Pasta After Hours une el placer de hacer pasta con el ambiente de un supper club italiano. Prepara pasta a mano, siéntate a una cena de tres platos y disfruta de una bebida y una sesión de DJ. Una velada en la que se encuentran la comida, la música y las personas.',
      'Pasta After Hours associe le plaisir de faire des pâtes à l’ambiance d’un supper club italien. Préparez des pâtes à la main, installez-vous pour un dîner en trois plats et profitez d’une boisson et d’un DJ set. Une soirée où se rencontrent cuisine, musique et convives.',
      'Pasta After Hours verbindet die Freude am Pastamachen mit der Atmosphäre eines italienischen Supper Clubs. Bereite handgemachte Pasta zu, setz dich zu einem Drei-Gänge-Menü und genieße einen Drink und ein DJ-Set. Ein Abend, an dem Essen, Musik und Menschen zusammenkommen.',
      'Pasta After Hours 把做意面的乐趣与意式晚餐俱乐部的氛围结合在一起。亲手制作意面，坐下享用三道菜晚餐，再来一杯饮品和一场 DJ 演出。一个美食、音乐和人们相聚的夜晚。',
      'Pasta After Hours पास्ता बनाने के आनंद को एक इतालवी सपर क्लब के माहौल से जोड़ता है। हाथ से पास्ता बनाएँ, तीन कोर्स के डिनर के लिए बैठें और एक ड्रिंक व डीजे सेट का आनंद लें। एक शाम जहाँ खाना, संगीत और लोग साथ आते हैं।',
    ),
    included: [
      L('Handmade pasta preparation', 'Preparazione della pasta fatta a mano', 'Preparación de pasta hecha a mano', 'Préparation de pâtes faites main', 'Zubereitung handgemachter Pasta', '手工意面制作', 'हाथ से पास्ता बनाना'),
      L('Three-course dinner', 'Cena di tre portate', 'Cena de tres platos', 'Dîner en trois plats', 'Drei-Gänge-Menü', '三道菜晚餐', 'तीन कोर्स का डिनर'),
      L('One drink', 'Un drink', 'Una bebida', 'Une boisson', 'Ein Drink', '一杯饮品', 'एक ड्रिंक'),
      L('DJ set', 'DJ set', 'Sesión de DJ', 'DJ set', 'DJ-Set', 'DJ 演出', 'डीजे सेट'),
    ],
    make: [
      L('Take part in preparing fresh handmade pasta', 'Partecipa alla preparazione della pasta fresca fatta a mano', 'Participa en la preparación de pasta fresca hecha a mano', 'Participez à la préparation de pâtes fraîches faites main', 'Mach mit bei der Zubereitung frischer, handgemachter Pasta', '参与制作新鲜手工意面', 'ताज़ा हाथ से बने पास्ता की तैयारी में हिस्सा लें'),
      L('Discover the pleasure of making food together', 'Scopri il piacere di cucinare insieme', 'Descubre el placer de cocinar juntos', 'Découvrez le plaisir de cuisiner ensemble', 'Entdecke die Freude am gemeinsamen Kochen', '体验一起做饭的乐趣', 'साथ मिलकर खाना बनाने का आनंद जानें'),
      L('Enjoy a three-course dinner', 'Goditi una cena di tre portate', 'Disfruta de una cena de tres platos', 'Savourez un dîner en trois plats', 'Genieße ein Drei-Gänge-Menü', '享用三道菜晚餐', 'तीन कोर्स के डिनर का आनंद लें'),
      L('Share the evening with music and good company', 'Condividi la serata con musica e buona compagnia', 'Comparte la velada con música y buena compañía', 'Partagez la soirée en musique et en bonne compagnie', 'Teile den Abend mit Musik und guter Gesellschaft', '在音乐和好友的陪伴中共度夜晚', 'संगीत और अच्छी संगत के साथ शाम बिताएँ'),
    ],
  },
  {
    id: 'shape-of-pasta',
    shapes: L('Tagliatelle, pappardelle and reginette', 'Tagliatelle, pappardelle e reginette', 'Tagliatelle, pappardelle y reginette', 'Tagliatelles, pappardelles et reginette', 'Tagliatelle, Pappardelle und Reginette', '宽面、阔面和花边面', 'टैग्लियाटेले, पापार्देले और रेजिनेट'),
    number: '06',
    type: 'workshop',
    formats: ['hands-on'],
    country: 'it',
    city: L('Milan', 'Milano', 'Milán', 'Milan', 'Mailand', '米兰', 'मिलान'),
    venue: 'Laboratorio Forma',
    start: '2026-11-21T11:00',
    minutes: 150,
    price: 35,
    places: 12,
    level: 'raw',
    visual: { shape: 'reginette', color: '#e1201b', finish: 'raw', bg: '#ffb548', ink: '#1d1d1b', img: reginetteImg },
    title: N('Shape of Pasta'),
    subtitle: L('Traditional Pasta-Making Workshop', 'Workshop di pasta tradizionale', 'Taller de pasta tradicional', 'Atelier de pâtes traditionnelles', 'Workshop für traditionelle Pasta', '传统意面制作工作坊', 'पारंपरिक पास्ता बनाने की वर्कशॉप'),
    short: L(
      'A hands-on introduction to traditional Italian pasta-making, from preparing fresh dough to creating familiar pasta shapes.',
      'Un’introduzione pratica alla pasta tradizionale italiana, dalla preparazione dell’impasto fresco alla creazione delle forme di pasta più conosciute.',
      'Una introducción práctica a la pasta tradicional italiana, desde preparar la masa fresca hasta crear las formas de pasta más conocidas.',
      'Une initiation pratique aux pâtes italiennes traditionnelles, de la préparation de la pâte fraîche à la création des formes de pâtes les plus connues.',
      'Eine praktische Einführung in die traditionelle italienische Pasta, vom frischen Teig bis zu den bekannten Pastaformen.',
      '传统意大利手工意面的入门实践课，从准备新鲜面团到做出常见的意面形状。',
      'पारंपरिक इतालवी पास्ता बनाने का हैंड्स-ऑन परिचय, ताज़ा आटा तैयार करने से लेकर जाने-पहचाने पास्ता आकार बनाने तक।',
    ),
    description: L(
      'Discover the fundamentals of traditional pasta-making. Shape of Pasta is designed for beginners who want to learn how fresh pasta is made, understand the role of dough and explore traditional shaping techniques. No previous experience is needed. Just curiosity and a willingness to get your hands involved.',
      'Scopri le basi della pasta tradizionale. Shape of Pasta è pensato per i principianti che vogliono imparare come si fa la pasta fresca, capire il ruolo dell’impasto ed esplorare le tecniche tradizionali per darle forma. Non serve alcuna esperienza. Bastano curiosità e voglia di mettere le mani in pasta.',
      'Descubre los fundamentos de la pasta tradicional. Shape of Pasta está pensado para principiantes que quieren aprender cómo se hace la pasta fresca, entender el papel de la masa y explorar las técnicas tradicionales de formado. No hace falta experiencia previa. Solo curiosidad y ganas de meter las manos en la masa.',
      'Découvrez les bases des pâtes traditionnelles. Shape of Pasta s’adresse aux débutants qui veulent apprendre comment se font les pâtes fraîches, comprendre le rôle de la pâte et explorer les techniques de façonnage traditionnelles. Aucune expérience n’est nécessaire. Juste de la curiosité et l’envie de mettre la main à la pâte.',
      'Entdecke die Grundlagen der traditionellen Pasta. Shape of Pasta richtet sich an Einsteiger, die lernen möchten, wie frische Pasta entsteht, welche Rolle der Teig spielt und wie man ihn traditionell formt. Vorkenntnisse sind nicht nötig. Nur Neugier und Lust, selbst Hand anzulegen.',
      '了解传统意面制作的基础。Shape of Pasta 专为初学者设计，帮助你了解新鲜意面是怎样做成的、面团起什么作用，并探索传统的塑形技法。 无需任何经验，只需要好奇心和动手的意愿。',
      'पारंपरिक पास्ता बनाने की बुनियादी बातें जानें। Shape of Pasta उन शुरुआती लोगों के लिए है जो सीखना चाहते हैं कि ताज़ा पास्ता कैसे बनता है, आटे की क्या भूमिका है और पारंपरिक तरीक़े से आकार कैसे दिए जाते हैं। पहले के किसी अनुभव की ज़रूरत नहीं। बस जिज्ञासा और हाथ लगाने की इच्छा चाहिए।',
    ),
    included: [
      L('Pasta ingredients', 'Ingredienti per la pasta', 'Ingredientes para la pasta', 'Ingrédients pour les pâtes', 'Zutaten für die Pasta', '意面食材', 'पास्ता की सामग्री'),
      L('Pasta-making equipment', 'Attrezzatura per la pasta', 'Utensilios para hacer pasta', 'Matériel pour faire les pâtes', 'Pasta-Ausrüstung', '制面工具', 'पास्ता बनाने का सामान'),
      L('Guided instruction', 'Istruzioni guidate', 'Instrucción guiada', 'Accompagnement guidé', 'Angeleitete Schritte', '全程指导', 'मार्गदर्शन के साथ सिखाना'),
      L('Practical pasta-making session', 'Sessione pratica di pasta', 'Sesión práctica de pasta', 'Séance pratique de fabrication de pâtes', 'Praktische Pasta-Session', '意面制作实践课', 'पास्ता बनाने का प्रैक्टिकल सेशन'),
    ],
    make: [
      L('Learn how to prepare fresh pasta dough', 'Impara a preparare l’impasto della pasta fresca', 'Aprende a preparar la masa de pasta fresca', 'Apprenez à préparer la pâte des pâtes fraîches', 'Lerne, frischen Pastateig zuzubereiten', '学习制作新鲜意面面团', 'ताज़ा पास्ता का आटा तैयार करना सीखें'),
      L('Understand the basic techniques of kneading and rolling', 'Comprendi le tecniche di base per impastare e tirare la sfoglia', 'Entiende las técnicas básicas de amasado y estirado', 'Comprenez les techniques de base du pétrissage et de l’abaisse', 'Verstehe die Grundtechniken des Knetens und Ausrollens', '掌握揉面和擀面的基本技法', 'गूँधने और बेलने की बुनियादी तकनीकें समझें'),
      L('Discover traditional pasta shapes', 'Scopri le forme di pasta tradizionali', 'Descubre las formas de pasta tradicionales', 'Découvrez les formes de pâtes traditionnelles', 'Entdecke traditionelle Pastaformen', '认识传统的意面形状', 'पारंपरिक पास्ता आकार जानें'),
      L('Practise shaping your own pasta', 'Esercitati a dare forma alla tua pasta', 'Practica dando forma a tu propia pasta', 'Entraînez-vous à façonner vos propres pâtes', 'Übe, deine eigene Pasta zu formen', '练习为你自己的意面塑形', 'अपने पास्ता को आकार देने का अभ्यास करें'),
      L('Take home the skills to continue experimenting', 'Porta a casa le competenze per continuare a sperimentare', 'Llévate a casa lo aprendido para seguir experimentando', 'Repartez avec les savoir-faire pour continuer à expérimenter', 'Nimm das Können mit nach Hause, um weiter zu experimentieren', '把技能带回家，继续尝试', 'प्रयोग जारी रखने के लिए ये कौशल घर ले जाएँ'),
    ],
  },
];

// The Pasta Match: the online recipe club, a digital product of its own and
// not one of the six in-person Experiences. One price for the whole five-week
// access (no subscription, no renewal). No payment is taken in this prototype.
export const PASTA_MATCH = {
  id: 'recipe-club',
  shapes: L('All the shapes in the recipe builder, from spaghetti to tortellini', 'Tutte le forme del compositore di ricette, dagli spaghetti ai tortellini', 'Todas las formas del creador de recetas, de los espaguetis a los tortellini', 'Toutes les formes du créateur de recettes, des spaghetti aux tortellini', 'Alle Formen im Rezeptbaukasten, von Spaghetti bis Tortellini', '食谱搭配器中的所有形状，从意大利面到意式小馄饨', 'रेसिपी बिल्डर के सभी आकार, स्पेगेटी से टॉर्टेलिनी तक'),
  number: '',
  type: 'workshop',
  kindKey: 'recipeclub',
  formats: ['hands-on', 'social'],
  // online and self-paced: no date, no fixed length, no limit on places
  country: 'online',
  online: true,
  city: L('Online', 'Online', 'Online', 'En ligne', 'Online', '线上', 'ऑनलाइन'),
  venue: null,
  start: null,
  minutes: null,
  accessWeeks: 5,
  price: 5,
  places: null,
  level: 'raw',
  recipes: true,
  visual: { shape: 'ravioli', color: '#ffb548', finish: 'raw', bg: '#1a5632', ink: '#ffffff', img: ravioliImg },
  title: N('The Pasta Match'),
  short: L(
    'An online recipe club for five weeks, at your own pace: pair pasta shapes with the sauces they were made for.',
    'Un club di ricette online per cinque settimane, al tuo ritmo: abbina le forme di pasta ai condimenti per cui sono nate.',
    'Un club de recetas online durante cinco semanas, a tu ritmo: combina formas de pasta con las salsas para las que nacieron.',
    'Un club de recettes en ligne pendant cinq semaines, à votre rythme : associez les formes de pâtes aux sauces pour lesquelles elles sont nées.',
    'Ein Online-Rezeptclub für fünf Wochen in deinem Tempo: kombiniere Pastaformen mit den Saucen, für die sie gemacht sind.',
    '为期五周的线上食谱俱乐部，按你的节奏：为每种意面形状配上它天生搭配的酱汁。',
    'पाँच हफ़्ते का ऑनलाइन रेसिपी क्लब, अपनी गति से: पास्ता आकारों को उन सॉस से जोड़ें जिनके लिए वे बने हैं।',
  ),
  description: L(
    'Why does each pasta shape have its sauce? Pick a pasta and a couple of ingredients below and the club shows you the traditional Italian dish they lead to, with its ingredients, method and a little of its history. Cook it at home, then share a photo of your plate if you like.',
    'Perché ogni forma di pasta ha il suo condimento? Scegli qui sotto una pasta e un paio di ingredienti: il club ti mostra il piatto tradizionale italiano a cui portano, con ingredienti, preparazione e un po’ della sua storia. Cucinalo a casa e, se vuoi, condividi la foto del tuo piatto.',
    '¿Por qué cada forma de pasta tiene su salsa? Elige abajo una pasta y un par de ingredientes y el club te muestra el plato tradicional italiano al que llevan, con ingredientes, preparación y algo de su historia. Cocínalo en casa y, si quieres, comparte la foto de tu plato.',
    'Pourquoi chaque forme de pâtes a-t-elle sa sauce ? Choisissez ci-dessous des pâtes et quelques ingrédients : le club vous montre le plat traditionnel italien auquel ils mènent, avec ingrédients, préparation et un peu de son histoire. Cuisinez-le chez vous et, si vous le souhaitez, partagez la photo de votre assiette.',
    'Warum hat jede Pastaform ihre Sauce? Wähle unten eine Pasta und ein paar Zutaten, und der Club zeigt dir das traditionelle italienische Gericht dazu, mit Zutaten, Zubereitung und ein wenig Geschichte. Koche es zu Hause und teile, wenn du magst, ein Foto deines Tellers.',
    '为什么每种意面形状都有它的酱汁？在下面选择一种意面和几种配料，俱乐部会告诉你它们对应的意大利传统菜，以及配料、做法和一点历史。在家做好后，如果愿意，可以分享你的成品照片。',
    'हर पास्ता आकार की अपनी सॉस क्यों होती है? नीचे एक पास्ता और कुछ सामग्री चुनें, क्लब आपको वह पारंपरिक इतालवी व्यंजन दिखाएगा, उसकी सामग्री, विधि और थोड़ा इतिहास भी। इसे घर पर बनाएँ और चाहें तो अपनी प्लेट की फ़ोटो शेयर करें।',
  ),
  included: [
    L('Traditional regional recipes, step by step', 'Ricette tradizionali regionali, passo dopo passo', 'Recetas tradicionales regionales, paso a paso', 'Des recettes régionales traditionnelles, pas à pas', 'Traditionelle regionale Rezepte, Schritt für Schritt', '传统地方食谱，一步一步教你', 'पारंपरिक क्षेत्रीय रेसिपी, कदम-दर-कदम'),
    L('The story behind each dish', 'La storia di ogni piatto', 'La historia de cada plato', 'L’histoire de chaque plat', 'Die Geschichte hinter jedem Gericht', '每道菜背后的故事', 'हर व्यंजन के पीछे की कहानी'),
    L('Ingredients explained', 'Gli ingredienti spiegati', 'Los ingredientes explicados', 'Les ingrédients expliqués', 'Zutaten erklärt', '配料说明', 'सामग्री की जानकारी'),
  ],
  make: [
    L('Your own shape-and-sauce pairing', 'Il tuo abbinamento di forma e condimento', 'Tu propia combinación de forma y salsa', 'Votre propre accord forme et sauce', 'Deine eigene Kombination aus Form und Sauce', '你自己的形状与酱汁搭配', 'आकार और सॉस की आपकी अपनी जोड़ी'),
    L('A traditional Italian dish at home', 'Un piatto tradizionale italiano a casa', 'Un plato tradicional italiano en casa', 'Un plat traditionnel italien chez vous', 'Ein traditionelles italienisches Gericht zu Hause', '在家做一道意大利传统菜', 'घर पर एक पारंपरिक इतालवी व्यंजन'),
    L('A photo of your plate to share', 'Una foto del tuo piatto da condividere', 'Una foto de tu plato para compartir', 'Une photo de votre assiette à partager', 'Ein Foto deines Tellers zum Teilen', '一张可分享的成品照片', 'शेयर करने के लिए अपनी प्लेट की फ़ोटो'),
  ],
};

export const eventById = (id) => (id === PASTA_MATCH.id ? PASTA_MATCH : EVENTS.find((e) => e.id === id));
