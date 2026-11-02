// Imperia® Events — concept programme.
// Everything here is ILLUSTRATIVE: events, venues, dates and places are
// fictional sample listings for a brand-extension prototype. Nothing is on
// sale and no booking is ever sent anywhere.
//
// Every text is given in the seven languages of the app (L(en, it, es, fr, de, zh, hi)).
// Prices are in the currency of the event's country (no conversion); 0 = free.
import reginetteImg from '../assets/events/reginette.webp';
import sculptureImg from '../assets/events/sculpture.webp';
import spaghettiImg from '../assets/events/spaghetti.webp';
import gnocchiImg from '../assets/events/gnocchi.webp';
import fusilliImg from '../assets/events/fusilli.webp';
import ravioliImg from '../assets/events/ravioli.webp';

const L = (en, it, es, fr, de, zh, hi) => ({ en, it, es, fr, de, zh, hi });

export const EVENT_TYPES = ['workshop', 'shapelab', 'supper', 'collab'];
export const EVENT_FORMATS = ['hands-on', 'social', 'design-led'];
export const EVENT_COUNTRIES = ['online', 'it', 'uk'];
// experience levels use the names of the Imperia finishes
export const EVENT_LEVELS = ['raw', 'aldente', 'overcooked'];
export const EVENT_SORTS = ['date', 'priceAsc', 'priceDesc'];
export const CURRENCY_OF = { it: 'EUR', uk: 'GBP', online: 'EUR' };

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

/** Sorted copy: by date (default) or by the numeric price (free = 0). */
export function sortEvents(list, sort = 'date') {
  // online, self-paced experiences (no date) come first
  const byDate = (a, b) => (a.start || '').localeCompare(b.start || '');
  const out = [...list];
  if (sort === 'priceAsc') return out.sort((a, b) => a.price - b.price || byDate(a, b));
  if (sort === 'priceDesc') return out.sort((a, b) => b.price - a.price || byDate(a, b));
  return out.sort(byDate);
}

/** Text of a field in the current language (English fallback). */
export const tx = (field, lang) => (field && typeof field === 'object' && !Array.isArray(field) ? field[lang] ?? field.en : field);

