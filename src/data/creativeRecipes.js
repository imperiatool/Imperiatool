// Creative recipes: any pasta with any ingredients of the builder becomes a
// recipe of its own (quantities for two and a method), built from what each
// ingredient needs: what is cooked in the pan, how the pasta is cooked, what is
// stirred in off the heat and what goes on top. These are presented as
// creative recipes, never as traditional ones, and make no regional or
// historical claim. Every text is given in the seven languages of the app.
import { INGREDIENTS, RECIPE_PASTAS } from './recipes.js';

const L = (en, it, es, fr, de, zh, hi) => ({ en, it, es, fr, de, zh, hi });
const LANGS = ['en', 'it', 'es', 'fr', 'de', 'zh', 'hi'];
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

// quantities for two people
const QTY = {
  tomato: L('300 g tomatoes (fresh or tinned)', '300 g di pomodori (freschi o pelati)', '300 g de tomates (frescos o en lata)', '300 g de tomates (fraîches ou en boîte)', '300 g Tomaten (frisch oder aus der Dose)', '番茄 300 克（新鲜或罐装）', '300 ग्राम टमाटर (ताज़ा या डिब्बाबंद)'),
  basil: L('A few basil leaves', 'Qualche foglia di basilico', 'Unas hojas de albahaca', 'Quelques feuilles de basilic', 'Einige Basilikumblätter', '罗勒叶几片', 'तुलसी की कुछ पत्तियाँ'),
  guanciale: L('80 g guanciale', '80 g di guanciale', '80 g de guanciale', '80 g de guanciale', '80 g Guanciale', '猪脸肉 80 克', '80 ग्राम ग्वान्चाले'),
  egg: L('2 egg yolks', '2 tuorli', '2 yemas de huevo', '2 jaunes d’œuf', '2 Eigelb', '蛋黄 2 个', '2 अंडे की ज़र्दी'),
  pecorino: L('40 g Pecorino Romano', '40 g di Pecorino Romano', '40 g de Pecorino Romano', '40 g de Pecorino Romano', '40 g Pecorino Romano', '罗马羊奶酪 40 克', '40 ग्राम पेकोरिनो रोमानो'),
  pepper: L('Black pepper, to taste', 'Pepe nero, q.b.', 'Pimienta negra, al gusto', 'Poivre noir, selon votre goût', 'Schwarzer Pfeffer nach Geschmack', '黑胡椒适量', 'स्वादानुसार काली मिर्च'),
  ragu: L('250 g ragù', '250 g di ragù', '250 g de ragú', '250 g de ragù', '250 g Ragù', '肉酱 250 克', '250 ग्राम रागू'),
  parmigiano: L('40 g Parmigiano Reggiano', '40 g di Parmigiano Reggiano', '40 g de Parmigiano Reggiano', '40 g de Parmigiano Reggiano', '40 g Parmigiano Reggiano', '帕玛森干酪 40 克', '40 ग्राम पार्मिजानो रेज्जानो'),
  mozzarella: L('125 g mozzarella', '125 g di mozzarella', '125 g de mozzarella', '125 g de mozzarella', '125 g Mozzarella', '马苏里拉 125 克', '125 ग्राम मोज़ेरेला'),
  butter: L('30 g butter', '30 g di burro', '30 g de mantequilla', '30 g de beurre', '30 g Butter', '黄油 30 克', '30 ग्राम मक्खन'),
  sage: L('6 sage leaves', '6 foglie di salvia', '6 hojas de salvia', '6 feuilles de sauge', '6 Salbeiblätter', '鼠尾草叶 6 片', 'सेज की 6 पत्तियाँ'),
  garlic: L('1 garlic clove', '1 spicchio d’aglio', '1 diente de ajo', '1 gousse d’ail', '1 Knoblauchzehe', '大蒜 1 瓣', 'लहसुन की 1 कली'),
  oliveoil: L('2 tablespoons extra virgin olive oil', '2 cucchiai di olio extravergine d’oliva', '2 cucharadas de aceite de oliva virgen extra', '2 cuillères à soupe d’huile d’olive vierge extra', '2 EL natives Olivenöl extra', '特级初榨橄榄油 2 汤匙', '2 बड़े चम्मच एक्स्ट्रा वर्जिन जैतून का तेल'),
  chilli: L('1 small dried chilli', '1 peperoncino secco piccolo', '1 guindilla seca pequeña', '1 petit piment séché', '1 kleine getrocknete Chilischote', '小干辣椒 1 个', '1 छोटी सूखी लाल मिर्च'),
  parsley: L('A small bunch of parsley', 'Un mazzetto di prezzemolo', 'Un manojo pequeño de perejil', 'Un petit bouquet de persil', 'Ein kleiner Bund Petersilie', '欧芹一小把', 'अजमोद का एक छोटा गुच्छा'),
  clams: L('500 g clams', '500 g di vongole', '500 g de almejas', '500 g de palourdes', '500 g Venusmuscheln', '蛤蜊 500 克', '500 ग्राम क्लैम'),
  anchovy: L('4 anchovy fillets', '4 filetti di acciuga', '4 filetes de anchoa', '4 filets d’anchois', '4 Sardellenfilets', '凤尾鱼柳 4 条', 'एंचोवी के 4 फ़िले'),
  aubergine: L('1 aubergine', '1 melanzana', '1 berenjena', '1 aubergine', '1 Aubergine', '茄子 1 个', '1 बैंगन'),
  cimedirapa: L('400 g turnip tops', '400 g di cime di rapa', '400 g de grelos', '400 g de brocoli-rave', '400 g Stängelkohl', '芜菁嫩叶 400 克', '400 ग्राम शलजम के पत्ते'),
  ricottasalata: L('40 g ricotta salata', '40 g di ricotta salata', '40 g de ricotta salata', '40 g de ricotta salata', '40 g Ricotta salata', '咸里科塔 40 克', '40 ग्राम रिकोटा सलाटा'),
  breadcrumbs: L('3 tablespoons breadcrumbs', '3 cucchiai di pangrattato', '3 cucharadas de pan rallado', '3 cuillères à soupe de chapelure', '3 EL Semmelbrösel', '面包屑 3 汤匙', '3 बड़े चम्मच ब्रेडक्रम्ब्स'),
  broth: L('1 litre meat broth', '1 litro di brodo di carne', '1 litro de caldo de carne', '1 litre de bouillon de viande', '1 Liter Fleischbrühe', '肉汤 1 升', '1 लीटर मीट ब्रॉथ'),
  bechamel: L('250 ml béchamel', '250 ml di besciamella', '250 ml de bechamel', '250 ml de béchamel', '250 ml Béchamel', '白酱 250 毫升', '250 मिली बेशमेल'),
  pesto: L('4 tablespoons Genoese pesto', '4 cucchiai di pesto alla genovese', '4 cucharadas de pesto genovés', '4 cuillères à soupe de pesto génois', '4 EL Pesto Genovese', '热那亚青酱 4 汤匙', '4 बड़े चम्मच जेनोवा पेस्तो'),
};
const FILLED = new Set(['tortellini', 'ravioli']);
const QTY_PASTA = {
  default: L('160 g {pasta}', '160 g di {pasta}', '160 g de {pasta}', '160 g de {pasta}', '160 g {pasta}', '{pasta} 160 克', '160 ग्राम {pasta}'),
  gnocchi: L('400 g {pasta}', '400 g di {pasta}', '400 g de {pasta}', '400 g de {pasta}', '400 g {pasta}', '{pasta} 400 克', '400 ग्राम {pasta}'),
  filled: L('250 g {pasta}', '250 g di {pasta}', '250 g de {pasta}', '250 g de {pasta}', '250 g {pasta}', '{pasta} 250 克', '250 ग्राम {pasta}'),
  lasagne: L('8 sheets of {pasta}', '8 sfoglie di {pasta}', '8 láminas de {pasta}', '8 feuilles de {pasta}', '8 {pasta}-Platten', '{pasta} 8 张', '{pasta} की 8 शीट'),
};
const SALT = L('Salt', 'Sale', 'Sal', 'Sel', 'Salz', '盐', 'नमक');

