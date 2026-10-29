// Recipe builder of the free events: pick a pasta, add ingredients, find the
// traditional Italian dish they make. Only well-established recipes are listed;
// any other combination is shown as a creative variation, never as tradition.
// Dish names stay in Italian (they are the dishes' own names).
// every pasta in its natural colour (scripts/render-recipe-pasta.py)
const IMG = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/recipe-pasta/*.webp', { eager: true, import: 'default' })).map(([k, v]) => [k.split('/').pop().replace('.webp', ''), v]),
);

const L = (en, it, es, fr, de, zh, hi) => ({ en, it, es, fr, de, zh, hi });

export const RECIPE_PASTAS = [
  { id: 'spaghetti', name: L('Spaghetti', 'Spaghetti', 'Espaguetis', 'Spaghetti', 'Spaghetti', '意大利面', 'स्पेगेटी') },
  { id: 'bucatini', name: L('Bucatini', 'Bucatini', 'Bucatini', 'Bucatini', 'Bucatini', '空心粗面', 'बुकाटिनी') },
  { id: 'tagliatelle', name: L('Tagliatelle', 'Tagliatelle', 'Tagliatelle', 'Tagliatelles', 'Tagliatelle', '宽面', 'टैग्लियाटेले') },
  { id: 'penne', name: L('Penne', 'Penne', 'Penne', 'Penne', 'Penne', '斜管面', 'पेन्ने') },
  { id: 'maccheroni', name: L('Macaroni', 'Maccheroni', 'Macarrones', 'Macaronis', 'Makkaroni', '通心粉', 'मैकरोनी') },
  { id: 'rigatoni', name: L('Rigatoni', 'Rigatoni', 'Rigatoni', 'Rigatoni', 'Rigatoni', '粗纹通心粉', 'रिगाटोनी') },
  { id: 'fusilli', name: L('Fusilli', 'Fusilli', 'Fusilli', 'Fusilli', 'Fusilli', '螺旋面', 'फ़्यूज़िली') },
  { id: 'trofie', name: L('Trofie', 'Trofie', 'Trofie', 'Trofie', 'Trofie', '特罗菲面', 'ट्रोफ़ी') },
  { id: 'orecchiette', name: L('Orecchiette', 'Orecchiette', 'Orecchiette', 'Orecchiette', 'Orecchiette', '猫耳朵面', 'ओरेक्कियेत्ते') },
  { id: 'farfalle', name: L('Farfalle', 'Farfalle', 'Farfalle', 'Farfalle', 'Farfalle', '蝴蝶面', 'फ़ार्फ़ाले') },
  { id: 'reginette', name: L('Reginette', 'Reginette', 'Reginette', 'Reginette', 'Reginette', '花边面', 'रेजिनेट') },
  { id: 'cavatappi', name: L('Cavatappi', 'Cavatappi', 'Cavatappi', 'Cavatappi', 'Cavatappi', '螺旋通心粉', 'कावाटाप्पी') },
  { id: 'conchiglie', name: L('Conchiglie', 'Conchiglie', 'Conchiglie', 'Conchiglie', 'Conchiglie', '贝壳面', 'कोंकिल्ये') },
  { id: 'anelli', name: L('Anelli', 'Anelli', 'Anelli', 'Anelli', 'Anelli', '圈圈面', 'अनेली') },
  { id: 'lasagne', name: L('Lasagne', 'Lasagne', 'Lasaña', 'Lasagnes', 'Lasagne', '千层面', 'लज़ानिया') },
  { id: 'tortellini', name: L('Tortellini', 'Tortellini', 'Tortellini', 'Tortellini', 'Tortellini', '意式小馄饨', 'टॉर्टेलिनी') },
  { id: 'gnocchi', name: L('Gnocchi', 'Gnocchi', 'Ñoquis', 'Gnocchis', 'Gnocchi', '团子', 'न्योकी') },
  { id: 'ravioli', name: L('Ricotta ravioli', 'Ravioli di ricotta', 'Ravioli de ricotta', 'Raviolis à la ricotta', 'Ricotta-Ravioli', '乳清干酪方饺', 'रिकोटा रैवियोली') },
].map((p) => ({ ...p, img: IMG[p.id] }));

// ingredients as colours, like the colour pickers of the configurators
export const INGREDIENTS = [
  { id: 'tomato', hex: '#e1201b', name: L('Tomato', 'Pomodoro', 'Tomate', 'Tomate', 'Tomate', '番茄', 'टमाटर') },
  { id: 'basil', hex: '#1a5632', name: L('Basil', 'Basilico', 'Albahaca', 'Basilic', 'Basilikum', '罗勒', 'तुलसी') },
  { id: 'guanciale', hex: '#e7b3a1', name: L('Guanciale', 'Guanciale', 'Guanciale', 'Guanciale', 'Guanciale', '猪脸肉', 'ग्वान्चाले') , note: L('cured pork cheek', 'guancia di maiale stagionata', 'carrillera de cerdo curada', 'joue de porc séchée', 'luftgetrocknete Schweinebacke', '风干猪脸颊肉', 'सुखाया हुआ सूअर का गाल') },
  { id: 'egg', hex: '#ffb548', name: L('Egg yolk', 'Tuorlo d’uovo', 'Yema de huevo', 'Jaune d’œuf', 'Eigelb', '蛋黄', 'अंडे की ज़र्दी') },
  { id: 'pecorino', hex: '#eee2c0', name: L('Pecorino Romano', 'Pecorino Romano', 'Pecorino Romano', 'Pecorino Romano', 'Pecorino Romano', '罗马羊奶酪', 'पेकोरिनो रोमानो') , note: L('Italian sheep’s milk cheese', 'formaggio di latte di pecora', 'queso italiano de leche de oveja', 'fromage italien au lait de brebis', 'italienischer Schafskäse', '意大利羊奶酪', 'भेड़ के दूध से बना इतालवी चीज़') },
  { id: 'pepper', hex: '#3b3733', name: L('Black pepper', 'Pepe nero', 'Pimienta negra', 'Poivre noir', 'Schwarzer Pfeffer', '黑胡椒', 'काली मिर्च') },
  { id: 'ragu', hex: '#6a3933', name: L('Ragù', 'Ragù', 'Ragú', 'Ragù', 'Ragù', '肉酱', 'रागू') , note: L('slow-cooked meat sauce', 'sugo di carne a lunga cottura', 'salsa de carne de cocción lenta', 'sauce à la viande mijotée', 'langsam geschmorte Fleischsauce', '慢炖肉酱', 'धीमी आँच पर पका मीट सॉस') },
  { id: 'parmigiano', hex: '#f1d48a', name: L('Parmigiano Reggiano', 'Parmigiano Reggiano', 'Parmigiano Reggiano', 'Parmigiano Reggiano', 'Parmigiano Reggiano', '帕玛森干酪', 'पार्मिजानो रेज्जानो') , note: L('aged Italian cow’s milk cheese', 'formaggio stagionato di latte vaccino', 'queso italiano curado de leche de vaca', 'fromage italien affiné au lait de vache', 'gereifter italienischer Kuhmilchkäse', '陈年意大利牛奶奶酪', 'पुराना इतालवी गाय के दूध का चीज़') },
  { id: 'mozzarella', hex: '#faf8f0', name: L('Mozzarella', 'Mozzarella', 'Mozzarella', 'Mozzarella', 'Mozzarella', '马苏里拉', 'मोज़ेरेला') , note: L('fresh stretched-curd cheese', 'formaggio fresco a pasta filata', 'queso fresco de pasta hilada', 'fromage frais à pâte filée', 'frischer Filata-Käse', '新鲜拉丝奶酪', 'ताज़ा मुलायम चीज़') },
  { id: 'butter', hex: '#f7df8e', name: L('Butter', 'Burro', 'Mantequilla', 'Beurre', 'Butter', '黄油', 'मक्खन') },
  { id: 'sage', hex: '#8ca383', name: L('Sage', 'Salvia', 'Salvia', 'Sauge', 'Salbei', '鼠尾草', 'सेज') },
  { id: 'garlic', hex: '#f3ece0', name: L('Garlic', 'Aglio', 'Ajo', 'Ail', 'Knoblauch', '大蒜', 'लहसुन') },
  { id: 'oliveoil', hex: '#b2a228', name: L('Extra virgin olive oil', 'Olio extravergine d’oliva', 'Aceite de oliva virgen extra', 'Huile d’olive vierge extra', 'Natives Olivenöl extra', '特级初榨橄榄油', 'एक्स्ट्रा वर्जिन जैतून का तेल') },
  { id: 'chilli', hex: '#c8161a', name: L('Chilli', 'Peperoncino', 'Guindilla', 'Piment', 'Chili', '辣椒', 'लाल मिर्च') },
  { id: 'parsley', hex: '#3f8a2f', name: L('Parsley', 'Prezzemolo', 'Perejil', 'Persil', 'Petersilie', '欧芹', 'अजमोद') },
  { id: 'clams', hex: '#ddd0bb', name: L('Clams', 'Vongole', 'Almejas', 'Palourdes', 'Venusmuscheln', '蛤蜊', 'क्लैम') },
  { id: 'anchovy', hex: '#8a4a38', name: L('Anchovies', 'Acciughe', 'Anchoas', 'Anchois', 'Sardellen', '凤尾鱼', 'एंचोवी') },
  { id: 'aubergine', hex: '#3b1f45', name: L('Aubergine', 'Melanzana', 'Berenjena', 'Aubergine', 'Aubergine', '茄子', 'बैंगन') },
  { id: 'cimedirapa', hex: '#2f6a2a', name: L('Turnip tops', 'Cime di rapa', 'Grelos', 'Brocoli-rave', 'Stängelkohl', '芜菁嫩叶', 'शलजम के पत्ते') , note: L('leafy greens with small buds, typical of Puglia', 'verdura a foglia con piccole cime, tipica della Puglia', 'verdura de hoja con pequeños brotes, típica de Apulia', 'légume-feuille à petits boutons, typique des Pouilles', 'Blattgemüse mit kleinen Knospen, typisch für Apulien', '带小花蕾的绿叶菜，普利亚特产', 'छोटी कलियों वाली पत्तेदार सब्ज़ी, पुलिया की ख़ास') },
  { id: 'ricottasalata', hex: '#f8f5ec', name: L('Ricotta salata', 'Ricotta salata', 'Ricotta salata', 'Ricotta salata', 'Ricotta salata', '咸里科塔', 'रिकोटा सलाटा') , note: L('pressed, salted and aged ricotta', 'ricotta pressata, salata e stagionata', 'ricotta prensada, salada y curada', 'ricotta pressée, salée et affinée', 'gepresster, gesalzener und gereifter Ricotta', '压制、加盐并熟成的里科塔奶酪', 'दबाकर, नमक लगाकर पकाई गई रिकोटा') },
  { id: 'breadcrumbs', hex: '#d29d4d', name: L('Toasted breadcrumbs', 'Pangrattato tostato', 'Pan rallado tostado', 'Chapelure grillée', 'Geröstete Semmelbrösel', '烤面包屑', 'भुने ब्रेडक्रम्ब्स') },
  { id: 'broth', hex: '#d9a548', name: L('Meat broth', 'Brodo di carne', 'Caldo de carne', 'Bouillon de viande', 'Fleischbrühe', '肉汤', 'मीट ब्रॉथ') },
  { id: 'bechamel', hex: '#f3ead6', name: L('Béchamel', 'Besciamella', 'Bechamel', 'Béchamel', 'Béchamel', '白酱', 'बेशमेल') , note: L('white sauce of milk, butter and flour', 'salsa di latte, burro e farina', 'salsa de leche, mantequilla y harina', 'sauce au lait, beurre et farine', 'Sauce aus Milch, Butter und Mehl', '牛奶、黄油和面粉做的白酱', 'दूध, मक्खन और आटे की सफ़ेद सॉस') },
  { id: 'pesto', hex: '#4f7d2a', name: L('Genoese pesto', 'Pesto alla genovese', 'Pesto genovés', 'Pesto génois', 'Pesto Genovese', '热那亚青酱', 'जेनोवा पेस्तो') , note: L('basil, pine nuts, garlic, cheese and olive oil', 'basilico, pinoli, aglio, formaggio e olio', 'albahaca, piñones, ajo, queso y aceite', 'basilic, pignons, ail, fromage et huile d’olive', 'Basilikum, Pinienkerne, Knoblauch, Käse und Olivenöl', '罗勒、松子、大蒜、奶酪和橄榄油', 'तुलसी, चिलगोज़े, लहसुन, चीज़ और जैतून का तेल') },
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
    // the dish in each language (the Italian name above is the dish's own name)
    title: L("Spaghetti with tomato and basil", "Spaghetti al pomodoro e basilico", "Espaguetis con tomate y albahaca", "Spaghetti à la tomate et au basilic", "Spaghetti mit Tomate und Basilikum", "番茄罗勒意大利面", "टमाटर और तुलसी वाली स्पेगेटी"),
    need: ['tomato', 'basil'],
    may: ['parmigiano'],
    history: L('Pasta with tomato sauce became an everyday dish in southern Italy, especially around Naples, during the 1800s; basil and olive oil make it the simplest of the classics.', 'La pasta al pomodoro diventa un piatto quotidiano nel Sud Italia, soprattutto nell’area di Napoli, nel corso dell’Ottocento; basilico e olio ne fanno il più semplice dei classici.', 'La pasta con salsa de tomate se volvió un plato cotidiano en el sur de Italia, sobre todo en la zona de Nápoles, durante el siglo XIX; albahaca y aceite la convierten en el más sencillo de los clásicos.', 'Les pâtes à la sauce tomate deviennent un plat du quotidien dans le sud de l’Italie, surtout autour de Naples, au XIXe siècle ; basilic et huile d’olive en font le plus simple des classiques.', 'Pasta mit Tomatensauce wurde im 19. Jahrhundert in Süditalien, besonders rund um Neapel, zum Alltagsgericht; Basilikum und Olivenöl machen sie zum einfachsten Klassiker.', '番茄酱意面在 19 世纪成为意大利南部（尤其是那不勒斯一带）的家常菜；罗勒和橄榄油让它成为最简单的经典。', 'टमाटर सॉस वाला पास्ता 1800 के दशक में दक्षिणी इटली, ख़ासकर नेपल्स के आसपास, रोज़ का व्यंजन बना; तुलसी और जैतून का तेल इसे सबसे सरल क्लासिक बनाते हैं।'),
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
    // the dish in each language (the Italian name above is the dish's own name)
    title: L("Spaghetti with Pecorino and black pepper", "Spaghetti cacio e pepe", "Espaguetis con pecorino y pimienta negra", "Spaghetti au pecorino et au poivre noir", "Spaghetti mit Pecorino und schwarzem Pfeffer", "羊奶酪黑胡椒意大利面", "पेकोरिनो और काली मिर्च वाली स्पेगेटी"),
    need: ['pecorino', 'pepper'],
    may: [],
    history: L('A Roman classic. It is often linked to the shepherds of the Lazio countryside, whose pecorino and pepper kept well on long journeys, though that story is hard to document.', 'Un classico romano. Viene spesso legato ai pastori della campagna laziale, il cui pecorino e pepe si conservavano bene nei lunghi spostamenti, anche se è una storia difficile da documentare.', 'Un clásico romano. Se suele asociar a los pastores del campo del Lacio, cuyo pecorino y pimienta se conservaban bien en largos viajes, aunque es una historia difícil de documentar.', 'Un classique romain. On le relie souvent aux bergers de la campagne du Latium, dont le pecorino et le poivre se conservaient bien pendant les longs trajets, même si cette histoire est difficile à documenter.', 'Ein römischer Klassiker. Er wird oft mit den Hirten der Latium-Landschaft verbunden, deren Pecorino und Pfeffer sich auf langen Wegen gut hielten, eine Geschichte, die sich allerdings schwer belegen lässt.', '罗马经典菜。人们常把它与拉齐奥乡间的牧羊人联系在一起：羊奶酪和胡椒便于长途携带保存，不过这一说法难以考证。', 'रोम का एक क्लासिक। इसे अक्सर लाज़ियो के ग्रामीण इलाक़ों के चरवाहों से जोड़ा जाता है, जिनका पेकोरिनो और मिर्च लंबी यात्राओं में अच्छी तरह टिकते थे, हालाँकि इस कहानी के प्रमाण कम हैं।'),
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
    // the dish in each language (the Italian name above is the dish's own name)
    title: L("Spaghetti carbonara", "Spaghetti alla carbonara", "Espaguetis a la carbonara", "Spaghetti à la carbonara", "Spaghetti Carbonara", "卡邦尼意大利面", "स्पेगेटी कार्बोनारा"),
    need: ['guanciale', 'egg', 'pecorino', 'pepper'],
    may: [],
    history: L('A Roman dish whose origins are still debated: it first appears in print after the Second World War, and none of the many stories about its birth is certain.', 'Un piatto romano dalle origini ancora discusse: compare per la prima volta nei libri dopo la Seconda guerra mondiale e nessuna delle tante storie sulla sua nascita è certa.', 'Un plato romano de orígenes aún discutidos: aparece por primera vez en textos tras la Segunda Guerra Mundial y ninguna de las muchas historias sobre su nacimiento es segura.', 'Un plat romain aux origines encore débattues : il apparaît pour la première fois dans les livres après la Seconde Guerre mondiale, et aucune des nombreuses histoires sur sa naissance n’est certaine.', 'Ein römisches Gericht mit umstrittener Herkunft: Es taucht erst nach dem Zweiten Weltkrieg in gedruckten Quellen auf, und keine der vielen Entstehungsgeschichten ist gesichert.', '一道起源仍有争议的罗马菜：它在第二次世界大战后才首次见于文字记载，关于它诞生的种种说法都无定论。', 'रोम का एक व्यंजन जिसकी उत्पत्ति पर आज भी बहस है: यह पहली बार दूसरे विश्व युद्ध के बाद छपे स्रोतों में मिलता है, और इसके जन्म की कोई भी कहानी पक्की नहीं है।'),
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
    // the dish in each language (the Italian name above is the dish's own name)
    title: L("Spaghetti with guanciale, Pecorino and pepper", "Spaghetti alla gricia", "Espaguetis con guanciale, pecorino y pimienta", "Spaghetti au guanciale, pecorino et poivre", "Spaghetti mit Guanciale, Pecorino und Pfeffer", "猪脸肉羊奶酪胡椒意大利面", "ग्वान्चाले, पेकोरिनो और काली मिर्च वाली स्पेगेटी"),
    need: ['guanciale', 'pecorino', 'pepper'],
    may: [],
    history: L('From Lazio, often described as amatriciana without the tomato. Its name is commonly linked to Grisciano, a village near Amatrice.', 'Viene dal Lazio ed è spesso descritta come l’amatriciana senza pomodoro. Il nome è comunemente legato a Grisciano, un paese vicino ad Amatrice.', 'Procede del Lacio y suele describirse como la amatriciana sin tomate. Su nombre se asocia habitualmente a Grisciano, un pueblo cerca de Amatrice.', 'Originaire du Latium, elle est souvent décrite comme l’amatriciana sans tomate. Son nom est couramment rattaché à Grisciano, un village proche d’Amatrice.', 'Aus dem Latium, oft als Amatriciana ohne Tomate beschrieben. Der Name wird meist mit Grisciano verbunden, einem Dorf nahe Amatrice.', '来自拉齐奥，常被称为“不加番茄的阿玛特里切酱面”。名字通常被认为与阿马特里切附近的小村格里夏诺有关。', 'लाज़ियो से, जिसे अक्सर बिना टमाटर वाली अमात्रिचाना कहा जाता है। इसका नाम आमतौर पर अमात्रिचे के पास के गाँव ग्रिश्यानो से जोड़ा जाता है।'),
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
    // the dish in each language (the Italian name above is the dish's own name)
    title: L("Spaghetti with guanciale, tomato and Pecorino", "Spaghetti all’amatriciana", "Espaguetis a la amatriciana", "Spaghetti à l’amatriciana", "Spaghetti all’Amatriciana", "阿马特里切风味意大利面", "स्पेगेटी अमात्रिचाना"),
    need: ['guanciale', 'tomato', 'pecorino'],
    may: ['pepper'],
    history: L('Named after Amatrice, a mountain town in Lazio. The town’s own recipe uses guanciale, tomato and Pecorino, and calls for spaghetti.', 'Prende il nome da Amatrice, cittadina di montagna del Lazio. La ricetta della città usa guanciale, pomodoro e pecorino, e prevede gli spaghetti.', 'Debe su nombre a Amatrice, un pueblo de montaña del Lacio. La receta local usa guanciale, tomate y pecorino, y lleva espaguetis.', 'Elle tient son nom d’Amatrice, petite ville de montagne du Latium. La recette de la ville utilise guanciale, tomate et pecorino, avec des spaghetti.', 'Benannt nach Amatrice, einem Bergstädtchen im Latium. Das Rezept des Ortes verwendet Guanciale, Tomate und Pecorino und sieht Spaghetti vor.', '得名于拉齐奥山城阿马特里切。当地食谱使用猪脸肉、番茄和羊奶酪，并搭配意大利面条。', 'इसका नाम लाज़ियो के पहाड़ी कस्बे अमात्रिचे से आया है। कस्बे की अपनी रेसिपी में ग्वान्चाले, टमाटर और पेकोरिनो होते हैं और स्पेगेटी इस्तेमाल होती है।'),
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
    // the dish in each language (the Italian name above is the dish's own name)
    title: L("Tagliatelle with Bolognese ragù", "Tagliatelle al ragù", "Tagliatelle con ragú boloñés", "Tagliatelles au ragù bolognais", "Tagliatelle mit Bologneser Ragù", "博洛尼亚肉酱宽面", "बोलोनीज़ रागू वाली टैग्लियाटेले"),
    need: ['ragu'],
    may: ['parmigiano'],
    history: L('The pride of Bologna, where ragù is served with fresh egg tagliatelle, not spaghetti. In 1982 the Accademia Italiana della Cucina registered a reference recipe with the city’s Chamber of Commerce.', 'Il vanto di Bologna, dove il ragù si serve con le tagliatelle fresche all’uovo, non con gli spaghetti. Nel 1982 l’Accademia Italiana della Cucina ha depositato una ricetta di riferimento alla Camera di Commercio della città.', 'El orgullo de Bolonia, donde el ragú se sirve con tagliatelle frescas al huevo, no con espaguetis. En 1982 la Accademia Italiana della Cucina registró una receta de referencia en la Cámara de Comercio de la ciudad.', 'La fierté de Bologne, où le ragù se sert avec des tagliatelles fraîches aux œufs, pas avec des spaghetti. En 1982, l’Accademia Italiana della Cucina a déposé une recette de référence à la Chambre de commerce de la ville.', 'Der Stolz Bolognas, wo Ragù mit frischen Eier-Tagliatelle serviert wird, nicht mit Spaghetti. 1982 hinterlegte die Accademia Italiana della Cucina ein Referenzrezept bei der Handelskammer der Stadt.', '博洛尼亚的骄傲：当地肉酱配新鲜鸡蛋宽面，而不是意大利面条。1982 年，意大利烹饪学会在该市商会登记了一份参考食谱。', 'बोलोन्या की शान, जहाँ रागू ताज़ा अंडे वाली टैग्लियाटेले के साथ परोसा जाता है, स्पेगेटी के साथ नहीं। 1982 में Accademia Italiana della Cucina ने शहर के चैंबर ऑफ़ कॉमर्स में एक मानक रेसिपी दर्ज की।'),
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
    // the dish in each language (the Italian name above is the dish's own name)
    title: L("Baked gnocchi with tomato and mozzarella, Sorrento style", "Gnocchi alla sorrentina", "Ñoquis al horno con tomate y mozzarella, al estilo de Sorrento", "Gnocchis gratinés tomate et mozzarella, façon Sorrente", "Überbackene Gnocchi mit Tomate und Mozzarella nach Sorrentiner Art", "索伦托风味番茄马苏里拉焗团子", "सोरेंतो शैली में टमाटर और मोज़ेरेला वाले बेक्ड न्योकी"),
    need: ['tomato', 'mozzarella', 'basil'],
    may: ['parmigiano'],
    history: L('Named after Sorrento, on the Campanian coast: potato gnocchi baked with tomato, mozzarella and basil, the colours and flavours of the Bay of Naples.', 'Prende il nome da Sorrento, sulla costa campana: gnocchi di patate passati in forno con pomodoro, mozzarella e basilico, i colori e i sapori del golfo di Napoli.', 'Debe su nombre a Sorrento, en la costa de Campania: ñoquis de patata al horno con tomate, mozzarella y albahaca, los colores y sabores del golfo de Nápoles.', 'Elle tient son nom de Sorrente, sur la côte campanienne : des gnocchis de pommes de terre gratinés avec tomate, mozzarella et basilic, les couleurs et saveurs du golfe de Naples.', 'Benannt nach Sorrent an der Küste Kampaniens: Kartoffel-Gnocchi, mit Tomate, Mozzarella und Basilikum überbacken, Farben und Aromen des Golfs von Neapel.', '得名于坎帕尼亚海岸的索伦托：土豆团子配番茄、马苏里拉和罗勒烤制，呈现那不勒斯湾的色彩与风味。', 'इसका नाम कैम्पानिया तट के सोरेंतो से आया है: टमाटर, मोज़ेरेला और तुलसी के साथ बेक किए आलू के न्योकी, नेपल्स की खाड़ी के रंग और स्वाद।'),
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
    // the dish in each language (the Italian name above is the dish's own name)
    title: L("Gnocchi with butter and sage", "Gnocchi burro e salvia", "Ñoquis con mantequilla y salvia", "Gnocchis au beurre et à la sauge", "Gnocchi mit Butter und Salbei", "黄油鼠尾草团子", "मक्खन और सेज वाले न्योकी"),
    need: ['butter', 'sage'],
    may: ['parmigiano'],
    history: L('Butter and sage is a typical dressing of northern Italy, where butter traditionally replaced olive oil in cooking; it is a common way to serve potato gnocchi there.', 'Burro e salvia è un condimento tipico del Nord Italia, dove tradizionalmente il burro sostituiva l’olio in cucina; è un modo diffuso di servire gli gnocchi di patate.', 'Mantequilla y salvia es un aliño típico del norte de Italia, donde tradicionalmente la mantequilla sustituía al aceite en la cocina; es una forma habitual de servir los ñoquis de patata.', 'Beurre et sauge est un assaisonnement typique du nord de l’Italie, où le beurre remplaçait traditionnellement l’huile en cuisine ; c’est une façon courante d’y servir les gnocchis de pommes de terre.', 'Butter und Salbei ist ein typisches Dressing Norditaliens, wo traditionell Butter statt Olivenöl zum Kochen diente; so werden Kartoffel-Gnocchi dort oft serviert.', '黄油鼠尾草是意大利北部的典型调味：那里传统上用黄油代替橄榄油做菜，也常这样搭配土豆团子。', 'मक्खन और सेज उत्तरी इटली का एक आम ड्रेसिंग है, जहाँ परंपरागत रूप से खाना पकाने में जैतून के तेल की जगह मक्खन इस्तेमाल होता था; वहाँ आलू न्योकी ऐसे ही परोसे जाते हैं।'),
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
    // the dish in each language (the Italian name above is the dish's own name)
    title: L("Ricotta ravioli with butter and sage", "Ravioli burro e salvia", "Ravioli de ricotta con mantequilla y salvia", "Raviolis à la ricotta, beurre et sauge", "Ricotta-Ravioli mit Butter und Salbei", "黄油鼠尾草乳清干酪方饺", "मक्खन और सेज वाली रिकोटा रैवियोली"),
    need: ['butter', 'sage'],
    may: ['parmigiano'],
    history: L('The classic way to dress ricotta-filled ravioli in many parts of northern and central Italy: a light sauce that lets the filling speak.', 'Il modo classico di condire i ravioli di ricotta in molte zone del Nord e del Centro Italia: un condimento leggero che lascia parlare il ripieno.', 'La forma clásica de aliñar los ravioli de ricotta en muchas zonas del norte y el centro de Italia: una salsa ligera que deja hablar al relleno.', 'La façon classique d’assaisonner les raviolis à la ricotta dans de nombreuses régions du nord et du centre de l’Italie : une sauce légère qui laisse parler la farce.', 'Die klassische Art, Ricotta-Ravioli in vielen Gegenden Nord- und Mittelitaliens anzumachen: eine leichte Sauce, die der Füllung den Vortritt lässt.', '在意大利北部和中部许多地区，这是搭配乳清干酪方饺的经典做法：清淡的酱汁让馅料成为主角。', 'उत्तरी और मध्य इटली के कई हिस्सों में रिकोटा रैवियोली को परोसने का क्लासिक तरीका: हल्की सॉस जो भरावन का स्वाद उभरने देती है।'),
    steps: [
      L('Melt butter gently with sage leaves until fragrant.', 'Sciogli dolcemente il burro con le foglie di salvia finché profuma.', 'Derrite la mantequilla a fuego suave con hojas de salvia hasta que aromatice.', 'Faites fondre doucement le beurre avec les feuilles de sauge jusqu’à ce qu’il embaume.', 'Butter mit Salbeiblättern sanft schmelzen, bis sie duftet.', '用小火将黄油与鼠尾草叶一起融化至出香。', 'मक्खन को सेज की पत्तियों के साथ धीरे-धीरे पिघलाएँ जब तक खुशबू न आए।'),
      L('Cook the ravioli gently for 3–4 minutes, without a rolling boil.', 'Cuoci i ravioli delicatamente per 3–4 minuti, senza un bollore forte.', 'Cuece los ravioli con suavidad 3–4 minutos, sin un hervor fuerte.', 'Faites cuire les raviolis doucement 3 à 4 minutes, sans gros bouillon.', 'Ravioli 3–4 Minuten sanft garen, ohne starkes Sprudeln.', '轻柔地煮方饺 3–4 分钟，不要大火翻滚。', 'रैवियोली को 3–4 मिनट धीमी उबाल पर पकाएँ।'),
      L('Toss carefully in the butter and finish with grated Parmigiano Reggiano.', 'Saltali con delicatezza nel burro e completa con Parmigiano Reggiano grattugiato.', 'Saltéalos con cuidado en la mantequilla y termina con Parmigiano Reggiano rallado.', 'Enrobez-les délicatement de beurre et terminez avec du Parmigiano Reggiano râpé.', 'Vorsichtig in der Butter schwenken und mit geriebenem Parmigiano Reggiano vollenden.', '小心地在黄油中翻拌，撒上帕玛森干酪。', 'सावधानी से मक्खन में मिलाएँ और कद्दूकस पार्मिजानो रेज्जानो से पूरा करें।'),
    ],
  },
  {
    id: 'aglioolio',
    pasta: 'spaghetti',
    name: 'Spaghetti aglio, olio e peperoncino',
    title: L('Spaghetti with garlic, olive oil and chilli', 'Spaghetti aglio, olio e peperoncino', 'Espaguetis con ajo, aceite y guindilla', 'Spaghetti à l’ail, à l’huile et au piment', 'Spaghetti mit Knoblauch, Öl und Chili', '蒜香橄榄油辣椒意大利面', 'लहसुन, जैतून के तेल और मिर्च वाली स्पेगेटी'),
    need: ['garlic', 'oliveoil', 'chilli'],
    may: ['parsley'],
    history: L('A Neapolitan dish of cucina povera, made with what every larder holds. In Italy it is the classic “spaghettata di mezzanotte”, cooked late at night among friends.', 'Un piatto napoletano della cucina povera, fatto con quello che c’è in ogni dispensa. In Italia è la classica “spaghettata di mezzanotte”, cucinata a tarda sera tra amici.', 'Un plato napolitano de la cocina pobre, hecho con lo que hay en cualquier despensa. En Italia es la clásica “spaghettata di mezzanotte”, que se cocina de madrugada entre amigos.', 'Un plat napolitain de la cucina povera, fait avec ce que contient chaque garde-manger. En Italie, c’est la fameuse « spaghettata di mezzanotte », préparée tard le soir entre amis.', 'Ein neapolitanisches Gericht der Cucina povera, gemacht aus dem, was jede Vorratskammer hergibt. In Italien ist es die klassische „Spaghettata di mezzanotte“, spät nachts unter Freunden gekocht.', '一道那不勒斯的“穷人料理”，用家家储藏室都有的食材做成。在意大利，它是经典的“午夜意面”，常在深夜和朋友一起煮。', 'नेपल्स की “कुचीना पोवेरा” का व्यंजन, जो हर रसोई में मौजूद चीज़ों से बनता है। इटली में यह मशहूर “आधी रात की स्पेगेटी” है, जो देर रात दोस्तों के साथ पकाई जाती है।'),
    steps: [
      L('Warm the olive oil gently with sliced garlic and chilli, without letting the garlic brown.', 'Scalda dolcemente l’olio con l’aglio a fettine e il peperoncino, senza far scurire l’aglio.', 'Calienta el aceite a fuego suave con el ajo laminado y la guindilla, sin que el ajo se dore demasiado.', 'Chauffez doucement l’huile avec l’ail émincé et le piment, sans laisser l’ail brunir.', 'Olivenöl mit Knoblauchscheiben und Chili sanft erwärmen, ohne dass der Knoblauch braun wird.', '用小火加热橄榄油、蒜片和辣椒，不要让大蒜变焦。', 'जैतून के तेल को कटे लहसुन और मिर्च के साथ धीमी आँच पर गरम करें, लहसुन को भूरा न होने दें।'),
      L('Cook the spaghetti al dente and keep some of the cooking water.', 'Cuoci gli spaghetti al dente e tieni da parte un po’ d’acqua di cottura.', 'Cuece los espaguetis al dente y guarda un poco del agua de cocción.', 'Faites cuire les spaghetti al dente et gardez un peu d’eau de cuisson.', 'Spaghetti al dente kochen und etwas Kochwasser aufheben.', '把意大利面煮至弹牙，留一些煮面水。', 'स्पेगेटी को अल डेंटे पकाएँ और थोड़ा पकाने का पानी बचा लें।'),
      L('Toss in the pan with a splash of pasta water and finish with chopped parsley, if you like.', 'Salta in padella con un goccio d’acqua di cottura e, se vuoi, completa con prezzemolo tritato.', 'Saltea en la sartén con un chorrito de agua de cocción y, si quieres, termina con perejil picado.', 'Faites sauter à la poêle avec un peu d’eau de cuisson et, si vous voulez, ajoutez du persil haché.', 'In der Pfanne mit etwas Nudelwasser schwenken und nach Belieben mit gehackter Petersilie vollenden.', '加少许煮面水在锅中翻拌，喜欢的话撒上欧芹碎。', 'थोड़े पास्ता पानी के साथ कड़ाही में मिलाएँ और चाहें तो कटा अजमोद डालें।'),
    ],
  },
  {
    id: 'vongole',
    pasta: 'spaghetti',
    name: 'Spaghetti alle vongole',
    title: L('Spaghetti with clams', 'Spaghetti alle vongole', 'Espaguetis con almejas', 'Spaghetti aux palourdes', 'Spaghetti mit Venusmuscheln', '蛤蜊意大利面', 'क्लैम वाली स्पेगेटी'),
    need: ['clams', 'garlic', 'oliveoil'],
    may: ['parsley', 'chilli'],
    history: L('From Naples and the Campania coast. In many Neapolitan homes it is served on Christmas Eve, when dinner is traditionally meat-free. Tradition keeps cheese off seafood pasta.', 'Viene da Napoli e dalla costa campana. In molte case napoletane si prepara la sera della Vigilia di Natale, quando per tradizione la cena è senza carne. La tradizione vuole niente formaggio sulla pasta di mare.', 'Viene de Nápoles y de la costa de Campania. En muchas casas napolitanas se sirve en Nochebuena, cuando la cena es tradicionalmente sin carne. La tradición no pone queso en la pasta con marisco.', 'Elle vient de Naples et de la côte de Campanie. Dans beaucoup de foyers napolitains, on la sert le soir du 24 décembre, quand le dîner est traditionnellement sans viande. La tradition exclut le fromage des pâtes aux fruits de mer.', 'Aus Neapel und von der Küste Kampaniens. In vielen neapolitanischen Familien kommt es an Heiligabend auf den Tisch, wenn das Abendessen traditionell fleischlos ist. Käse gehört nach der Tradition nicht auf Pasta mit Meeresfrüchten.', '来自那不勒斯和坎帕尼亚海岸。在许多那不勒斯家庭里，它是平安夜的菜，因为按传统那天晚餐不吃肉。按传统，海鲜意面不加奶酪。', 'नेपल्स और कैम्पानिया के तट से। कई नेपल्स परिवारों में इसे क्रिसमस की पूर्व संध्या पर बनाया जाता है, जब परंपरा के अनुसार रात का खाना बिना मांस का होता है। परंपरा में सीफ़ूड पास्ता पर चीज़ नहीं डाला जाता।'),
    steps: [
      L('Soak the clams in salted water, then open them in a covered pan with olive oil and garlic.', 'Fai spurgare le vongole in acqua salata, poi falle aprire in padella coperta con olio e aglio.', 'Deja las almejas en agua con sal y ábrelas en una sartén tapada con aceite y ajo.', 'Faites dégorger les palourdes dans de l’eau salée, puis ouvrez-les à couvert dans une poêle avec huile et ail.', 'Venusmuscheln in Salzwasser wässern und in einer abgedeckten Pfanne mit Olivenöl und Knoblauch öffnen.', '蛤蜊在盐水中吐沙，再和橄榄油、大蒜一起加盖焖到开口。', 'क्लैम को नमक वाले पानी में भिगोएँ, फिर ढकी कड़ाही में जैतून के तेल और लहसुन के साथ खुलने तक पकाएँ।'),
      L('Cook the spaghetti and finish them in the pan with the clam juices.', 'Cuoci gli spaghetti e finisci la cottura in padella con il sughetto delle vongole.', 'Cuece los espaguetis y termínalos en la sartén con el jugo de las almejas.', 'Faites cuire les spaghetti et finissez la cuisson dans la poêle avec le jus des palourdes.', 'Spaghetti kochen und in der Pfanne im Muschelsud fertig garen.', '煮意大利面，再放进锅里用蛤蜊汁收尾。', 'स्पेगेटी पकाएँ और क्लैम के रस के साथ कड़ाही में पकाना पूरा करें।'),
      L('Add chopped parsley, and a little chilli if you like.', 'Aggiungi prezzemolo tritato e, se vuoi, un po’ di peperoncino.', 'Añade perejil picado y, si quieres, un poco de guindilla.', 'Ajoutez du persil haché et, si vous voulez, un peu de piment.', 'Gehackte Petersilie und nach Belieben etwas Chili zugeben.', '撒上欧芹碎，喜欢的话加一点辣椒。', 'कटा अजमोद डालें और चाहें तो थोड़ी मिर्च।'),
    ],
  },
  {
    id: 'arrabbiata',
    pasta: 'penne',
    name: 'Penne all’arrabbiata',
    title: L('Penne arrabbiata (spicy tomato sauce)', 'Penne all’arrabbiata', 'Penne all’arrabbiata (tomate picante)', 'Penne all’arrabbiata (sauce tomate pimentée)', 'Penne all’arrabbiata (scharfe Tomatensauce)', '辣味番茄斜管面', 'पेन्ने अराबियाता (तीखी टमाटर सॉस)'),
    need: ['tomato', 'garlic', 'chilli'],
    may: ['oliveoil', 'parsley'],
    history: L('A dish from Rome and Lazio. “Arrabbiata” means “angry”: the name refers to the heat of the chilli.', 'Un piatto di Roma e del Lazio. “Arrabbiata” si riferisce al calore del peperoncino, che fa “arrabbiare” chi la mangia.', 'Un plato de Roma y del Lacio. “Arrabbiata” significa “enfadada”: el nombre se refiere al picante de la guindilla.', 'Un plat de Rome et du Latium. « Arrabbiata » signifie « en colère » : le nom évoque le piquant du piment.', 'Ein Gericht aus Rom und Latium. „Arrabbiata“ heißt „wütend“: Der Name spielt auf die Schärfe des Chilis an.', '来自罗马和拉齐奥。“Arrabbiata”意为“生气的”，指辣椒的辣劲。', 'रोम और लात्सियो का व्यंजन। “अराबियाता” का मतलब है “गुस्से में”: यह नाम मिर्च के तीखेपन से आया है।'),
    steps: [
      L('Fry garlic and dried chilli in olive oil, add the tomatoes and simmer for about 15 minutes.', 'Soffriggi aglio e peperoncino secco nell’olio, aggiungi il pomodoro e cuoci per circa 15 minuti.', 'Sofríe ajo y guindilla seca en aceite, añade el tomate y cuece unos 15 minutos.', 'Faites revenir l’ail et le piment séché dans l’huile, ajoutez la tomate et laissez mijoter environ 15 minutes.', 'Knoblauch und getrockneten Chili in Olivenöl anbraten, Tomaten zugeben und etwa 15 Minuten köcheln.', '用橄榄油炒香大蒜和干辣椒，加入番茄，小火煮约 15 分钟。', 'जैतून के तेल में लहसुन और सूखी मिर्च भूनें, टमाटर डालें और लगभग 15 मिनट पकाएँ।'),
      L('Cook the penne al dente.', 'Cuoci le penne al dente.', 'Cuece los penne al dente.', 'Faites cuire les penne al dente.', 'Penne al dente kochen.', '把斜管面煮至弹牙。', 'पेन्ने को अल डेंटे पकाएँ।'),
      L('Toss with the sauce and finish with chopped parsley.', 'Salta con il sugo e completa con prezzemolo tritato.', 'Saltea con la salsa y termina con perejil picado.', 'Mélangez à la sauce et terminez avec du persil haché.', 'Mit der Sauce schwenken und mit gehackter Petersilie vollenden.', '与酱汁拌匀，撒上欧芹碎。', 'सॉस में मिलाएँ और कटे अजमोद से पूरा करें।'),
    ],
  },
  {
    id: 'norma',
    pasta: 'maccheroni',
    name: 'Maccheroni alla Norma',
    title: L('Macaroni with aubergine, tomato and ricotta salata', 'Maccheroni alla Norma', 'Macarrones con berenjena, tomate y ricotta salata', 'Macaronis à l’aubergine, tomate et ricotta salata', 'Makkaroni mit Aubergine, Tomate und Ricotta salata', '茄子番茄咸里科塔通心粉', 'बैंगन, टमाटर और रिकोटा सलाटा वाली मैकरोनी'),
    need: ['tomato', 'aubergine', 'ricottasalata', 'basil'],
    may: ['garlic', 'oliveoil'],
    history: L('From Catania, in Sicily. It takes its name from Norma, the opera by the Catanian composer Vincenzo Bellini; a popular story credits the writer Nino Martoglio with comparing the dish to that masterpiece.', 'Viene da Catania. Prende il nome dalla Norma, l’opera del compositore catanese Vincenzo Bellini; un racconto popolare attribuisce allo scrittore Nino Martoglio il paragone tra il piatto e quel capolavoro.', 'Viene de Catania, en Sicilia. Toma su nombre de Norma, la ópera del compositor catanés Vincenzo Bellini; una historia popular atribuye al escritor Nino Martoglio la comparación del plato con esa obra maestra.', 'Elle vient de Catane, en Sicile. Son nom vient de Norma, l’opéra du compositeur catanais Vincenzo Bellini ; une histoire populaire attribue à l’écrivain Nino Martoglio la comparaison entre le plat et ce chef-d’œuvre.', 'Aus Catania auf Sizilien. Benannt nach Norma, der Oper des aus Catania stammenden Komponisten Vincenzo Bellini; eine beliebte Geschichte schreibt dem Schriftsteller Nino Martoglio den Vergleich des Gerichts mit diesem Meisterwerk zu.', '来自西西里岛的卡塔尼亚。名字来自卡塔尼亚作曲家贝利尼的歌剧《诺尔玛》；民间传说是作家尼诺·马尔托利奥把这道菜比作那部杰作。', 'सिसिली के कातानिया से। इसका नाम कातानिया के संगीतकार विन्चेंज़ो बेलिनी के ओपेरा “नॉर्मा” से आया है; एक लोकप्रिय कहानी के अनुसार लेखक नीनो मार्तोलियो ने इस व्यंजन की तुलना उस उत्कृष्ट कृति से की थी।'),
    steps: [
      L('Fry cubes of aubergine in olive oil until golden.', 'Friggi la melanzana a cubetti nell’olio finché è dorata.', 'Fríe la berenjena en dados con aceite hasta que se dore.', 'Faites frire l’aubergine en dés dans l’huile jusqu’à ce qu’elle dore.', 'Auberginenwürfel in Olivenöl goldbraun braten.', '将茄子切丁，用橄榄油炸至金黄。', 'बैंगन के टुकड़ों को जैतून के तेल में सुनहरा होने तक तलें।'),
      L('Make a simple tomato sauce with garlic and basil, and cook the pasta al dente.', 'Prepara un semplice sugo di pomodoro con aglio e basilico e cuoci la pasta al dente.', 'Prepara una salsa de tomate sencilla con ajo y albahaca y cuece la pasta al dente.', 'Préparez une simple sauce tomate à l’ail et au basilic, et faites cuire les pâtes al dente.', 'Eine einfache Tomatensauce mit Knoblauch und Basilikum kochen und die Pasta al dente garen.', '用大蒜和罗勒做简单的番茄酱，把面煮至弹牙。', 'लहसुन और तुलसी के साथ सादी टमाटर सॉस बनाएँ और पास्ता को अल डेंटे पकाएँ।'),
      L('Toss with the sauce, top with the aubergine, grated ricotta salata and fresh basil.', 'Condisci con il sugo, aggiungi le melanzane, ricotta salata grattugiata e basilico fresco.', 'Mezcla con la salsa y cubre con la berenjena, ricotta salata rallada y albahaca fresca.', 'Mélangez à la sauce, ajoutez l’aubergine, de la ricotta salata râpée et du basilic frais.', 'Mit der Sauce mischen, mit Aubergine, geriebenem Ricotta salata und frischem Basilikum belegen.', '与酱汁拌匀，铺上茄子、刨碎的咸里科塔和新鲜罗勒。', 'सॉस में मिलाएँ, ऊपर बैंगन, कसी हुई रिकोटा सलाटा और ताज़ी तुलसी डालें।'),
    ],
  },
  {
    id: 'cimedirapa',
    pasta: 'orecchiette',
    name: 'Orecchiette alle cime di rapa',
    title: L('Orecchiette with turnip tops', 'Orecchiette alle cime di rapa', 'Orecchiette con grelos', 'Orecchiette aux brocolis-raves', 'Orecchiette mit Stängelkohl', '芜菁嫩叶猫耳朵面', 'शलजम के पत्तों वाली ओरेक्कियेत्ते'),
    need: ['cimedirapa', 'garlic', 'oliveoil'],
    may: ['chilli', 'anchovy', 'breadcrumbs'],
    history: L('The best-known dish of Puglia. In the old town of Bari, women still make orecchiette by hand in the street, dragging each one over a wooden board with a knife.', 'Il piatto più famoso della Puglia. Nella città vecchia di Bari le donne fanno ancora le orecchiette a mano per strada, trascinandole una a una con il coltello su una tavola di legno.', 'El plato más conocido de Apulia. En el casco antiguo de Bari, las mujeres aún hacen orecchiette a mano en la calle, arrastrando cada una con un cuchillo sobre una tabla de madera.', 'Le plat le plus connu des Pouilles. Dans la vieille ville de Bari, des femmes font encore les orecchiette à la main dans la rue, en traînant chacune au couteau sur une planche en bois.', 'Das bekannteste Gericht Apuliens. In der Altstadt von Bari formen Frauen Orecchiette noch heute auf der Straße von Hand, jede einzeln mit dem Messer über ein Holzbrett gezogen.', '普利亚最有名的菜。在巴里老城，妇女们至今仍在街边手工制作猫耳朵面，用小刀在木板上一个个拖出形状。', 'पुलिया का सबसे मशहूर व्यंजन। बारी के पुराने शहर में महिलाएँ आज भी गली में हाथ से ओरेक्कियेत्ते बनाती हैं, हर एक को चाकू से लकड़ी के तख़्ते पर खींचकर।'),
    steps: [
      L('Cook the turnip tops and the orecchiette together in the same salted water.', 'Cuoci insieme cime di rapa e orecchiette nella stessa acqua salata.', 'Cuece los grelos y las orecchiette juntos en la misma agua con sal.', 'Faites cuire ensemble les brocolis-raves et les orecchiette dans la même eau salée.', 'Stängelkohl und Orecchiette zusammen im selben Salzwasser kochen.', '把芜菁嫩叶和猫耳朵面放进同一锅盐水里一起煮。', 'शलजम के पत्ते और ओरेक्कियेत्ते एक ही नमक वाले पानी में साथ पकाएँ।'),
      L('Warm olive oil with garlic, chilli and, if you like, a few anchovies until they melt.', 'Scalda l’olio con aglio, peperoncino e, se vuoi, qualche acciuga finché si scioglie.', 'Calienta el aceite con ajo, guindilla y, si quieres, unas anchoas hasta que se deshagan.', 'Chauffez l’huile avec ail, piment et, si vous voulez, quelques anchois jusqu’à ce qu’ils fondent.', 'Olivenöl mit Knoblauch, Chili und nach Belieben ein paar Sardellen erwärmen, bis sie zerfallen.', '橄榄油加大蒜、辣椒加热，喜欢的话放几条凤尾鱼煮到化开。', 'जैतून के तेल को लहसुन, मिर्च और चाहें तो कुछ एंचोवी के साथ उनके घुलने तक गरम करें।'),
      L('Toss everything in the pan; a handful of toasted breadcrumbs adds crunch.', 'Salta tutto in padella; una manciata di pangrattato tostato aggiunge croccantezza.', 'Saltea todo en la sartén; un puñado de pan rallado tostado aporta un toque crujiente.', 'Faites tout sauter à la poêle ; une poignée de chapelure grillée ajoute du croquant.', 'Alles in der Pfanne schwenken; eine Handvoll geröstete Semmelbrösel sorgt für Biss.', '全部倒进锅里翻拌；撒一把烤面包屑会更香脆。', 'सब कुछ कड़ाही में मिलाएँ; मुट्ठी भर भुने ब्रेडक्रम्ब्स कुरकुरापन लाते हैं।'),
    ],
  },
  {
    id: 'pesto',
    pasta: 'trofie',
    name: 'Trofie al pesto',
    title: L('Trofie with Genoese pesto', 'Trofie al pesto', 'Trofie al pesto genovés', 'Trofie au pesto génois', 'Trofie mit Pesto Genovese', '热那亚青酱特罗菲面', 'जेनोवा पेस्तो वाली ट्रोफ़ी'),
    need: ['pesto'],
    may: ['parmigiano', 'pecorino'],
    history: L('From Genoa and the Ligurian coast. The name comes from “pestare”, to pound: the sauce is traditionally made in a marble mortar with a wooden pestle.', 'Viene da Genova e dalla Riviera ligure. Il nome deriva da “pestare”: il condimento si prepara per tradizione nel mortaio di marmo con il pestello di legno.', 'Viene de Génova y de la costa de Liguria. El nombre viene de “pestare”, machacar: la salsa se prepara tradicionalmente en un mortero de mármol con mano de madera.', 'Elle vient de Gênes et de la côte ligure. Le nom vient de « pestare », piler : la sauce se prépare traditionnellement dans un mortier en marbre avec un pilon en bois.', 'Aus Genua und von der ligurischen Küste. Der Name kommt von „pestare“, zerstoßen: Die Sauce wird traditionell im Marmormörser mit einem Holzstößel zubereitet.', '来自热那亚和利古里亚海岸。名字来自“pestare”（捣碎）：按传统，酱汁要用大理石研钵和木杵捣成。', 'जेनोवा और लिगुरिया के तट से। नाम “पेस्तारे” यानी कूटना से आया है: यह सॉस परंपरागत रूप से संगमरमर की ओखली और लकड़ी के मूसल में बनती है।'),
    steps: [
      L('Pound basil, garlic and pine nuts with a little salt, then add grated cheese and extra virgin olive oil.', 'Pesta basilico, aglio e pinoli con un pizzico di sale, poi aggiungi formaggio grattugiato e olio extravergine.', 'Machaca albahaca, ajo y piñones con un poco de sal y añade queso rallado y aceite de oliva virgen extra.', 'Pilez basilic, ail et pignons avec un peu de sel, puis ajoutez du fromage râpé et de l’huile d’olive vierge extra.', 'Basilikum, Knoblauch und Pinienkerne mit etwas Salz zerstoßen, dann geriebenen Käse und natives Olivenöl extra zugeben.', '把罗勒、大蒜和松子加少许盐捣碎，再加入奶酪碎和特级初榨橄榄油。', 'तुलसी, लहसुन और चिलगोज़े को थोड़े नमक के साथ कूटें, फिर कसा चीज़ और एक्स्ट्रा वर्जिन जैतून का तेल मिलाएँ।'),
      L('Cook the trofie and keep a little of the cooking water.', 'Cuoci le trofie e tieni da parte un po’ d’acqua di cottura.', 'Cuece las trofie y guarda un poco del agua de cocción.', 'Faites cuire les trofie et gardez un peu d’eau de cuisson.', 'Trofie kochen und etwas Kochwasser aufheben.', '煮特罗菲面，留一点煮面水。', 'ट्रोफ़ी पकाएँ और थोड़ा पकाने का पानी बचा लें।'),
      L('Off the heat, toss with the pesto, loosening it with the water: pesto is never cooked.', 'A fuoco spento, condisci con il pesto allungandolo con l’acqua: il pesto non si cuoce mai.', 'Fuera del fuego, mezcla con el pesto aligerándolo con el agua: el pesto nunca se cocina.', 'Hors du feu, mélangez avec le pesto en le détendant avec l’eau : le pesto ne se cuit jamais.', 'Abseits vom Herd mit dem Pesto mischen und mit dem Wasser lockern: Pesto wird nie gekocht.', '离火后拌入青酱，用煮面水稀释：青酱从不加热烹煮。', 'आँच बंद करके पेस्तो में मिलाएँ और पानी से ढीला करें: पेस्तो को कभी पकाया नहीं जाता।'),
    ],
  },
  {
    id: 'bucatiniamatriciana',
    pasta: 'bucatini',
    name: 'Bucatini all’amatriciana',
    title: L('Bucatini with guanciale, tomato and Pecorino', 'Bucatini all’amatriciana', 'Bucatini a la amatriciana', 'Bucatini à l’amatriciana', 'Bucatini all’Amatriciana', '阿马特里切风味空心粗面', 'ग्वान्चाले, टमाटर और पेकोरिनो वाली बुकाटिनी'),
    need: ['guanciale', 'tomato', 'pecorino'],
    may: ['pepper'],
    history: L('In Rome amatriciana is very often made with bucatini, thick spaghetti with a hole through the middle. In Amatrice, the town that gave the dish its name, the recipe calls for spaghetti.', 'A Roma l’amatriciana si fa molto spesso con i bucatini, spaghetti grossi con un buco al centro. Ad Amatrice, la cittadina che dà il nome al piatto, la ricetta prevede gli spaghetti.', 'En Roma la amatriciana se hace muy a menudo con bucatini, espaguetis gruesos con un agujero en el centro. En Amatrice, el pueblo que da nombre al plato, la receta lleva espaguetis.', 'À Rome, l’amatriciana se fait très souvent avec des bucatini, de gros spaghetti percés au centre. À Amatrice, la ville qui a donné son nom au plat, la recette prévoit des spaghetti.', 'In Rom wird Amatriciana sehr oft mit Bucatini zubereitet, dicken Spaghetti mit einem Loch in der Mitte. In Amatrice, dem Ort, der dem Gericht den Namen gab, verlangt das Rezept Spaghetti.', '在罗马，阿马特里切酱常配空心粗面，也就是中间有孔的粗意面。而在给这道菜命名的小镇阿马特里切，食谱用的是意大利面。', 'रोम में अमात्रिचाना अक्सर बुकाटिनी से बनती है, यानी बीच में छेद वाली मोटी स्पेगेटी। अमात्रिचे में, जिस कस्बे से इस व्यंजन का नाम आया, नुस्खे में स्पेगेटी होती है।'),
    steps: [
      L('Brown the guanciale, then add the tomatoes and simmer for about 10 minutes.', 'Rosola il guanciale, poi aggiungi il pomodoro e cuoci per circa 10 minuti.', 'Dora el guanciale, añade el tomate y cuece unos 10 minutos.', 'Faites dorer le guanciale, ajoutez la tomate et laissez mijoter environ 10 minutes.', 'Guanciale anbraten, dann Tomaten zugeben und etwa 10 Minuten köcheln.', '将猪脸肉煎香，加入番茄，小火煮约 10 分钟。', 'ग्वान्चाले को भूनें, फिर टमाटर डालकर लगभग 10 मिनट पकाएँ।'),
      L('Cook the bucatini al dente.', 'Cuoci i bucatini al dente.', 'Cuece los bucatini al dente.', 'Faites cuire les bucatini al dente.', 'Bucatini al dente kochen.', '把空心粗面煮至弹牙。', 'बुकाटिनी को अल डेंटे पकाएँ।'),
      L('Toss with the sauce and finish with grated Pecorino Romano.', 'Salta con il sugo e completa con Pecorino Romano grattugiato.', 'Saltea con la salsa y termina con Pecorino Romano rallado.', 'Mélangez à la sauce et terminez avec du Pecorino Romano râpé.', 'Mit der Sauce schwenken und mit geriebenem Pecorino Romano vollenden.', '与酱汁拌匀，撒上刨碎的罗马羊奶酪。', 'सॉस में मिलाएँ और कसे हुए पेकोरिनो रोमानो से पूरा करें।'),
    ],
  },
  {
    id: 'rigatonigricia',
    pasta: 'rigatoni',
    name: 'Rigatoni alla gricia',
    title: L('Rigatoni with guanciale, Pecorino and pepper', 'Rigatoni alla gricia', 'Rigatoni con guanciale, pecorino y pimienta', 'Rigatoni au guanciale, pecorino et poivre', 'Rigatoni mit Guanciale, Pecorino und Pfeffer', '猪脸肉羊奶酪胡椒粗纹通心粉', 'ग्वान्चाले, पेकोरिनो और काली मिर्च वाली रिगाटोनी'),
    need: ['guanciale', 'pecorino', 'pepper'],
    may: [],
    history: L('In Roman trattorie gricia is very often served with rigatoni, whose ridges hold the creamy sauce. Its name is commonly linked to Grisciano, a village near Amatrice.', 'Nelle trattorie romane la gricia si serve molto spesso con i rigatoni, le cui righe trattengono la crema. Il nome viene comunemente collegato a Grisciano, frazione vicino ad Amatrice.', 'En las trattorie romanas la gricia se sirve muy a menudo con rigatoni, cuyas estrías retienen la salsa cremosa. Su nombre suele relacionarse con Grisciano, una aldea cerca de Amatrice.', 'Dans les trattorias romaines, la gricia est très souvent servie avec des rigatoni, dont les stries retiennent la sauce crémeuse. Son nom est souvent rattaché à Grisciano, un hameau près d’Amatrice.', 'In römischen Trattorien wird Gricia sehr oft mit Rigatoni serviert, deren Rillen die cremige Sauce halten. Der Name wird meist mit Grisciano verbunden, einem Dorf bei Amatrice.', '在罗马的小餐馆里，这道菜常配粗纹通心粉，面上的纹路能挂住浓滑的酱汁。名字通常被认为来自阿马特里切附近的村庄格里夏诺。', 'रोम की त्रात्तोरिया में ग्रीचा अक्सर रिगाटोनी के साथ परोसी जाती है, जिनकी धारियाँ गाढ़ी सॉस को पकड़ती हैं। इसका नाम आम तौर पर अमात्रिचे के पास के गाँव ग्रिशानो से जोड़ा जाता है।'),
    steps: [
      L('Render the guanciale slowly until golden.', 'Rosola lentamente il guanciale finché è dorato.', 'Dora el guanciale a fuego lento.', 'Faites fondre doucement le guanciale jusqu’à ce qu’il dore.', 'Guanciale langsam goldbraun auslassen.', '用小火慢慢煎猪脸肉至金黄。', 'ग्वान्चाले को धीमी आँच पर सुनहरा होने तक भूनें।'),
      L('Add the rigatoni to the pan with a ladle of cooking water.', 'Aggiungi i rigatoni in padella con un mestolo d’acqua di cottura.', 'Añade los rigatoni a la sartén con un cucharón de agua de cocción.', 'Ajoutez les rigatoni dans la poêle avec une louche d’eau de cuisson.', 'Rigatoni mit einer Kelle Kochwasser in die Pfanne geben.', '把粗纹通心粉和一勺煮面水一起倒进锅里。', 'एक करछी पकाने के पानी के साथ रिगाटोनी को कड़ाही में डालें।'),
      L('Off the heat, stir in Pecorino Romano and black pepper until creamy.', 'A fuoco spento, manteca con Pecorino Romano e pepe nero fino a ottenere una crema.', 'Fuera del fuego, mezcla con Pecorino Romano y pimienta negra hasta que quede cremoso.', 'Hors du feu, incorporez le Pecorino Romano et le poivre noir jusqu’à obtenir une sauce crémeuse.', 'Abseits vom Herd Pecorino Romano und schwarzen Pfeffer cremig unterrühren.', '离火后拌入罗马羊奶酪和黑胡椒，直到酱汁浓滑。', 'आँच बंद करके पेकोरिनो रोमानो और काली मिर्च मिलाएँ जब तक मलाईदार न हो जाए।'),
    ],
  },
  {
    id: 'tortelliniinbrodo',
    pasta: 'tortellini',
    name: 'Tortellini in brodo',
    title: L('Tortellini in broth', 'Tortellini in brodo', 'Tortellini en caldo', 'Tortellini en bouillon', 'Tortellini in Brühe', '清汤意式小馄饨', 'ब्रॉथ में टॉर्टेलिनी'),
    need: ['broth'],
    may: ['parmigiano'],
    history: L('From Bologna and Modena, where it is the dish of Christmas Day in many homes. A popular legend says an innkeeper shaped the first tortellino after glimpsing the navel of Venus; in 1974 a reference recipe for the filling was registered with the Bologna Chamber of Commerce.', 'Viene da Bologna e Modena, dove in molte case è il piatto del giorno di Natale. Una leggenda popolare racconta che un oste modellò il primo tortellino dopo aver intravisto l’ombelico di Venere; nel 1974 una ricetta di riferimento del ripieno è stata depositata alla Camera di Commercio di Bologna.', 'Viene de Bolonia y Módena, donde en muchas casas es el plato del día de Navidad. Una leyenda popular cuenta que un posadero dio forma al primer tortellino tras vislumbrar el ombligo de Venus; en 1974 se registró una receta de referencia del relleno en la Cámara de Comercio de Bolonia.', 'Il vient de Bologne et de Modène, où il est le plat du jour de Noël dans de nombreuses familles. Une légende populaire raconte qu’un aubergiste façonna le premier tortellino après avoir aperçu le nombril de Vénus ; en 1974, une recette de référence de la farce a été déposée à la Chambre de commerce de Bologne.', 'Aus Bologna und Modena, wo es in vielen Familien das Gericht des Weihnachtstags ist. Einer Volkslegende nach formte ein Wirt den ersten Tortellino, nachdem er den Nabel der Venus erblickt hatte; 1974 wurde ein Referenzrezept für die Füllung bei der Handelskammer Bologna hinterlegt.', '来自博洛尼亚和摩德纳，在许多家庭里是圣诞节当天的菜。民间传说有位客栈老板瞥见维纳斯的肚脐后，捏出了第一个 tortellino；1974 年，馅料的参考配方在博洛尼亚商会登记备案。', 'बोलोन्या और मोडेना से, जहाँ कई घरों में यह क्रिसमस के दिन का व्यंजन है। एक लोककथा कहती है कि एक सराय वाले ने वीनस की नाभि की झलक देखकर पहला टॉर्टेलिनो बनाया; 1974 में भरावन का एक संदर्भ नुस्खा बोलोन्या के चैंबर ऑफ़ कॉमर्स में दर्ज किया गया।'),
    steps: [
      L('Bring a good meat broth (capon or beef) to a gentle simmer.', 'Porta a leggero bollore un buon brodo di carne (cappone o manzo).', 'Lleva a un hervor suave un buen caldo de carne (capón o ternera).', 'Portez à frémissement un bon bouillon de viande (chapon ou bœuf).', 'Eine gute Fleischbrühe (Kapaun oder Rind) sanft zum Sieden bringen.', '把一锅好的肉汤（阉鸡或牛肉）小火煮到微滚。', 'अच्छा मीट ब्रॉथ (कैपन या बीफ़) धीमी आँच पर हल्का उबालें।'),
      L('Cook the tortellini in the broth for a few minutes.', 'Cuoci i tortellini nel brodo per pochi minuti.', 'Cuece los tortellini en el caldo unos minutos.', 'Faites cuire les tortellini quelques minutes dans le bouillon.', 'Die Tortellini einige Minuten in der Brühe garen.', '把意式小馄饨放进汤里煮几分钟。', 'टॉर्टेलिनी को ब्रॉथ में कुछ मिनट पकाएँ।'),
      L('Serve them in their broth, with grated Parmigiano Reggiano if you like.', 'Servili nel loro brodo, se vuoi con Parmigiano Reggiano grattugiato.', 'Sírvelos en su caldo, con Parmigiano Reggiano rallado si quieres.', 'Servez-les dans leur bouillon, avec du Parmigiano Reggiano râpé si vous voulez.', 'In ihrer Brühe servieren, nach Belieben mit geriebenem Parmigiano Reggiano.', '连汤一起上桌，喜欢的话撒上帕玛森干酪碎。', 'उन्हें उनके ब्रॉथ में परोसें, चाहें तो कसा हुआ पार्मिजानो रेज्जानो डालें।'),
    ],
  },
  {
    id: 'lasagne',
    pasta: 'lasagne',
    name: 'Lasagne alla bolognese',
    title: L('Lasagne Bolognese', 'Lasagne alla bolognese', 'Lasaña a la boloñesa', 'Lasagnes à la bolognaise', 'Lasagne alla Bolognese', '博洛尼亚千层面', 'बोलोनीज़ लज़ानिया'),
    need: ['ragu', 'bechamel', 'parmigiano'],
    may: [],
    history: L('From Bologna, where the sheets of egg pasta are traditionally green, made with spinach, and layered with ragù, béchamel and Parmigiano Reggiano before baking.', 'Viene da Bologna, dove le sfoglie all’uovo sono per tradizione verdi, fatte con gli spinaci, e si alternano a ragù, besciamella e Parmigiano Reggiano prima di andare in forno.', 'Viene de Bolonia, donde las láminas de pasta al huevo son tradicionalmente verdes, hechas con espinacas, y se alternan con ragú, bechamel y Parmigiano Reggiano antes de hornearse.', 'Elles viennent de Bologne, où les feuilles de pâte aux œufs sont traditionnellement vertes, faites aux épinards, et alternées avec ragù, béchamel et Parmigiano Reggiano avant la cuisson au four.', 'Aus Bologna, wo die Eiernudelplatten traditionell grün sind, mit Spinat gemacht, und vor dem Backen mit Ragù, Béchamel und Parmigiano Reggiano geschichtet werden.', '来自博洛尼亚，那里的鸡蛋面皮按传统是用菠菜做的绿色面皮，与肉酱、白酱和帕玛森干酪层层叠放后入炉烘烤。', 'बोलोन्या से, जहाँ अंडे वाली पास्ता शीट परंपरागत रूप से पालक से बनी हरी होती हैं और बेक करने से पहले रागू, बेशमेल और पार्मिजानो रेज्जानो के साथ परतों में लगाई जाती हैं।'),
    steps: [
      L('Layer the lasagne sheets with ragù and béchamel, with grated Parmigiano Reggiano on every layer.', 'Alterna le sfoglie con ragù e besciamella, con Parmigiano Reggiano grattugiato su ogni strato.', 'Alterna las láminas con ragú y bechamel, con Parmigiano Reggiano rallado en cada capa.', 'Alternez les feuilles avec le ragù et la béchamel, avec du Parmigiano Reggiano râpé sur chaque couche.', 'Die Platten abwechselnd mit Ragù und Béchamel schichten, jede Schicht mit geriebenem Parmigiano Reggiano.', '把千层面皮和肉酱、白酱层层叠放，每层撒上帕玛森干酪碎。', 'लज़ानिया शीट को रागू और बेशमेल के साथ परतों में लगाएँ, हर परत पर कसा पार्मिजानो रेज्जानो डालें।'),
      L('Finish with béchamel and Parmigiano on top.', 'Termina con besciamella e Parmigiano in superficie.', 'Termina con bechamel y Parmigiano por encima.', 'Terminez par de la béchamel et du Parmigiano sur le dessus.', 'Oben mit Béchamel und Parmigiano abschließen.', '最上层铺白酱并撒帕玛森干酪。', 'ऊपर बेशमेल और पार्मिजानो से पूरा करें।'),
      L('Bake until golden and bubbling, then let it rest a few minutes before cutting.', 'Cuoci in forno finché è dorata e sfrigolante, poi lasciala riposare qualche minuto prima di tagliarla.', 'Hornea hasta que esté dorada y burbujeante y deja reposar unos minutos antes de cortar.', 'Faites cuire au four jusqu’à ce qu’elles soient dorées et frémissantes, puis laissez reposer quelques minutes avant de couper.', 'Backen, bis sie goldbraun ist und Blasen wirft, dann vor dem Schneiden ein paar Minuten ruhen lassen.', '烤到表面金黄冒泡，静置几分钟再切。', 'सुनहरा और बुलबुलेदार होने तक बेक करें, फिर काटने से पहले कुछ मिनट रहने दें।'),
    ],
  },
];

/**
 * What a selection makes.
 *   { kind: 'traditional', recipe }   , exactly a traditional dish
 *   { kind: 'variation', recipe }     , a traditional dish plus other ingredients
 *   { kind: 'variation', recipe: null }, a creative combination
 *   null                              , nothing chosen yet
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

/* ---- origins, groups and hashtags (Recipe Club presentation and sharing) ---- */

