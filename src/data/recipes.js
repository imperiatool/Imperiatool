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
  { id: 'guanciale', hex: '#e7b3a1', name: L('Guanciale', 'Guanciale', 'Guanciale', 'Guanciale', 'Guanciale', '猪脸肉', 'ग्वान्चाले') , note: L('cured pork cheek', 'guancia di maiale stagionata', 'carrillera de cerdo curada', 'joue de porc séchée', 'luftgetrocknete Schweinebacke', '风干猪脸颊肉', 'सुखाया हुआ सूअर का गाल') },
  { id: 'egg', hex: '#ffb548', name: L('Egg yolk', 'Tuorlo d’uovo', 'Yema de huevo', 'Jaune d’œuf', 'Eigelb', '蛋黄', 'अंडे की ज़र्दी') },
  { id: 'pecorino', hex: '#eee2c0', name: L('Pecorino Romano', 'Pecorino Romano', 'Pecorino Romano', 'Pecorino Romano', 'Pecorino Romano', '罗马羊奶酪', 'पेकोरिनो रोमानो') , note: L('Italian sheep’s milk cheese', 'formaggio di latte di pecora', 'queso italiano de leche de oveja', 'fromage italien au lait de brebis', 'italienischer Schafskäse', '意大利羊奶酪', 'भेड़ के दूध से बना इतालवी चीज़') },
  { id: 'pepper', hex: '#3b3733', name: L('Black pepper', 'Pepe nero', 'Pimienta negra', 'Poivre noir', 'Schwarzer Pfeffer', '黑胡椒', 'काली मिर्च') },
  { id: 'ragu', hex: '#6a3933', name: L('Ragù', 'Ragù', 'Ragú', 'Ragù', 'Ragù', '肉酱', 'रागू') , note: L('slow-cooked meat sauce', 'sugo di carne a lunga cottura', 'salsa de carne de cocción lenta', 'sauce à la viande mijotée', 'langsam geschmorte Fleischsauce', '慢炖肉酱', 'धीमी आँच पर पका मीट सॉस') },
  { id: 'parmigiano', hex: '#f1d48a', name: L('Parmigiano Reggiano', 'Parmigiano Reggiano', 'Parmigiano Reggiano', 'Parmigiano Reggiano', 'Parmigiano Reggiano', '帕玛森干酪', 'पार्मिजानो रेज्जानो') , note: L('aged Italian cow’s milk cheese', 'formaggio stagionato di latte vaccino', 'queso italiano curado de leche de vaca', 'fromage italien affiné au lait de vache', 'gereifter italienischer Kuhmilchkäse', '陈年意大利牛奶奶酪', 'पुराना इतालवी गाय के दूध का चीज़') },
  { id: 'mozzarella', hex: '#faf8f0', name: L('Mozzarella', 'Mozzarella', 'Mozzarella', 'Mozzarella', 'Mozzarella', '马苏里拉', 'मोज़ेरेला') , note: L('fresh stretched-curd cheese', 'formaggio fresco a pasta filata', 'queso fresco de pasta hilada', 'fromage frais à pâte filée', 'frischer Filata-Käse', '新鲜拉丝奶酪', 'ताज़ा मुलायम चीज़') },
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