// the method, one sentence per kind of step
const S = {
  warm: L('Warm {fat} in a large pan with {list} over a low heat for 1 to 2 minutes.', 'Scalda {fat} in una padella ampia con {list} a fuoco basso per 1-2 minuti.', 'Calienta {fat} en una sartén amplia con {list} a fuego bajo durante 1 o 2 minutos.', 'Faites chauffer {fat} dans une grande poêle avec {list} à feu doux pendant 1 à 2 minutes.', '{fat} in einer großen Pfanne mit {list} bei schwacher Hitze 1 bis 2 Minuten erwärmen.', '在大平底锅中用小火加热{fat}和{list} 1 至 2 分钟。', 'एक बड़े पैन में {fat} गरम करें और {list} डालकर धीमी आँच पर 1 से 2 मिनट पकाएँ।'),
  warmPlain: L('Warm {fat} in a large pan over a low heat.', 'Scalda {fat} in una padella ampia a fuoco basso.', 'Calienta {fat} en una sartén amplia a fuego bajo.', 'Faites chauffer {fat} dans une grande poêle à feu doux.', '{fat} in einer großen Pfanne bei schwacher Hitze erwärmen.', '在大平底锅中用小火加热{fat}。', 'एक बड़े पैन में धीमी आँच पर {fat} गरम करें।'),
  guanciale: L('Add the guanciale, cut into strips, and cook until crisp.', 'Aggiungi il guanciale tagliato a listarelle e fallo rosolare finché è croccante.', 'Añade el guanciale en tiras y dóralo hasta que esté crujiente.', 'Ajoutez le guanciale coupé en lanières et faites-le dorer jusqu’à ce qu’il soit croustillant.', 'Guanciale in Streifen zugeben und knusprig braten.', '加入切条的猪脸肉，煎至酥脆。', 'पट्टियों में कटा ग्वान्चाले डालें और कुरकुरा होने तक पकाएँ।'),
  anchovy: L('Add the anchovies and let them melt into the oil.', 'Aggiungi le acciughe e lasciale sciogliere nel condimento.', 'Añade las anchoas y deja que se deshagan en el aceite.', 'Ajoutez les anchois et laissez-les fondre dans la matière grasse.', 'Sardellen zugeben und im Fett schmelzen lassen.', '加入凤尾鱼，让它在油中慢慢化开。', 'एंचोवी डालें और उन्हें तेल में घुलने दें।'),
  aubergine: L('Add the diced aubergine and fry until soft and golden, about 10 minutes.', 'Aggiungi la melanzana a cubetti e falla dorare finché è morbida, circa 10 minuti.', 'Añade la berenjena en dados y fríela hasta que esté tierna y dorada, unos 10 minutos.', 'Ajoutez l’aubergine en dés et faites-la dorer jusqu’à ce qu’elle soit fondante, environ 10 minutes.', 'Gewürfelte Aubergine zugeben und etwa 10 Minuten weich und goldbraun braten.', '加入切丁的茄子，煎至软嫩金黄，约 10 分钟。', 'कटे हुए बैंगन डालें और नरम व सुनहरा होने तक लगभग 10 मिनट तलें।'),
  clams: L('Add the clams, cover and cook until they open, 3 to 4 minutes; discard any that stay closed.', 'Aggiungi le vongole, copri e cuoci finché si aprono, 3-4 minuti; scarta quelle rimaste chiuse.', 'Añade las almejas, tapa y cocina hasta que se abran, 3 o 4 minutos; desecha las que sigan cerradas.', 'Ajoutez les palourdes, couvrez et laissez cuire jusqu’à ce qu’elles s’ouvrent, 3 à 4 minutes ; jetez celles qui restent fermées.', 'Venusmuscheln zugeben, zudecken und 3 bis 4 Minuten garen, bis sie sich öffnen; geschlossene wegwerfen.', '加入蛤蜊，盖上锅盖煮 3 至 4 分钟至开口；未开口的丢弃。', 'क्लैम डालें, ढककर 3 से 4 मिनट पकाएँ जब तक वे खुल न जाएँ; जो बंद रहें उन्हें फेंक दें।'),
  tomato: L('Add the tomatoes with a pinch of salt and simmer for about 15 minutes.', 'Aggiungi i pomodori con un pizzico di sale e cuoci a fuoco dolce per circa 15 minuti.', 'Añade los tomates con una pizca de sal y cuece a fuego suave unos 15 minutos.', 'Ajoutez les tomates avec une pincée de sel et laissez mijoter environ 15 minutes.', 'Tomaten mit einer Prise Salz zugeben und etwa 15 Minuten köcheln.', '加入番茄和少许盐，小火煮约 15 分钟。', 'एक चुटकी नमक के साथ टमाटर डालें और लगभग 15 मिनट धीमी आँच पर पकाएँ।'),
  ragu: L('Add the ragù and warm it through gently.', 'Aggiungi il ragù e scaldalo dolcemente.', 'Añade el ragú y caliéntalo suavemente.', 'Ajoutez le ragù et réchauffez-le doucement.', 'Ragù zugeben und sanft erwärmen.', '加入肉酱，小火慢慢加热。', 'रागू डालें और धीरे-धीरे गरम करें।'),
  bechamel: L('Warm the béchamel in a small pan.', 'Scalda la besciamella in un pentolino.', 'Calienta la bechamel en un cazo pequeño.', 'Réchauffez la béchamel dans une petite casserole.', 'Béchamel in einem kleinen Topf erwärmen.', '在小锅中加热白酱。', 'एक छोटे बर्तन में बेशमेल गरम करें।'),
  broth: L('Bring the broth to the boil.', 'Porta il brodo a bollore.', 'Lleva el caldo a ebullición.', 'Portez le bouillon à ébullition.', 'Die Brühe zum Kochen bringen.', '把肉汤煮沸。', 'ब्रॉथ को उबाल लें।'),
  pasta: L('Cook the pasta in plenty of salted boiling water until al dente, keeping a cup of the cooking water.', 'Cuoci la pasta in abbondante acqua salata bollente fino a renderla al dente, tenendo da parte una tazza d’acqua di cottura.', 'Cuece la pasta en abundante agua hirviendo con sal hasta que esté al dente y guarda una taza del agua de cocción.', 'Faites cuire les pâtes dans beaucoup d’eau bouillante salée jusqu’à ce qu’elles soient al dente, en gardant une tasse d’eau de cuisson.', 'Pasta in reichlich kochendem Salzwasser al dente garen und eine Tasse Kochwasser aufheben.', '用大量加盐沸水把面煮至弹牙，留一杯煮面水。', 'पास्ता को ख़ूब नमक वाले उबलते पानी में अल डेंटे होने तक पकाएँ और एक कप पकाने का पानी बचा लें।'),
  pastaSoft: L('Cook the pasta in plenty of salted boiling water until it rises to the surface, keeping a cup of the cooking water.', 'Cuoci la pasta in abbondante acqua salata bollente finché viene a galla, tenendo da parte una tazza d’acqua di cottura.', 'Cuece la pasta en abundante agua hirviendo con sal hasta que suba a la superficie y guarda una taza del agua de cocción.', 'Faites cuire les pâtes dans beaucoup d’eau bouillante salée jusqu’à ce qu’elles remontent à la surface, en gardant une tasse d’eau de cuisson.', 'Pasta in reichlich kochendem Salzwasser garen, bis sie an die Oberfläche steigt, und eine Tasse Kochwasser aufheben.', '用大量加盐沸水煮至浮起，留一杯煮面水。', 'पास्ता को ख़ूब नमक वाले उबलते पानी में तब तक पकाएँ जब तक वह ऊपर न आ जाए, और एक कप पकाने का पानी बचा लें।'),
  pastaBroth: L('Cook the pasta in the broth until tender and serve it in the broth.', 'Cuoci la pasta nel brodo finché è tenera e servila in brodo.', 'Cuece la pasta en el caldo hasta que esté tierna y sírvela en el caldo.', 'Faites cuire les pâtes dans le bouillon jusqu’à ce qu’elles soient tendres et servez-les dans le bouillon.', 'Pasta in der Brühe weich garen und in der Brühe servieren.', '把面放入肉汤中煮软，连汤一起盛出。', 'पास्ता को ब्रॉथ में नरम होने तक पकाएँ और ब्रॉथ के साथ परोसें।'),
  lasagne: L('Layer the lasagne sheets in a baking dish with the other ingredients, then bake at 180 °C for about 25 minutes.', 'Componi gli strati di sfoglia in una pirofila con gli altri ingredienti, poi cuoci in forno a 180 °C per circa 25 minuti.', 'Monta las capas de lasaña en una fuente con los demás ingredientes y hornea a 180 °C unos 25 minutos.', 'Montez les feuilles de lasagnes en couches dans un plat avec les autres ingrédients, puis enfournez à 180 °C pendant environ 25 minutes.', 'Lasagneplatten mit den übrigen Zutaten in einer Auflaufform schichten und bei 180 °C etwa 25 Minuten backen.', '在烤盘中把千层面片与其他食材层层叠放，以 180 °C 烤约 25 分钟。', 'लज़ानिया शीट को बाक़ी सामग्री के साथ बेकिंग डिश में परत दर परत लगाएँ, फिर 180 °C पर लगभग 25 मिनट बेक करें।'),
  cimedirapa: L('Boil the turnip tops in the salted pasta water for about 5 minutes before adding the pasta, then cook them together.', 'Lessa le cime di rapa nell’acqua salata della pasta per circa 5 minuti prima di buttare la pasta, poi cuocile insieme.', 'Hierve los grelos en el agua con sal de la pasta unos 5 minutos antes de añadir la pasta y cuécelos juntos.', 'Faites blanchir le brocoli-rave dans l’eau salée des pâtes environ 5 minutes avant d’ajouter les pâtes, puis faites cuire le tout ensemble.', 'Stängelkohl etwa 5 Minuten im gesalzenen Nudelwasser kochen, bevor die Pasta dazukommt, dann beides zusammen garen.', '下面前先把芜菁嫩叶放入加盐的煮面水中煮约 5 分钟，再下面一起煮。', 'पास्ता डालने से पहले शलजम के पत्तों को पास्ता के नमक वाले पानी में लगभग 5 मिनट उबालें, फिर दोनों को साथ पकाएँ।'),
  toss: L('Drain and toss the pasta in the pan for a minute, adding a little cooking water if needed.', 'Scola e salta la pasta in padella per un minuto, aggiungendo un po’ d’acqua di cottura se serve.', 'Escurre y saltea la pasta en la sartén un minuto, añadiendo un poco de agua de cocción si hace falta.', 'Égouttez et faites sauter les pâtes une minute dans la poêle, en ajoutant un peu d’eau de cuisson si besoin.', 'Abgießen und die Pasta eine Minute in der Pfanne schwenken, bei Bedarf etwas Kochwasser zugeben.', '沥干后放入锅中翻拌一分钟，需要时加点煮面水。', 'पानी निकालें और पास्ता को एक मिनट पैन में मिलाएँ, ज़रूरत हो तो थोड़ा पकाने का पानी डालें।'),
  drain: L('Drain the pasta into a warm bowl.', 'Scola la pasta in una ciotola calda.', 'Escurre la pasta en un bol caliente.', 'Égouttez les pâtes dans un saladier chaud.', 'Pasta abgießen und in eine warme Schüssel geben.', '把面沥干，放入温热的碗中。', 'पास्ता का पानी निकालकर उसे गरम कटोरे में डालें।'),
  pesto: L('Off the heat, stir in the pesto (never cook it), loosening it with a little cooking water.', 'A fuoco spento, aggiungi il pesto (senza mai cuocerlo), allungandolo con un po’ d’acqua di cottura.', 'Fuera del fuego, incorpora el pesto (sin cocinarlo nunca), aligerándolo con un poco de agua de cocción.', 'Hors du feu, incorporez le pesto (sans jamais le cuire), en le détendant avec un peu d’eau de cuisson.', 'Vom Herd nehmen und das Pesto unterrühren (nie kochen), mit etwas Kochwasser lockern.', '离火后拌入青酱（不要加热），用少许煮面水稀释。', 'आँच बंद करके पेस्तो मिलाएँ (इसे कभी न पकाएँ), थोड़े पकाने के पानी से ढीला करें।'),
  egg: L('Off the heat, stir in the egg yolks beaten with a little cooking water until creamy.', 'A fuoco spento, manteca con i tuorli sbattuti con un po’ d’acqua di cottura fino a ottenere una crema.', 'Fuera del fuego, incorpora las yemas batidas con un poco de agua de cocción hasta que quede cremoso.', 'Hors du feu, incorporez les jaunes battus avec un peu d’eau de cuisson jusqu’à obtenir une crème.', 'Vom Herd nehmen und die mit etwas Kochwasser verquirlten Eigelbe cremig unterrühren.', '离火后拌入用少许煮面水打散的蛋黄，搅拌至顺滑。', 'आँच बंद करके थोड़े पकाने के पानी में फेंटी हुई ज़र्दी मिलाएँ जब तक क्रीमी न हो जाए।'),
  mozzarella: L('Add the diced mozzarella at the end so it just starts to melt.', 'Aggiungi alla fine la mozzarella a cubetti, così inizia appena a fondere.', 'Añade al final la mozzarella en dados para que empiece a fundirse.', 'Ajoutez la mozzarella en dés à la fin pour qu’elle commence juste à fondre.', 'Gewürfelte Mozzarella zum Schluss zugeben, damit sie gerade anschmilzt.', '最后加入切丁的马苏里拉，让它刚好开始融化。', 'आख़िर में कटी हुई मोज़ेरेला डालें ताकि वह बस पिघलना शुरू करे।'),
  cheese: L('Finish with grated {list}.', 'Completa con {list} grattugiato.', 'Termina con {list} rallado.', 'Terminez avec {list} râpé.', 'Mit geriebenem {list} vollenden.', '最后撒上擦碎的{list}。', 'ऊपर से कद्दूकस किया {list} डालें।'),
  herbs: L('Scatter over {list}.', 'Completa con {list}.', 'Termina con {list}.', 'Parsemez de {list}.', 'Mit {list} bestreuen.', '撒上{list}。', 'ऊपर से {list} डालें।'),
  pepper: L('Finish with freshly ground black pepper.', 'Completa con pepe nero macinato al momento.', 'Termina con pimienta negra recién molida.', 'Terminez avec du poivre noir fraîchement moulu.', 'Mit frisch gemahlenem schwarzem Pfeffer vollenden.', '最后撒上现磨黑胡椒。', 'ऊपर से ताज़ी पिसी काली मिर्च डालें।'),
  breadcrumbs: L('Toast the breadcrumbs in a dry pan and scatter them on top.', 'Tosta il pangrattato in una padella asciutta e spargilo sopra.', 'Tuesta el pan rallado en una sartén seca y espárcelo por encima.', 'Faites griller la chapelure à sec et parsemez-en le plat.', 'Semmelbrösel in einer trockenen Pfanne rösten und darüberstreuen.', '在干锅中把面包屑炒香，撒在上面。', 'ब्रेडक्रम्ब्स को सूखे पैन में भूनें और ऊपर छिड़कें।'),
};
const FAT = {
  oil: L('the olive oil', 'l’olio', 'el aceite', 'l’huile', 'das Olivenöl', '橄榄油', 'जैतून का तेल'),
  butter: L('the butter', 'il burro', 'la mantequilla', 'le beurre', 'die Butter', '黄油', 'मक्खन'),
  both: L('the butter and olive oil', 'il burro e l’olio', 'la mantequilla y el aceite', 'le beurre et l’huile', 'Butter und Olivenöl', '黄油和橄榄油', 'मक्खन और जैतून का तेल'),
  basic: L('a little olive oil', 'un filo d’olio', 'un chorrito de aceite', 'un filet d’huile', 'etwas Olivenöl', '少许橄榄油', 'थोड़ा जैतून का तेल'),
};
const AND = { en: ' and ', it: ' e ', es: ' y ', fr: ' et ', de: ' und ', zh: '、', hi: ' और ' };
const WITH = {
  en: '{pasta} with {list}',
  it: '{pasta} con {list}',
  es: '{pasta} con {list}',
  fr: '{pasta} avec {list}',
  de: '{pasta} mit {list}',
  zh: '{pasta}配{list}',
  hi: '{list} के साथ {pasta}',
};