// where each dish comes from, shown above its story
export const REGIONS = {
  lazio: L('Rome and Lazio', 'Roma e Lazio', 'Roma y el Lacio', 'Rome et le Latium', 'Rom und Latium', '罗马与拉齐奥', 'रोम और लात्सियो'),
  campania: L('Naples and Campania', 'Napoli e Campania', 'Nápoles y Campania', 'Naples et la Campanie', 'Neapel und Kampanien', '那不勒斯与坎帕尼亚', 'नेपल्स और कैम्पानिया'),
  emilia: L('Bologna, Emilia-Romagna', 'Bologna, Emilia-Romagna', 'Bolonia, Emilia-Romaña', 'Bologne, Émilie-Romagne', 'Bologna, Emilia-Romagna', '博洛尼亚，艾米利亚-罗马涅', 'बोलोन्या, एमिलिया-रोमान्या'),
  sicilia: L('Catania, Sicily', 'Catania, Sicilia', 'Catania, Sicilia', 'Catane, Sicile', 'Catania, Sizilien', '卡塔尼亚，西西里', 'कातानिया, सिसिली'),
  puglia: L('Bari, Puglia', 'Bari, Puglia', 'Bari, Apulia', 'Bari, Pouilles', 'Bari, Apulien', '巴里，普利亚', 'बारी, पुलिया'),
  liguria: L('Genoa, Liguria', 'Genova, Liguria', 'Génova, Liguria', 'Gênes, Ligurie', 'Genua, Ligurien', '热那亚，利古里亚', 'जेनोवा, लिगुरिया'),
  north: L('Northern Italy', 'Nord Italia', 'Norte de Italia', 'Nord de l’Italie', 'Norditalien', '意大利北部', 'उत्तरी इटली'),
  northcentre: L('Northern and central Italy', 'Nord e Centro Italia', 'Norte y centro de Italia', 'Nord et centre de l’Italie', 'Nord- und Mittelitalien', '意大利北部和中部', 'उत्तरी और मध्य इटली'),
};
const REGION_OF = {
  pomodoro: 'campania', cacioepepe: 'lazio', carbonara: 'lazio', gricia: 'lazio', amatriciana: 'lazio', ragu: 'emilia', sorrentina: 'campania',
  gnocchiburro: 'north', raviolibutter: 'northcentre', aglioolio: 'campania', vongole: 'campania', arrabbiata: 'lazio', norma: 'sicilia',
  cimedirapa: 'puglia', pesto: 'liguria', bucatiniamatriciana: 'lazio', rigatonigricia: 'lazio', tortelliniinbrodo: 'emilia', lasagne: 'emilia',
};
export const regionOf = (recipe) => (recipe ? REGIONS[REGION_OF[recipe.id]] : null);