// visual = the pasta object (rendered with the app's 3D studio, see
// scripts/render-events.py) + palette colours for the object and its backdrop
export const EVENTS = [
  {
    id: 'recipe-club',
    number: '01',
    type: 'workshop',
    formats: ['hands-on', 'social'],
    // online and self-paced: no date, no fixed length, no limit on places
    country: 'online',
    online: true,
    city: L('Online', 'Online', 'Online', 'En ligne', 'Online', '线上', 'ऑनलाइन'),
    venue: null,
    start: null,
    minutes: null,
    price: 0,
    places: null,
    level: 'raw',
    recipes: true,
    visual: { shape: 'ravioli', color: '#ffb548', finish: 'raw', bg: '#ffffff', ink: '#1d1d1b', img: ravioliImg },
    title: L('Recipe Club', 'Il club delle ricette', 'El club de las recetas', 'Le club des recettes', 'Der Rezept-Club', '食谱俱乐部', 'रेसिपी क्लब'),
    short: L(
      'A free online club, at your own pace: pair pasta shapes with the sauces they were made for.',
      'Un club online gratuito, al tuo ritmo: abbina le forme di pasta ai condimenti per cui sono nate.',
      'Un club online gratuito, a tu ritmo: combina formas de pasta con las salsas para las que nacieron.',
      'Un club en ligne gratuit, à votre rythme : associez les formes de pâtes aux sauces pour lesquelles elles sont nées.',
      'Ein kostenloser Online-Club in deinem Tempo: kombiniere Pastaformen mit den Saucen, für die sie gemacht sind.',
      '免费线上俱乐部，按你的节奏：为每种意面形状配上它天生搭配的酱汁。',
      'मुफ़्त ऑनलाइन क्लब, अपनी गति से: पास्ता आकारों को उन सॉस से जोड़ें जिनके लिए वे बने हैं।',
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
      L('Nine traditional recipes, step by step', 'Nove ricette tradizionali, passo per passo', 'Nueve recetas tradicionales, paso a paso', 'Neuf recettes traditionnelles, pas à pas', 'Neun traditionelle Rezepte Schritt für Schritt', '九道传统食谱，逐步讲解', 'नौ पारंपरिक रेसिपी, कदम दर कदम'),
      L('The story behind each dish', 'La storia di ogni piatto', 'La historia de cada plato', 'L’histoire de chaque plat', 'Die Geschichte hinter jedem Gericht', '每道菜背后的故事', 'हर व्यंजन के पीछे की कहानी'),
      L('Ingredients explained', 'Gli ingredienti spiegati', 'Los ingredientes explicados', 'Les ingrédients expliqués', 'Zutaten erklärt', '配料说明', 'सामग्री की जानकारी'),
    ],
    make: [
      L('Your own shape-and-sauce pairing', 'Il tuo abbinamento di forma e condimento', 'Tu propia combinación de forma y salsa', 'Votre propre accord forme et sauce', 'Deine eigene Kombination aus Form und Sauce', '你自己的形状与酱汁搭配', 'आकार और सॉस की आपकी अपनी जोड़ी'),
      L('A traditional Italian dish at home', 'Un piatto tradizionale italiano a casa', 'Un plato tradicional italiano en casa', 'Un plat traditionnel italien chez vous', 'Ein traditionelles italienisches Gericht zu Hause', '在家做一道意大利传统菜', 'घर पर एक पारंपरिक इतालवी व्यंजन'),
      L('A photo of your plate to share', 'Una foto del tuo piatto da condividere', 'Una foto de tu plato para compartir', 'Une photo de votre assiette à partager', 'Ein Foto deines Tellers zum Teilen', '一张可分享的成品照片', 'शेयर करने के लिए अपनी प्लेट की फ़ोटो'),
    ],
  },
  {
    id: 'shape-of-pasta',
    number: '02',
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
    visual: { shape: 'reginette', color: '#ffb548', finish: 'raw', bg: '#e1201b', ink: '#ffffff', img: reginetteImg },
    title: L('Shape of Pasta', 'Le forme della pasta', 'Las formas de la pasta', 'Les formes des pâtes', 'Die Formen der Pasta', '意面的形状', 'पास्ता के आकार'),
    short: L(
      'Fresh dough, a few simple tools and the shapes that made Italian pasta famous.',
      'Impasto fresco, pochi strumenti e le forme che hanno reso famosa la pasta italiana.',
      'Masa fresca, pocas herramientas y las formas que hicieron famosa la pasta italiana.',
      'Une pâte fraîche, quelques outils simples et les formes qui ont fait la réputation des pâtes italiennes.',
      'Frischer Teig, ein paar einfache Werkzeuge und die Formen, die italienische Pasta berühmt gemacht haben.',
      '新鲜面团、几件简单工具，以及让意大利面闻名世界的经典形状。',
      'ताज़ा आटा, कुछ आसान औज़ार और वे आकार जिन्होंने इतालवी पास्ता को मशहूर बनाया।',
    ),
    description: L(
      'A hands-on morning on how one sheet of dough becomes dozens of shapes. You roll the sheet by hand and by machine, then cut, fold and ruffle it into the classics, from tagliatelle to reginette, and take home what you make.',
      'Una mattinata pratica per scoprire come una sola sfoglia diventa decine di forme. Tiri la sfoglia a mano e a macchina, poi la tagli, la pieghi e la arricci nei grandi classici, dalle tagliatelle alle reginette, e porti a casa ciò che hai fatto.',
      'Una mañana práctica para descubrir cómo una sola lámina de masa se convierte en decenas de formas. Estiras la masa a mano y a máquina, la cortas, la doblas y la rizas en los clásicos, de las tagliatelle a las reginette, y te llevas a casa lo que haces.',
      'Une matinée pratique pour découvrir comment une seule abaisse de pâte devient des dizaines de formes. Vous l’étalez à la main et à la machine, puis vous la coupez, la pliez et la froncez en grands classiques, des tagliatelles aux reginette, et vous repartez avec vos créations.',
      'Ein praktischer Vormittag darüber, wie aus einer Teigplatte Dutzende Formen werden. Du rollst den Teig von Hand und mit der Maschine aus, schneidest, faltest und kräuselst ihn zu Klassikern von Tagliatelle bis Reginette und nimmst alles mit nach Hause.',
      '一个上午的动手课程，看一张面皮如何变成几十种形状。你将手工和用压面机擀面，再切、折、压出花边，做出从宽面到花边面的经典款式，并把作品带回家。',
      'एक हैंड्स-ऑन सुबह, जिसमें आप देखेंगे कि आटे की एक शीट दर्जनों आकार कैसे बनती है। आप शीट को हाथ और मशीन से बेलेंगे, फिर काटेंगे, मोड़ेंगे और झालरदार बनाएँगे, टैग्लियाटेले से रेजिनेट तक, और अपनी बनाई पास्ता घर ले जाएँगे।',
    ),
    included: [
      L('All ingredients and an apron', 'Tutti gli ingredienti e un grembiule', 'Todos los ingredientes y un delantal', 'Tous les ingrédients et un tablier', 'Alle Zutaten und eine Schürze', '全部食材和一条围裙', 'सारी सामग्री और एक एप्रन'),
      L('Pasta machines and cutters', 'Macchine per la pasta e tagliapasta', 'Máquinas para pasta y cortadores', 'Machines à pâtes et découpoirs', 'Pastamaschinen und Teigrädchen', '压面机和切面工具', 'पास्ता मशीन और कटर'),
      L('A box to take your pasta home', 'Una scatola per portare a casa la tua pasta', 'Una caja para llevarte tu pasta', 'Une boîte pour emporter vos pâtes', 'Eine Box für deine Pasta zum Mitnehmen', '一个带走意面的盒子', 'अपना पास्ता घर ले जाने के लिए एक डिब्बा'),
    ],
    make: [
      L('Fresh egg dough from scratch', 'Impasto all’uovo da zero', 'Masa de huevo desde cero', 'Une pâte aux œufs maison', 'Frischen Eierteig von Grund auf', '从零开始做鸡蛋面团', 'शुरू से अंडे वाला ताज़ा आटा'),
      L('Tagliatelle, pappardelle and reginette', 'Tagliatelle, pappardelle e reginette', 'Tagliatelle, pappardelle y reginette', 'Tagliatelles, pappardelles et reginette', 'Tagliatelle, Pappardelle und Reginette', '宽面、阔面和花边面', 'टैग्लियाटेले, पपार्डेले और रेजिनेट'),
      L('Your own signature cut', 'Un tuo taglio personale', 'Tu propio corte', 'Votre propre découpe', 'Deinen eigenen Schnitt', '属于你的独特切法', 'आपका अपना खास कट'),
    ],
  },
  {
    id: 'pasta-atelier',
    number: '03',
    type: 'shapelab',
    formats: ['design-led', 'hands-on'],
    country: 'uk',
    city: L('London', 'Londra', 'Londres', 'Londres', 'London', '伦敦', 'लंदन'),
    venue: 'The Fold Studio',
    start: '2026-11-28T14:00',
    minutes: 180,
    price: 28,
    places: 16,
    level: 'overcooked',
    visual: { shape: 'sculpture', color: '#e1201b', finish: 'aldente', bg: '#f8eabe', ink: '#1d1d1b', img: sculptureImg },
    title: L('The Pasta Atelier', 'L’atelier della pasta', 'El atelier de la pasta', 'L’atelier des pâtes', 'Das Pasta-Atelier', '意面工作室', 'पास्ता एटेलियर'),
    short: L(
      'Advanced shaping: folds, ridges and ruffles, then a shape of your own.',
      'Forme avanzate: pieghe, righe e arricciature, poi una forma tutta tua.',
      'Formas avanzadas: pliegues, estrías y volantes, y después una forma propia.',
      'Façonnage avancé : plis, rainures et fronces, puis une forme bien à vous.',
      'Fortgeschrittenes Formen: Falten, Rillen und Rüschen, dann eine eigene Form.',
      '进阶造型：折痕、纹路和花边，然后创作属于你的形状。',
      'उन्नत आकार: तह, धारियाँ और झालर, फिर आपका अपना आकार।',
    ),
    description: L(
      'A design-led session for people who already shape pasta with confidence. Guided by how ridges hold sauce and folds survive the pot, you study classic techniques, then sketch, prototype and cook a shape of your own.',
      'Una sessione di design per chi modella già la pasta con sicurezza. Partendo da come le righe trattengono il sugo e le pieghe resistono alla cottura, studi le tecniche classiche, poi disegni, prototipi e cuoci una forma tutta tua.',
      'Una sesión de diseño para quienes ya dan forma a la pasta con soltura. Partiendo de cómo las estrías retienen la salsa y los pliegues resisten la cocción, estudias las técnicas clásicas y luego dibujas, pruebas y cocinas una forma propia.',
      'Une séance orientée design pour celles et ceux qui façonnent déjà les pâtes avec aisance. En partant de la façon dont les rainures retiennent la sauce et dont les plis résistent à la cuisson, vous étudiez les techniques classiques, puis dessinez, prototypez et cuisez une forme à vous.',
      'Eine Design-Session für alle, die Pasta schon sicher formen. Ausgehend davon, wie Rillen Sauce halten und Falten das Kochen überstehen, lernst du klassische Techniken und skizzierst, testest und kochst dann deine eigene Form.',
      '一场以设计为主导的课程，适合已能熟练捏制意面的人。从纹路如何挂住酱汁、折痕如何经得起煮开始，学习经典技法，再草图、打样并煮出你自己的形状。',
      'उन लोगों के लिए डिज़ाइन सेशन जो पहले से पास्ता को आत्मविश्वास से आकार देते हैं। धारियाँ सॉस कैसे पकड़ती हैं और तह पकने में कैसे टिकती हैं, यह समझकर आप क्लासिक तकनीकें सीखेंगे, फिर अपना आकार स्केच करेंगे, बनाएँगे और पकाएँगे।',
    ),
    included: [
      L('Coloured doughs and shaping tools', 'Impasti colorati e attrezzi per modellare', 'Masas de colores y herramientas para dar forma', 'Pâtes colorées et outils de façonnage', 'Farbige Teige und Formwerkzeuge', '彩色面团和造型工具', 'रंगीन आटा और आकार देने के औज़ार'),
      L('Sketchbook and shape cards', 'Quaderno e schede delle forme', 'Cuaderno y fichas de formas', 'Carnet de croquis et fiches de formes', 'Skizzenbuch und Formkarten', '速写本和形状卡片', 'स्केचबुक और आकार कार्ड'),
      L('Tea, coffee and something sweet', 'Tè, caffè e qualcosa di dolce', 'Té, café y algo dulce', 'Thé, café et une douceur', 'Tee, Kaffee und etwas Süßes', '茶、咖啡和甜点', 'चाय, कॉफ़ी और कुछ मीठा'),
    ],
    make: [
      L('Studies of classic folds and ridges', 'Studi di pieghe e righe classiche', 'Estudios de pliegues y estrías clásicos', 'Des études de plis et de rainures classiques', 'Studien klassischer Falten und Rillen', '经典折痕与纹路练习', 'क्लासिक तह और धारियों के अभ्यास'),
      L('One original pasta shape, named by you', 'Una forma di pasta originale, con il nome che scegli tu', 'Una forma de pasta original, con el nombre que elijas', 'Une forme de pâte originale, que vous baptisez', 'Eine eigene Pastaform mit selbst gewähltem Namen', '一款由你命名的原创意面形状', 'आपके नाम वाला एक मौलिक पास्ता आकार'),
      L('A tasting of your shape, cooked', 'Un assaggio della tua forma, cotta', 'Una degustación de tu forma, cocinada', 'Une dégustation de votre forme, cuite', 'Eine Kostprobe deiner gekochten Form', '品尝煮好的自创形状', 'अपने पकाए गए आकार का स्वाद'),
    ],
  },
  {
    id: 'pasta-after-hours',
    number: '04',
    type: 'supper',
    formats: ['social'],
    country: 'uk',
    city: L('Manchester', 'Manchester', 'Mánchester', 'Manchester', 'Manchester', '曼彻斯特', 'मैनचेस्टर'),
    venue: 'Long Table Room',
    start: '2026-12-04T19:30',
    minutes: 180,
    price: 32,
    places: 24,
    level: 'aldente',
    visual: { shape: 'spaghetti', color: '#ffb548', finish: 'aldente', bg: '#6a3933', ink: '#ffffff', img: spaghettiImg },
    title: L('Pasta After Hours', 'Pasta fuori orario', 'Pasta a deshoras', 'Pâtes à la nuit tombée', 'Pasta nach Feierabend', '深夜意面局', 'देर रात पास्ता'),
    short: L(
      'One long table, fresh pasta, a playlist and people you haven’t met yet.',
      'Una lunga tavolata, pasta fresca, una playlist e persone che non conosci ancora.',
      'Una mesa larga, pasta fresca, una playlist y gente que aún no conoces.',
      'Une grande tablée, des pâtes fraîches, une playlist et des gens que vous ne connaissez pas encore.',
      'Eine lange Tafel, frische Pasta, eine Playlist und Leute, die du noch nicht kennst.',
      '一张长桌、新鲜意面、一份歌单，还有你还没认识的人。',
      'एक लंबी मेज़, ताज़ा पास्ता, एक प्लेलिस्ट और वे लोग जिनसे आप अभी तक नहीं मिले।',
    ),
    description: L(
      'An evening built around the social side of Italian food: three relaxed courses of fresh pasta served family-style at one long table, with a guest selector on the music. Halfway through, everyone shapes a quick round of pasta for the next course.',
      'Una serata dedicata al lato sociale del cibo italiano: tre portate di pasta fresca servite al centro di un’unica lunga tavolata, con un selector alla musica. A metà serata tutti preparano un giro veloce di pasta per la portata successiva.',
      'Una velada dedicada al lado social de la comida italiana: tres platos de pasta fresca para compartir en una única mesa larga, con un selector a cargo de la música. A mitad de la noche, todos preparan una ronda rápida de pasta para el siguiente plato.',
      'Une soirée consacrée au côté convivial de la cuisine italienne : trois plats de pâtes fraîches à partager sur une seule grande tablée, avec un sélecteur à la musique. À mi-soirée, chacun façonne une petite série de pâtes pour le plat suivant.',
      'Ein Abend rund um die gesellige Seite der italienischen Küche: drei entspannte Gänge frischer Pasta zum Teilen an einer langen Tafel, mit einem Gast-DJ an der Musik. Zwischendurch formen alle eine schnelle Runde Pasta für den nächsten Gang.',
      '一个围绕意大利饮食社交面的夜晚：在一张长桌上共享三道新鲜意面，由客座 DJ 负责音乐。用餐中途，大家一起动手做下一道菜的意面。',
      'इतालवी खाने के सामाजिक पहलू पर बनी एक शाम: एक लंबी मेज़ पर साझा करने के लिए ताज़ा पास्ता के तीन कोर्स, और संगीत पर एक गेस्ट सेलेक्टर। बीच में सब मिलकर अगले कोर्स के लिए जल्दी से पास्ता बनाते हैं।',
    ),
    included: [
      L('Three sharing courses of fresh pasta', 'Tre portate di pasta fresca da condividere', 'Tres platos de pasta fresca para compartir', 'Trois plats de pâtes fraîches à partager', 'Drei Gänge frischer Pasta zum Teilen', '三道可分享的新鲜意面', 'साझा करने के लिए ताज़ा पास्ता के तीन कोर्स'),
      L('A welcome drink', 'Un drink di benvenuto', 'Una bebida de bienvenida', 'Une boisson d’accueil', 'Ein Begrüßungsdrink', '一杯迎宾饮品', 'एक वेलकम ड्रिंक'),
      L('Live DJ selection', 'Selezione musicale dal vivo', 'Selección musical en directo', 'Sélection musicale en direct', 'Live-DJ-Auswahl', '现场 DJ 音乐', 'लाइव डीजे संगीत'),
    ],
    make: [
      L('A round of hand-shaped pasta at the table', 'Un giro di pasta fatta a mano al tavolo', 'Una ronda de pasta hecha a mano en la mesa', 'Une série de pâtes façonnées à table', 'Eine Runde handgeformter Pasta am Tisch', '在餐桌上亲手做一轮意面', 'मेज़ पर हाथ से बना पास्ता'),
      L('New friends around one table', 'Nuovi amici attorno a un tavolo', 'Nuevos amigos alrededor de una mesa', 'De nouveaux amis autour d’une table', 'Neue Freunde an einem Tisch', '一张桌边的新朋友', 'एक मेज़ के चारों ओर नए दोस्त'),
      L('The evening’s playlist, to take home', 'La playlist della serata, da portare a casa', 'La playlist de la noche, para llevar', 'La playlist de la soirée, à emporter', 'Die Playlist des Abends für zu Hause', '可带回家的当晚歌单', 'शाम की प्लेलिस्ट, घर ले जाने के लिए'),
    ],
  },
  {
    id: 'aperitivo',
    number: '05',
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
    visual: { shape: 'gnocchi', color: '#f8eabe', finish: 'raw', bg: '#1a5632', ink: '#ffffff', img: gnocchiImg },
    title: L('Aperitivo', 'Aperitivo', 'Aperitivo', 'Apéritif à l’italienne', 'Aperitivo', '意式开胃酒会', 'अपेरिटिवो'),
    short: L(
      'A contemporary aperitivo of handmade pasta bites and easy pairings.',
      'Un aperitivo contemporaneo di bocconi di pasta fatta a mano e abbinamenti semplici.',
      'Un aperitivo contemporáneo de bocados de pasta hecha a mano y maridajes sencillos.',
      'Un apéritif contemporain de bouchées de pâtes faites main et d’accords simples.',
      'Ein zeitgemäßer Aperitivo mit handgemachten Pasta-Häppchen und einfachen Kombinationen.',
      '当代风格的开胃酒会：手工意面小食与轻松搭配。',
      'हाथ से बने पास्ता के छोटे बाइट्स और आसान जोड़ियों वाला एक आधुनिक अपेरिटिवो।',
    ),
    description: L(
      'The Bolognese ritual of aperitivo, reworked around a standing counter. Small handmade bites, from crisp gnocchi to filled pasta, come with bitter, sparkling and alcohol-free drinks. Easy to drop into, easy to stay late.',
      'Il rito bolognese dell’aperitivo, rivisitato attorno a un bancone. Piccoli bocconi fatti a mano, dagli gnocchi croccanti alla pasta ripiena, accompagnati da drink amari, frizzanti e analcolici. Facile arrivare, difficile andare via presto.',
      'El ritual boloñés del aperitivo, reinventado alrededor de una barra. Pequeños bocados hechos a mano, de ñoquis crujientes a pasta rellena, con bebidas amargas, espumosas y sin alcohol. Fácil llegar, difícil irse pronto.',
      'Le rituel bolonais de l’apéritif, revisité autour d’un comptoir. De petites bouchées faites main, des gnocchis croustillants aux pâtes farcies, avec des boissons amères, pétillantes et sans alcool. Facile d’arriver, difficile de partir tôt.',
      'Das Bologneser Aperitivo-Ritual, neu gedacht an einer Stehtheke. Kleine handgemachte Häppchen von knusprigen Gnocchi bis gefüllter Pasta, dazu bittere, prickelnde und alkoholfreie Drinks. Leicht vorbeizukommen, schwer früh zu gehen.',
      '围绕吧台重新演绎博洛尼亚的开胃酒传统。从香脆团子到夹馅意面的手工小食，搭配苦味、气泡和无酒精饮品。随时可来，不舍早走。',
      'बोलोन्या की अपेरिटिवो परंपरा, एक काउंटर के चारों ओर नए अंदाज़ में। कुरकुरे न्योकी से भरे पास्ता तक हाथ से बने छोटे बाइट्स, कड़वे, स्पार्कलिंग और बिना अल्कोहल वाले ड्रिंक्स के साथ। आना आसान, जल्दी जाना मुश्किल।',
    ),
    included: [
      L('Five handmade pasta bites', 'Cinque bocconi di pasta fatta a mano', 'Cinco bocados de pasta hecha a mano', 'Cinq bouchées de pâtes faites main', 'Fünf handgemachte Pasta-Häppchen', '五款手工意面小食', 'हाथ से बने पास्ता के पाँच बाइट्स'),
      L('Two drinks (alcohol-free options)', 'Due drink (anche analcolici)', 'Dos bebidas (también sin alcohol)', 'Deux boissons (options sans alcool)', 'Zwei Drinks (auch alkoholfrei)', '两杯饮品（可选无酒精）', 'दो ड्रिंक्स (बिना अल्कोहल विकल्प भी)'),
      L('A live gnocchi-rolling demo', 'Una dimostrazione dal vivo di gnocchi rigati', 'Una demostración en directo de ñoquis', 'Une démonstration de gnocchis en direct', 'Eine Live-Vorführung zum Gnocchi-Rollen', '现场团子制作演示', 'न्योकी बनाने का लाइव डेमो'),
    ],
    make: [
      L('Ridged gnocchi on the board', 'Gnocchi rigati sul tagliere', 'Ñoquis rayados en la tabla', 'Des gnocchis striés sur la planche', 'Gerillte Gnocchi auf dem Brett', '在案板上做出带纹团子', 'बोर्ड पर धारीदार न्योकी'),
      L('Your favourite pairing of the night', 'Il tuo abbinamento preferito della serata', 'Tu maridaje favorito de la noche', 'Votre accord préféré de la soirée', 'Deine Lieblingskombination des Abends', '你今晚最爱的搭配', 'शाम की आपकी पसंदीदा जोड़ी'),
      L('An easy aperitivo to host at home', 'Un aperitivo facile da rifare a casa', 'Un aperitivo fácil de repetir en casa', 'Un apéritif facile à refaire chez soi', 'Einen einfachen Aperitivo für zu Hause', '一个在家也能轻松办的开胃酒会', 'घर पर आसानी से करने लायक अपेरिटिवो'),
    ],
  },
  {
    id: 'make-shoot-share',
    number: '06',
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
    visual: { shape: 'fusilli', color: '#1a5632', finish: 'aldente', bg: '#ffb548', ink: '#1d1d1b', img: fusilliImg },
    title: L(
      'Make, Shoot and Share: Sunday Edition',
      'Crea, scatta e condividi: edizione della domenica',
      'Crea, fotografía y comparte: edición de domingo',
      'Créer, photographier, partager : édition du dimanche',
      'Machen, fotografieren, teilen: Sonntagsausgabe',
      '制作、拍摄、分享：周日特别场',
      'बनाओ, खींचो और शेयर करो: संडे एडिशन',
    ),
    short: L(
      'A Sunday of food styling, photography and short videos, with pasta as the subject.',
      'Una domenica di food styling, fotografia e video brevi, con la pasta come protagonista.',
      'Un domingo de food styling, fotografía y vídeos cortos, con la pasta como protagonista.',
      'Un dimanche de stylisme culinaire, de photo et de vidéos courtes, avec les pâtes pour sujet.',
      'Ein Sonntag mit Foodstyling, Fotografie und Kurzvideos, mit Pasta als Motiv.',
      '一个以意面为主角的周日：美食造型、摄影和短视频。',
      'फ़ूड स्टाइलिंग, फ़ोटोग्राफ़ी और छोटे वीडियो का एक रविवार, पास्ता के साथ।',
    ),
    description: L(
      'A creative Sunday afternoon with a food stylist and a content creator. In small teams you make a batch of pasta, build a set around its spirals and textures, then light it, shoot it and edit a short vertical story on your phone.',
      'Un pomeriggio creativo della domenica con una food stylist e un content creator. In piccoli gruppi prepari la pasta, costruisci un set attorno alle sue spirali e texture, poi la illumini, la fotografi e monti una breve storia verticale con il telefono.',
      'Una tarde creativa de domingo con una estilista gastronómica y un creador de contenido. En grupos pequeños preparas pasta, montas un set alrededor de sus espirales y texturas, la iluminas, la fotografías y editas una historia vertical corta con el móvil.',
      'Un après-midi créatif du dimanche avec une styliste culinaire et un créateur de contenu. En petits groupes, vous préparez des pâtes, construisez un décor autour de leurs spirales et textures, puis vous les éclairez, les photographiez et montez une courte story verticale sur votre téléphone.',
      'Ein kreativer Sonntagnachmittag mit einer Foodstylistin und einem Content Creator. In kleinen Teams machst du Pasta, baust ein Set um ihre Spiralen und Texturen, leuchtest es aus, fotografierst es und schneidest eine kurze Hochformat-Story am Handy.',
      '与美食造型师和内容创作者共度的创意周日下午。小组合作做意面，围绕螺旋与纹理搭建布景，然后打光、拍摄，并用手机剪辑一段竖屏短片。',
      'एक फ़ूड स्टाइलिस्ट और कंटेंट क्रिएटर के साथ रविवार की रचनात्मक दोपहर। छोटी टीमों में आप पास्ता बनाते हैं, उसके घुमाव और बनावट के आसपास सेट बनाते हैं, फिर रोशनी करते हैं, फ़ोटो लेते हैं और फ़ोन पर एक छोटी वर्टिकल स्टोरी एडिट करते हैं।',
    ),
    included: [
      L('Styled sets, props and coloured pasta', 'Set, oggetti di scena e pasta colorata', 'Sets, atrezo y pasta de colores', 'Décors, accessoires et pâtes colorées', 'Sets, Requisiten und farbige Pasta', '布景、道具和彩色意面', 'सेट, प्रॉप्स और रंगीन पास्ता'),
      L('Lighting kit and phone rigs', 'Luci e supporti per il telefono', 'Iluminación y soportes para el móvil', 'Éclairage et supports pour téléphone', 'Licht und Handyhalterungen', '灯光设备和手机支架', 'लाइटिंग किट और फ़ोन स्टैंड'),
      L('Your best shot printed', 'Lo scatto migliore stampato', 'Tu mejor foto impresa', 'Votre meilleure photo imprimée', 'Dein bestes Foto als Druck', '打印出你最好的作品', 'आपकी सबसे अच्छी फ़ोटो का प्रिंट'),
    ],
    make: [
      L('A batch of fresh fusilli', 'Una porzione di fusilli freschi', 'Una tanda de fusilli frescos', 'Une fournée de fusilli frais', 'Eine Portion frische Fusilli', '一批新鲜螺旋面', 'ताज़ा फ़्यूज़िली का एक बैच'),
      L('A styled still-life shoot', 'Uno still life in stile editoriale', 'Un bodegón de estilo editorial', 'Une nature morte stylisée', 'Ein gestyltes Stillleben', '一组风格化静物摄影', 'एक स्टाइल किया हुआ स्टिल-लाइफ़ शूट'),
      L('A 15-second vertical story', 'Una storia verticale di 15 secondi', 'Una historia vertical de 15 segundos', 'Une story verticale de 15 secondes', 'Eine 15-Sekunden-Story im Hochformat', '一段 15 秒竖屏短片', '15 सेकंड की वर्टिकल स्टोरी'),
    ],
  },
];

export const eventById = (id) => EVENTS.find((e) => e.id === id);
