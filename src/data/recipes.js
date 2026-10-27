// Recipe builder of the free events: pick a pasta, add ingredients, find the
// traditional Italian dish they make. Only well-established recipes are listed;
// any other combination is shown as a creative variation, never as tradition.
// Dish names stay in Italian (they are the dishes' own names).
import spaghettiImg from '../assets/events/spaghetti.webp';
import tagliatelleImg from '../assets/events/tagliatelle.webp';
import gnocchiImg from '../assets/events/gnocchi.webp';
import ravioliImg from '../assets/events/ravioli.webp';
import fusilliImg from '../assets/events/fusilli.webp';

const L = (en, it, es, fr, de, zh, hi) => ({ en, it, es, fr, de, zh, hi });

export const RECIPE_PASTAS = [
  { id: 'spaghetti', img: spaghettiImg, name: L('Spaghetti', 'Spaghetti', 'Espaguetis', 'Spaghetti', 'Spaghetti', '意大利面', 'स्पेगेटी') },
  { id: 'tagliatelle', img: tagliatelleImg, name: L('Tagliatelle', 'Tagliatelle', 'Tagliatelle', 'Tagliatelles', 'Tagliatelle', '宽面', 'टैग्लियाटेले') },
  { id: 'gnocchi', img: gnocchiImg, name: L('Gnocchi', 'Gnocchi', 'Ñoquis', 'Gnocchis', 'Gnocchi', '团子', 'न्योकी') },
  { id: 'ravioli', img: ravioliImg, name: L('Ricotta ravioli', 'Ravioli di ricotta', 'Ravioli de ricotta', 'Raviolis à la ricotta', 'Ricotta-Ravioli', '乳清干酪方饺', 'रिकोटा रैवियोली') },
  { id: 'fusilli', img: fusilliImg, name: L('Fusilli', 'Fusilli', 'Fusilli', 'Fusilli', 'Fusilli', '螺旋面', 'फ़्यूज़िली') },
];

// ingredients as colours, like the colour pickers of the configurators
export const INGREDIENTS = [
  { id: 'tomato', hex: '#e1201b', name: L('Tomato', 'Pomodoro', 'Tomate', 'Tomate', 'Tomate', '番茄', 'टमाटर') },
  { id: 'basil', hex: '#1a5632', name: L('Basil', 'Basilico', 'Albahaca', 'Basilic', 'Basilikum', '罗勒', 'तुलसी') },
  { id: 'guanciale', hex: '#e7b3a1', name: L('Guanciale', 'Guanciale', 'Guanciale', 'Guanciale', 'Guanciale', '猪脸肉', 'ग्वान्चाले') },
  { id: 'egg', hex: '#ffb548', name: L('Egg yolk', 'Tuorlo d’uovo', 'Yema de huevo', 'Jaune d’œuf', 'Eigelb', '蛋黄', 'अंडे की ज़र्दी') },
  { id: 'pecorino', hex: '#eee2c0', name: L('Pecorino Romano', 'Pecorino Romano', 'Pecorino Romano', 'Pecorino Romano', 'Pecorino Romano', '罗马羊奶酪', 'पेकोरिनो रोमानो') },
  { id: 'pepper', hex: '#3b3733', name: L('Black pepper', 'Pepe nero', 'Pimienta negra', 'Poivre noir', 'Schwarzer Pfeffer', '黑胡椒', 'काली मिर्च') },
  { id: 'ragu', hex: '#6a3933', name: L('Ragù', 'Ragù', 'Ragú', 'Ragù', 'Ragù', '肉酱', 'रागू') },
  { id: 'parmigiano', hex: '#f1d48a', name: L('Parmigiano Reggiano', 'Parmigiano Reggiano', 'Parmigiano Reggiano', 'Parmigiano Reggiano', 'Parmigiano Reggiano', '帕玛森干酪', 'पार्मिजानो रेज्जानो') },
  { id: 'mozzarella', hex: '#faf8f0', name: L('Mozzarella', 'Mozzarella', 'Mozzarella', 'Mozzarella', 'Mozzarella', '马苏里拉', 'मोज़ेरेला') },
  { id: 'butter', hex: '#f7df8e', name: L('Butter', 'Burro', 'Mantequilla', 'Beurre', 'Butter', '黄油', 'मक्खन') },
  { id: 'sage', hex: '#8ca383', name: L('Sage', 'Salvia', 'Salvia', 'Sauge', 'Salbei', '鼠尾草', 'सेज') },
];