// ingredients shown in families, so the longer list stays easy to scan
export const INGREDIENT_GROUPS = [
  { id: 'sauces', name: L('Sauces and oil', 'Sughi e condimenti', 'Salsas y aceite', 'Sauces et huile', 'Saucen und Öl', '酱汁与油', 'सॉस और तेल'), ids: ['tomato', 'ragu', 'pesto', 'broth', 'bechamel', 'oliveoil', 'butter'] },
  { id: 'meat', name: L('Meat and fish', 'Carne e pesce', 'Carne y pescado', 'Viande et poisson', 'Fleisch und Fisch', '肉类与海鲜', 'मांस और मछली'), ids: ['guanciale', 'clams', 'anchovy'] },
  { id: 'cheese', name: L('Eggs and cheeses', 'Uova e formaggi', 'Huevos y quesos', 'Œufs et fromages', 'Eier und Käse', '蛋与奶酪', 'अंडे और चीज़'), ids: ['egg', 'pecorino', 'parmigiano', 'mozzarella', 'ricottasalata'] },
  { id: 'veg', name: L('Vegetables', 'Verdure', 'Verduras', 'Légumes', 'Gemüse', '蔬菜', 'सब्ज़ियाँ'), ids: ['aubergine', 'cimedirapa', 'garlic', 'chilli'] },
  { id: 'herbs', name: L('Herbs and finishing touches', 'Erbe e tocchi finali', 'Hierbas y toques finales', 'Herbes et touches finales', 'Kräuter und der letzte Schliff', '香草与点睛之笔', 'जड़ी-बूटियाँ और आख़िरी स्पर्श'), ids: ['basil', 'sage', 'parsley', 'pepper', 'breadcrumbs'] },
];