const ingName = (id, lang) => {
  const n = INGREDIENTS.find((i) => i.id === id)?.name?.[lang] || id;
  // inside a sentence: lower case, except names of protected cheeses (and nouns in German)
  if (['pecorino', 'parmigiano'].includes(id) || lang === 'de') return n;
  // "Genoese" keeps its capital in English
  return lang === 'en' && id === 'pesto' ? n.charAt(0) + n.slice(1).toLocaleLowerCase('en') : n.toLocaleLowerCase(lang);
};
const joinList = (items, lang) => (items.length < 2 ? items.join('') : lang === 'zh' ? items.join('、') : `${items.slice(0, -1).join(', ')}${AND[lang]}${items[items.length - 1]}`);
const perLang = (fn) => Object.fromEntries(LANGS.map((l) => [l, fn(l)]));

/** A creative recipe for any pasta and any ingredients (null when nothing is chosen). */
export function creativeRecipe(pasta, ingredients) {
  const p = RECIPE_PASTAS.find((x) => x.id === pasta);
  const ings = (ingredients || []).filter((id) => QTY[id]);
  if (!p || !ings.length) return null;
  const has = (id) => ings.includes(id);
  const lasagne = pasta === 'lasagne';
  const fat = has('butter') && has('oliveoil') ? FAT.both : has('butter') ? FAT.butter : has('oliveoil') ? FAT.oil : FAT.basic;
  const aromatics = ['garlic', 'chilli', 'sage'].filter(has);
  const pan = ['butter', 'oliveoil', ...aromatics, 'guanciale', 'anchovy', 'aubergine', 'clams', 'tomato', 'ragu'].some(has);

  const steps = [];
  const add = (key, vars = {}) => steps.push(perLang((l) => fill(S[key][l], typeof vars === 'function' ? vars(l) : vars)));
  if (pan) {
    if (aromatics.length) add('warm', (l) => ({ fat: fat[l], list: joinList(aromatics.map((a) => ingName(a, l)), l) }));
    else add('warmPlain', (l) => ({ fat: fat[l] }));
    for (const id of ['guanciale', 'anchovy', 'aubergine', 'clams', 'tomato', 'ragu']) if (has(id)) add(id);
  }
  if (has('bechamel')) add('bechamel');
  if (has('broth') && !lasagne) {
    add('broth');
    add('pastaBroth');
  } else if (lasagne) add('lasagne');
  else {
    if (has('cimedirapa')) add('cimedirapa');
    add(FILLED.has(pasta) || pasta === 'gnocchi' ? 'pastaSoft' : 'pasta');
    add(pan || has('bechamel') ? 'toss' : 'drain');
  }
  // (in lasagne, pesto, egg and mozzarella go into the layers)
  if (has('pesto') && !lasagne) add('pesto');
  if (has('egg') && !lasagne) add('egg');
  if (has('mozzarella') && !lasagne) add('mozzarella');
  const cheeses = ['parmigiano', 'pecorino', 'ricottasalata'].filter(has);
  if (cheeses.length) add('cheese', (l) => ({ list: joinList(cheeses.map((c) => ingName(c, l)), l) }));
  const herbs = ['basil', 'parsley'].filter(has);
  if (herbs.length) add('herbs', (l) => ({ list: joinList(herbs.map((h) => ingName(h, l)), l) }));
  if (has('pepper')) add('pepper');
  if (has('breadcrumbs')) add('breadcrumbs');

  const qtyKey = lasagne ? 'lasagne' : pasta === 'gnocchi' ? 'gnocchi' : FILLED.has(pasta) ? 'filled' : 'default';
  const pastaIn = (l) => (l === 'de' || l === 'zh' || l === 'hi' ? p.name[l] : p.name[l].toLocaleLowerCase(l));
  const quantities = [perLang((l) => fill(QTY_PASTA[qtyKey][l], { pasta: pastaIn(l) })), ...ings.map((id) => QTY[id]), SALT];
  const title = perLang((l) => fill(WITH[l], { pasta: p.name[l], list: joinList(ings.map((id) => ingName(id, l)), l) }));
  return {
    id: `creative-${pasta}-${[...ings].sort().join('-')}`,
    pasta,
    creative: true,
    name: title.it,
    title,
    need: [...ings],
    may: [],
    quantities,
    steps,
  };
}