/*
 * Traditional dishes: `need` = the defining ingredients, `may` = optional
 * ones that keep it traditional. Steps are short and kept to what is
 * commonly agreed for each dish.
 */
export const RECIPES = [
  {
    id: 'pomodoro',
    pasta: 'spaghetti',
    name: 'Spaghetti al pomodoro e basilico',
    need: ['tomato', 'basil'],
    may: ['parmigiano'],
    steps: [
      L('Warm olive oil with a garlic clove, add the tomatoes and simmer for about 15 minutes.', 'Scalda l’olio con uno spicchio d’aglio, aggiungi il pomodoro e cuoci per circa 15 minuti.', 'Calienta aceite con un diente de ajo, añade el tomate y cuece unos 15 minutos.', 'Chauffez l’huile avec une gousse d’ail, ajoutez la tomate et laissez mijoter environ 15 minutes.', 'Olivenöl mit einer Knoblauchzehe erwärmen, Tomaten zugeben und etwa 15 Minuten köcheln.', '橄榄油加一瓣大蒜加热，放入番茄，小火煮约 15 分钟。', 'लहसुन की एक कली के साथ जैतून का तेल गरम करें, टमाटर डालें और लगभग 15 मिनट पकाएँ।'),
      L('Cook the spaghetti al dente.', 'Cuoci gli spaghetti al dente.', 'Cuece los espaguetis al dente.', 'Faites cuire les spaghetti al dente.', 'Spaghetti al dente kochen.', '把意大利面煮至弹牙。', 'स्पेगेटी को अल डेंटे पकाएँ।'),
      L('Toss with the sauce and finish with torn basil and a drizzle of olive oil.', 'Salta con il sugo e completa con basilico spezzato e un filo d’olio a crudo.', 'Saltea con la salsa y termina con albahaca troceada y un hilo de aceite.', 'Mélangez à la sauce et terminez avec du basilic déchiré et un filet d’huile.', 'Mit der Sauce schwenken, mit gezupftem Basilikum und etwas Olivenöl vollenden.', '与酱汁拌匀，撒上手撕罗勒，淋少许橄榄油。', 'सॉस में मिलाएँ और तोड़ी हुई तुलसी व थोड़े जैतून के तेल से पूरा करें।'),
    ],
  },
  {
    id: 'cacioepepe',
    pasta: 'spaghetti',
    name: 'Spaghetti cacio e pepe',
    need: ['pecorino', 'pepper'],
    may: [],
    steps: [
      L('Toast plenty of cracked black pepper in a dry pan.', 'Tosta abbondante pepe nero pestato in una padella asciutta.', 'Tuesta abundante pimienta negra machacada en una sartén seca.', 'Faites torréfier beaucoup de poivre noir concassé à sec.', 'Reichlich groben schwarzen Pfeffer in einer trockenen Pfanne rösten.', '在干锅中焙香大量粗磨黑胡椒。', 'सूखे पैन में खूब सारी कुटी काली मिर्च भूनें।'),
      L('Cook the spaghetti and keep the starchy cooking water.', 'Cuoci gli spaghetti e tieni da parte l’acqua di cottura amidosa.', 'Cuece los espaguetis y guarda el agua de cocción con almidón.', 'Faites cuire les spaghetti et gardez l’eau de cuisson amidonnée.', 'Spaghetti kochen und das stärkehaltige Kochwasser aufheben.', '煮意大利面，留下含淀粉的煮面水。', 'स्पेगेटी पकाएँ और स्टार्च वाला पानी बचा लें।'),
      L('Off the heat, toss with finely grated Pecorino Romano and the pasta water until creamy.', 'A fuoco spento, manteca con Pecorino Romano grattugiato fine e l’acqua di cottura fino a ottenere una crema.', 'Fuera del fuego, mezcla con Pecorino Romano rallado fino y el agua de cocción hasta que quede cremoso.', 'Hors du feu, mélangez avec le Pecorino Romano finement râpé et l’eau de cuisson jusqu’à obtenir une crème.', 'Vom Herd nehmen und mit fein geriebenem Pecorino Romano und Kochwasser cremig rühren.', '离火后，加入细磨罗马羊奶酪和煮面水，拌至顺滑。', 'आँच से हटाकर बारीक कद्दूकस पेकोरिनो रोमानो और पास्ता के पानी के साथ क्रीमी होने तक मिलाएँ।'),
    ],
  },
  {
    id: 'carbonara',
    pasta: 'spaghetti',
    name: 'Spaghetti alla carbonara',
    need: ['guanciale', 'egg', 'pecorino', 'pepper'],
    may: [],
    steps: [
      L('Fry strips of guanciale until crisp, without adding oil.', 'Rosola le listarelle di guanciale finché sono croccanti, senza aggiungere olio.', 'Dora tiras de guanciale hasta que estén crujientes, sin añadir aceite.', 'Faites dorer des lanières de guanciale jusqu’à ce qu’elles soient croustillantes, sans huile.', 'Guanciale-Streifen ohne Öl knusprig braten.', '不加油，将猪脸肉条煎至酥脆。', 'बिना तेल डाले ग्वान्चाले की पट्टियों को कुरकुरा होने तक भूनें।'),
      L('Whisk egg yolks with grated Pecorino Romano and black pepper.', 'Sbatti i tuorli con Pecorino Romano grattugiato e pepe nero.', 'Bate las yemas con Pecorino Romano rallado y pimienta negra.', 'Battez les jaunes avec le Pecorino Romano râpé et le poivre noir.', 'Eigelb mit geriebenem Pecorino Romano und schwarzem Pfeffer verquirlen.', '把蛋黄、磨碎的罗马羊奶酪和黑胡椒搅匀。', 'अंडे की ज़र्दी को कद्दूकस पेकोरिनो रोमानो और काली मिर्च के साथ फेंटें।'),
      L('Off the heat, toss the spaghetti with the guanciale, then the egg mixture, loosening with pasta water.', 'A fuoco spento, unisci gli spaghetti al guanciale e poi alla crema di uova, allungando con l’acqua di cottura.', 'Fuera del fuego, mezcla los espaguetis con el guanciale y después con la crema de huevo, aligerando con agua de cocción.', 'Hors du feu, mélangez les spaghetti au guanciale puis à la crème d’œufs, en détendant avec l’eau de cuisson.', 'Vom Herd nehmen, Spaghetti mit Guanciale und dann der Eimischung vermengen, mit Kochwasser lockern.', '离火后，先把意大利面和猪脸肉拌匀，再拌入蛋液，用煮面水调稀。', 'आँच से हटाकर स्पेगेटी को ग्वान्चाले, फिर अंडे के मिश्रण के साथ मिलाएँ और पास्ता के पानी से ढीला करें।'),
    ],
  },
  {
    id: 'gricia',
    pasta: 'spaghetti',
    name: 'Spaghetti alla gricia',
    need: ['guanciale', 'pecorino', 'pepper'],
    may: [],
    steps: [
      L('Render the guanciale slowly until golden.', 'Rosola lentamente il guanciale finché è dorato.', 'Dora el guanciale a fuego lento.', 'Faites fondre doucement le guanciale jusqu’à ce qu’il dore.', 'Guanciale langsam goldbraun auslassen.', '小火慢煎猪脸肉至金黄。', 'ग्वान्चाले को धीमी आँच पर सुनहरा होने तक पकाएँ।'),
      L('Add the spaghetti with a ladle of cooking water.', 'Aggiungi gli spaghetti con un mestolo d’acqua di cottura.', 'Añade los espaguetis con un cucharón de agua de cocción.', 'Ajoutez les spaghetti avec une louche d’eau de cuisson.', 'Spaghetti mit einer Kelle Kochwasser zugeben.', '加入意大利面和一勺煮面水。', 'स्पेगेटी को एक करछी पानी के साथ डालें।'),
      L('Off the heat, stir in Pecorino Romano and black pepper until creamy.', 'A fuoco spento, manteca con Pecorino Romano e pepe nero fino a ottenere una crema.', 'Fuera del fuego, mezcla con Pecorino Romano y pimienta hasta que quede cremoso.', 'Hors du feu, incorporez le Pecorino Romano et le poivre jusqu’à obtenir une crème.', 'Vom Herd nehmen, Pecorino Romano und Pfeffer cremig unterrühren.', '离火后，拌入罗马羊奶酪和黑胡椒至顺滑。', 'आँच से हटाकर पेकोरिनो रोमानो और काली मिर्च मिलाकर क्रीमी करें।'),
    ],
  },
  {
    id: 'amatriciana',
    pasta: 'spaghetti',
    name: 'Spaghetti all’amatriciana',
    need: ['guanciale', 'tomato', 'pecorino'],
    may: ['pepper'],
    steps: [
      L('Brown the guanciale, then add the tomatoes and simmer for about 10 minutes.', 'Rosola il guanciale, poi aggiungi il pomodoro e cuoci per circa 10 minuti.', 'Dora el guanciale, añade el tomate y cuece unos 10 minutos.', 'Faites dorer le guanciale, ajoutez la tomate et laissez mijoter environ 10 minutes.', 'Guanciale anbraten, Tomaten zugeben und etwa 10 Minuten köcheln.', '煎香猪脸肉，加入番茄，小火煮约 10 分钟。', 'ग्वान्चाले भूनें, फिर टमाटर डालकर लगभग 10 मिनट पकाएँ।'),
      L('Cook the spaghetti al dente.', 'Cuoci gli spaghetti al dente.', 'Cuece los espaguetis al dente.', 'Faites cuire les spaghetti al dente.', 'Spaghetti al dente kochen.', '把意大利面煮至弹牙。', 'स्पेगेटी को अल डेंटे पकाएँ।'),
      L('Toss with the sauce and finish with grated Pecorino Romano.', 'Salta con il sugo e completa con Pecorino Romano grattugiato.', 'Saltea con la salsa y termina con Pecorino Romano rallado.', 'Mélangez à la sauce et terminez avec du Pecorino Romano râpé.', 'Mit der Sauce schwenken und mit geriebenem Pecorino Romano vollenden.', '与酱汁拌匀，撒上磨碎的罗马羊奶酪。', 'सॉस में मिलाएँ और कद्दूकस पेकोरिनो रोमानो से पूरा करें।'),
    ],
  },
  {
    id: 'ragu',
    pasta: 'tagliatelle',
    name: 'Tagliatelle al ragù',
    need: ['ragu'],
    may: ['parmigiano'],
    steps: [
      L('Make the ragù: a soffritto of onion, carrot and celery, minced meat, a little tomato and a long, slow simmer.', 'Prepara il ragù: soffritto di cipolla, carota e sedano, carne macinata, poco pomodoro e una cottura lunga e lenta.', 'Prepara el ragú: sofrito de cebolla, zanahoria y apio, carne picada, un poco de tomate y una cocción larga y lenta.', 'Préparez le ragù : soffritto d’oignon, carotte et céleri, viande hachée, un peu de tomate et une longue cuisson douce.', 'Ragù zubereiten: Soffritto aus Zwiebel, Karotte und Sellerie, Hackfleisch, etwas Tomate und langes, sanftes Schmoren.', '做肉酱：洋葱、胡萝卜和芹菜炒底，加肉末和少许番茄，小火慢炖。', 'रागू बनाएँ: प्याज़, गाजर और सेलेरी का सॉफ्रीतो, कीमा, थोड़ा टमाटर और लंबी धीमी आँच।'),
      L('Cook fresh egg tagliatelle for a couple of minutes.', 'Cuoci le tagliatelle fresche all’uovo per un paio di minuti.', 'Cuece las tagliatelle frescas de huevo un par de minutos.', 'Faites cuire les tagliatelles fraîches aux œufs quelques minutes.', 'Frische Eier-Tagliatelle ein paar Minuten kochen.', '新鲜鸡蛋宽面煮两三分钟。', 'ताज़ा अंडे वाली टैग्लियाटेले को दो-तीन मिनट पकाएँ।'),
      L('Toss with the ragù and serve with grated Parmigiano Reggiano.', 'Condisci con il ragù e servi con Parmigiano Reggiano grattugiato.', 'Mezcla con el ragú y sirve con Parmigiano Reggiano rallado.', 'Mélangez au ragù et servez avec du Parmigiano Reggiano râpé.', 'Mit dem Ragù vermengen und mit geriebenem Parmigiano Reggiano servieren.', '拌入肉酱，撒上帕玛森干酪即可上桌。', 'रागू के साथ मिलाएँ और कद्दूकस पार्मिजानो रेज्जानो के साथ परोसें।'),
    ],
  },
  {
    id: 'sorrentina',
    pasta: 'gnocchi',
    name: 'Gnocchi alla sorrentina',
    need: ['tomato', 'mozzarella', 'basil'],
    may: ['parmigiano'],
    steps: [
      L('Simmer a simple tomato sauce.', 'Prepara un semplice sugo di pomodoro.', 'Prepara una salsa de tomate sencilla.', 'Préparez une sauce tomate simple.', 'Eine einfache Tomatensauce köcheln.', '煮一份简单的番茄酱。', 'एक सादा टमाटर सॉस पकाएँ।'),
      L('Boil the gnocchi until they float, then toss them in the sauce with diced mozzarella and basil.', 'Lessa gli gnocchi finché vengono a galla, poi uniscili al sugo con mozzarella a cubetti e basilico.', 'Hierve los ñoquis hasta que floten y mézclalos con la salsa, mozzarella en dados y albahaca.', 'Faites cuire les gnocchis jusqu’à ce qu’ils remontent, puis mélangez-les à la sauce avec la mozzarella en dés et le basilic.', 'Gnocchi kochen, bis sie oben schwimmen, dann mit Sauce, gewürfeltem Mozzarella und Basilikum mischen.', '团子煮至浮起，与番茄酱、切丁马苏里拉和罗勒拌匀。', 'न्योकी को तैरने तक उबालें, फिर सॉस, कटे मोज़ेरेला और तुलसी के साथ मिलाएँ।'),
      L('Bake briefly in a hot oven until the mozzarella melts.', 'Passa in forno caldo per pochi minuti, finché la mozzarella fila.', 'Hornea unos minutos en horno caliente hasta que la mozzarella se funda.', 'Passez quelques minutes au four chaud jusqu’à ce que la mozzarella file.', 'Kurz im heißen Ofen backen, bis der Mozzarella schmilzt.', '放入热烤箱烤几分钟，直到马苏里拉融化。', 'गरम ओवन में थोड़ी देर बेक करें जब तक मोज़ेरेला पिघल न जाए।'),
    ],
  },
  {
    id: 'gnocchiburro',
    pasta: 'gnocchi',
    name: 'Gnocchi burro e salvia',
    need: ['butter', 'sage'],
    may: ['parmigiano'],
    steps: [
      L('Melt butter gently with sage leaves until fragrant.', 'Sciogli dolcemente il burro con le foglie di salvia finché profuma.', 'Derrite la mantequilla a fuego suave con hojas de salvia hasta que aromatice.', 'Faites fondre doucement le beurre avec les feuilles de sauge jusqu’à ce qu’il embaume.', 'Butter mit Salbeiblättern sanft schmelzen, bis sie duftet.', '用小火将黄油与鼠尾草叶一起融化至出香。', 'मक्खन को सेज की पत्तियों के साथ धीरे-धीरे पिघलाएँ जब तक खुशबू न आए।'),
      L('Boil the gnocchi until they float.', 'Lessa gli gnocchi finché vengono a galla.', 'Hierve los ñoquis hasta que floten.', 'Faites cuire les gnocchis jusqu’à ce qu’ils remontent.', 'Gnocchi kochen, bis sie oben schwimmen.', '团子煮至浮起。', 'न्योकी को तैरने तक उबालें।'),
      L('Toss them in the butter; add grated Parmigiano Reggiano if you like.', 'Saltali nel burro; se vuoi, aggiungi Parmigiano Reggiano grattugiato.', 'Saltéalos en la mantequilla; si quieres, añade Parmigiano Reggiano rallado.', 'Faites-les sauter dans le beurre ; ajoutez du Parmigiano Reggiano râpé si vous le souhaitez.', 'In der Butter schwenken; nach Wunsch geriebenen Parmigiano Reggiano dazugeben.', '放入黄油中翻拌，可按口味加帕玛森干酪。', 'उन्हें मक्खन में मिलाएँ; चाहें तो कद्दूकस पार्मिजानो रेज्जानो डालें।'),
    ],
  },
  {
    id: 'raviolibutter',
    pasta: 'ravioli',
    name: 'Ravioli burro e salvia',
    need: ['butter', 'sage'],
    may: ['parmigiano'],
    steps: [
      L('Melt butter gently with sage leaves until fragrant.', 'Sciogli dolcemente il burro con le foglie di salvia finché profuma.', 'Derrite la mantequilla a fuego suave con hojas de salvia hasta que aromatice.', 'Faites fondre doucement le beurre avec les feuilles de sauge jusqu’à ce qu’il embaume.', 'Butter mit Salbeiblättern sanft schmelzen, bis sie duftet.', '用小火将黄油与鼠尾草叶一起融化至出香。', 'मक्खन को सेज की पत्तियों के साथ धीरे-धीरे पिघलाएँ जब तक खुशबू न आए।'),
      L('Cook the ravioli gently for 3–4 minutes, without a rolling boil.', 'Cuoci i ravioli delicatamente per 3–4 minuti, senza un bollore forte.', 'Cuece los ravioli con suavidad 3–4 minutos, sin un hervor fuerte.', 'Faites cuire les raviolis doucement 3 à 4 minutes, sans gros bouillon.', 'Ravioli 3–4 Minuten sanft garen, ohne starkes Sprudeln.', '轻柔地煮方饺 3–4 分钟，不要大火翻滚。', 'रैवियोली को 3–4 मिनट धीमी उबाल पर पकाएँ।'),
      L('Toss carefully in the butter and finish with grated Parmigiano Reggiano.', 'Saltali con delicatezza nel burro e completa con Parmigiano Reggiano grattugiato.', 'Saltéalos con cuidado en la mantequilla y termina con Parmigiano Reggiano rallado.', 'Enrobez-les délicatement de beurre et terminez avec du Parmigiano Reggiano râpé.', 'Vorsichtig in der Butter schwenken und mit geriebenem Parmigiano Reggiano vollenden.', '小心地在黄油中翻拌，撒上帕玛森干酪。', 'सावधानी से मक्खन में मिलाएँ और कद्दूकस पार्मिजानो रेज्जानो से पूरा करें।'),
    ],
  },
];