// hashtags for sharing: the branded ones and one for the dish (or the pasta)
export const HASHTAGS = ['#ImperiaRecipeClub', '#MadeWithImperia', '#PastaYourWay'];
const DISH_TAG = {
  pomodoro: 'PastaAlPomodoro', cacioepepe: 'CacioEPepe', carbonara: 'Carbonara', gricia: 'Gricia', amatriciana: 'Amatriciana', ragu: 'TagliatelleAlRagu',
  sorrentina: 'GnocchiAllaSorrentina', gnocchiburro: 'BurroESalvia', raviolibutter: 'BurroESalvia', aglioolio: 'AglioOlioEPeperoncino', vongole: 'SpaghettiAlleVongole',
  arrabbiata: 'Arrabbiata', norma: 'PastaAllaNorma', cimedirapa: 'OrecchietteAlleCimeDiRapa', pesto: 'PestoGenovese', bucatiniamatriciana: 'Amatriciana', rigatonigricia: 'Gricia',
  tortelliniinbrodo: 'TortelliniInBrodo', lasagne: 'LasagneAllaBolognese',
};
/** The hashtags for a card: three branded ones plus the dish (or, for a creative plate, the pasta). */
export function hashtagsFor(recipe, pastaId) {
  const own = recipe ? DISH_TAG[recipe.id] : (RECIPE_PASTAS.find((p) => p.id === pastaId)?.name.it || '').replace(/[^A-Za-z]/g, '');
  return own ? [...HASHTAGS, `#${own}`] : [...HASHTAGS];
}