// one unexpected pairing for every pasta shape, to start experimenting
const IDEAS = {
  spaghetti: ['pesto', 'clams'],
  bucatini: ['butter', 'sage', 'breadcrumbs'],
  tagliatelle: ['aubergine', 'mozzarella', 'basil'],
  penne: ['pesto', 'guanciale', 'pecorino'],
  maccheroni: ['bechamel', 'guanciale', 'parmigiano'],
  rigatoni: ['aubergine', 'ragu', 'ricottasalata'],
  fusilli: ['pesto', 'tomato', 'mozzarella'],
  trofie: ['tomato', 'anchovy', 'breadcrumbs'],
  orecchiette: ['tomato', 'ricottasalata', 'basil'],
  farfalle: ['butter', 'sage', 'parmigiano'],
  reginette: ['cimedirapa', 'anchovy', 'chilli'],
  cavatappi: ['bechamel', 'cimedirapa', 'parmigiano'],
  conchiglie: ['clams', 'tomato', 'parsley'],
  anelli: ['broth', 'parmigiano', 'parsley'],
  lasagne: ['pesto', 'mozzarella', 'bechamel'],
  tortellini: ['pesto', 'parmigiano'],
  gnocchi: ['cimedirapa', 'garlic', 'chilli'],
  ravioli: ['tomato', 'chilli', 'basil'],
};
/** The creative idea for a pasta shape (every shape has one). */
export const ideaFor = (pasta) => (IDEAS[pasta] ? creativeRecipe(pasta, IDEAS[pasta]) : null);
export const IDEA_PASTAS = Object.keys(IDEAS);