/**
 * What a selection makes.
 *   { kind: 'traditional', recipe }    – exactly a traditional dish
 *   { kind: 'variation', recipe }      – a traditional dish plus other ingredients
 *   { kind: 'variation', recipe: null } – a creative combination
 *   null                               – nothing chosen yet
 */
export function matchRecipe(pasta, ingredients) {
  if (!pasta || !ingredients?.length) return null;
  const chosen = new Set(ingredients);
  const own = RECIPES.filter((r) => r.pasta === pasta);
  const exact = own
    .filter((r) => r.need.every((i) => chosen.has(i)) && [...chosen].every((i) => r.need.includes(i) || r.may.includes(i)))
    .sort((a, b) => b.need.length - a.need.length)[0];
  if (exact) return { kind: 'traditional', recipe: exact };
  const base = own.filter((r) => r.need.every((i) => chosen.has(i))).sort((a, b) => b.need.length - a.need.length)[0];
  return { kind: 'variation', recipe: base || null };
}

/**
 * The traditional recipe closest to a selection, to learn from a couple of
 * choices: same pasta first, then the most ingredients in common, then the
 * simplest. With no ingredients yet it lists the recipes of that pasta.
 * Returns { recipe, missing: [...ingredient ids], samePasta } or null.
 */
export function suggestRecipe(pasta, ingredients = []) {
  const chosen = new Set(ingredients);
  const scored = RECIPES.map((r) => {
    const all = [...r.need, ...r.may];
    const common = all.filter((i) => chosen.has(i)).length;
    return { r, common, same: r.pasta === pasta };
  })
    .filter((x) => (chosen.size ? x.common > 0 : x.same))
    .sort((a, b) => Number(b.same) - Number(a.same) || b.common - a.common || a.r.need.length - b.r.need.length);
  const best = scored[0];
  if (!best) return null;
  return { recipe: best.r, missing: best.r.need.filter((i) => !chosen.has(i)), samePasta: best.same };
}

/** Recipes made with a given pasta (all of them when that pasta has none). */
export const recipesFor = (pasta) => {
  const own = RECIPES.filter((r) => r.pasta === pasta);
  return own.length ? own : RECIPES;
};