/* ---- Shared Dishes: illustrative sample posts (no real users, no real posts) ---- */
// A demonstration of how the Recipe Club could become a community. The
// accounts are made up and marked "demo"; nothing here was posted by anyone.
export const SAMPLE_POSTS = [
  {
    id: 'p1',
    handle: '@demo.cacio_club',
    recipe: 'cacioepepe',
    caption: L('Three ingredients, zero drama. Cacio e pepe on a Tuesday.', 'Tre ingredienti, zero drammi. Cacio e pepe di martedì.', 'Tres ingredientes, cero dramas. Cacio e pepe un martes.', 'Trois ingrédients, zéro drame. Cacio e pepe un mardi.', 'Drei Zutaten, null Drama. Cacio e pepe an einem Dienstag.', '三种食材，零压力。周二的芝士胡椒意面。', 'तीन चीज़ें, कोई झंझट नहीं। मंगलवार की कैचो ए पेपे।'),
    comments: [
      { handle: '@demo.sunday_sauce', text: L('the creamy part is a skill fr', 'la cremina è un’arte', 'la cremita es un arte', 'la crème, c’est un art', 'die Cremigkeit ist echte Kunst', '那层奶油感是真功夫', 'वो क्रीमीपन असली कला है') },
      { handle: '@demo.pasta_notes', text: L('pasta water supremacy', 'acqua di cottura sempre', 'agua de cocción, siempre', 'l’eau de cuisson, toujours', 'Nudelwasser for the win', '煮面水才是灵魂', 'पास्ता पानी ही राज़ है') },
    ],
  },
  {
    id: 'p2',
    handle: '@demo.liguria_lunch',
    recipe: 'pesto',
    caption: L('Mortar out, phone down. Trofie al pesto, never cooked.', 'Fuori il mortaio, giù il telefono. Trofie al pesto, mai cotto.', 'Mortero fuera, móvil abajo. Trofie al pesto, nunca cocinado.', 'Mortier sorti, téléphone posé. Trofie au pesto, jamais cuit.', 'Mörser raus, Handy weg. Trofie al pesto, nie gekocht.', '拿出研钵，放下手机。热那亚青酱特罗菲面，青酱从不加热。', 'ओखली बाहर, फ़ोन नीचे। पेस्तो वाली ट्रोफ़ी, कभी पकाया नहीं।'),
    comments: [{ handle: '@demo.cacio_club', text: L('that green tho', 'quel verde però', 'ese verde, eh', 'ce vert quand même', 'dieses Grün!', '这个绿也太好看', 'वो हरा रंग तो देखो') }],
  },
  {
    id: 'p3',
    handle: '@demo.bari_bites',
    recipe: 'cimedirapa',
    caption: L('Orecchiette and cime di rapa, cooked in the same pot. Less washing up.', 'Orecchiette e cime di rapa nella stessa pentola. Meno piatti da lavare.', 'Orecchiette y grelos en la misma olla. Menos platos que fregar.', 'Orecchiette et brocoli-rave dans la même casserole. Moins de vaisselle.', 'Orecchiette und Stängelkohl im selben Topf. Weniger Abwasch.', '猫耳朵面和芜菁嫩叶同锅煮，少洗一个锅。', 'ओरेक्कियेत्ते और शलजम के पत्ते एक ही बर्तन में। कम बर्तन धोने।'),
    comments: [{ handle: '@demo.pasta_notes', text: L('breadcrumbs on top = mandatory', 'pangrattato sopra = obbligatorio', 'pan rallado encima = obligatorio', 'chapelure dessus = obligatoire', 'Semmelbrösel obendrauf = Pflicht', '上面撒面包屑 = 必须', 'ऊपर ब्रेडक्रम्ब्स = ज़रूरी') }],
  },
  {
    id: 'p4',
    handle: '@demo.brodo_sundays',
    recipe: 'tortelliniinbrodo',
    caption: L('Tortellini in brodo: a hug in a bowl.', 'Tortellini in brodo: un abbraccio nel piatto.', 'Tortellini en caldo: un abrazo en un plato.', 'Tortellini en bouillon : un câlin dans un bol.', 'Tortellini in Brühe: eine Umarmung im Teller.', '清汤意式小馄饨：一碗温暖。', 'ब्रॉथ में टॉर्टेलिनी: कटोरे में एक झप्पी।'),
    comments: [
      { handle: '@demo.liguria_lunch', text: L('how many did you fold?', 'quanti ne hai chiusi?', '¿cuántos has cerrado?', 'tu en as plié combien ?', 'wie viele hast du gefaltet?', '你包了多少个？', 'कितने मोड़े?') },
    ],
  },
];
