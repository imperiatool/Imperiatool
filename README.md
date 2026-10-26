# Imperia: builder di sticker e charm componibili

Web app in **React + Tailwind CSS** per comporre personaggi a partire da file **SVG vettoriali**: l'utente sceglie corpo, occhi, bocca e accessori, li trasforma sulla tela (scala, rotazione, stiramento X/Y), li ricolora **solo con la palette del brand**, poi scarica lo sticker oppure richiede un **Charm 3D**.

Il **pannello Admin** importa file SVG con più elementi (anche esportati da Illustrator con stili in CSS e livelli nascosti), li separa automaticamente e li assegna alle categorie.

---

## Funzionalità

L'app si apre su una **home** con tre schede bianche arrotondate (Case, Charm, Sticker) come le linee prodotto di imperia.com. In alto: menu rosso (pagine e lingua), logo Imperia al centro, **account** e **carrello**. Grafica bianco e rosso **#e1201b** (lo stesso del logo), font **Inter**, titoli di pagina identici in tutte le sezioni.

| Area | Cosa fa |
| --- | --- |
| **Case** | Custodia per telefono in 3D, ruotabile a 360° con zoom, su una pagina prodotto stile imperia.com. 6 pattern di pasta in rilievo (Spaghetti, Tagliatelle, Ravioli, Reginette, Lasagne, Raviolo), scelti con cerchi disegnati dalle icone della confezione. Colori Pomodoro, Basilico, Ragù, Uovo, Farina. 3 finiture. **Ogni modello di telefono ha il suo 3D** (misure, angoli, fori fotocamera, tasti: `PHONE_MODELS` in `src/lib/cover3d.js`). |
| **Carrello e account** | Case e charm si aggiungono al carrello; il checkout chiede i dati e salva l'ordine (Admin → Ordini, o `VITE_ORDER_ENDPOINT`). L'account salva i dati del cliente sul dispositivo e mostra i suoi ordini. |
| **Confezione 3D** | Pulsante "Confezione": la scatola 100×190×25 mm stampata con la fustella di `Phone_Cases.svg`, personalizzata con nome della pasta in alto (lettering di `Pasta Names`), "phone case", colore, finitura, materiale e compatibilità sul retro, nome sul fianco, cerchio del colore scelto. La finestra sotto il logo ha esattamente la forma curva disegnata e mostra la custodia. Il cartoncino cambia con la finitura (carta naturale, satinato, soft-touch). Codice: `src/lib/packaging3d.js`. |
| **Charm** | Si parte sempre da tela vuota ("Costruisci il tuo personaggio"). Passi Corpo → Occhi → Bocca senza salti automatici: si va avanti con "Avanti" e la barra mostra cosa manca. Colori a cerchi grandi, dimensione/rotazione/stiramento e spessore del contorno sempre visibili. In 3D il colore del contorno riveste tutti i fianchi dell'estrusione. Attacchi visibili in 3D: laccetto con moschettone, portachiavi, catenina a sfere. |
| **Sticker** | Un solo pulsante: **Condividi** su telefono (si apre il menu di condivisione: WhatsApp, Instagram, Telegram…) oppure **Copia** su computer (poi Ctrl/⌘+V in qualsiasi chat). Sotto, "Scarica PNG". Contorno bianco calcolato con una trasformata di distanza: continuo, preciso, senza buchi. |
| **Finiture** | **Raw**: pasta cruda opaca e granulosa. **Al dente**: plastica soft-touch satinata. **Overcooked**: silicone morbido. Valgono per charm, custodie e confezione (`src/lib/three/materials.js`). |
| **Lingue e valute** | Inglese (£), italiano, spagnolo, francese, tedesco (€), cinese semplificato (¥) e hindi (₹), con bandierine. Prezzi definiti in euro in `src/data/defaults.js`, convertiti con i cambi in `src/i18n/index.js` (`CURRENCIES`). L'Admin resta in inglese per tedesco, cinese e hindi. |
| **Import SVG (Admin)** | Legge i livelli, riconosce quelli nascosti, converte le classi CSS, separa gli elementi. I colori predefiniti vengono portati sulla palette (il nero diventa Ragù). |
| **Livelli stile Photoshop** | Trascina per riordinare, primo piano/sfondo, nascondi, blocca, annulla/ripeti. |
| **Palette vincolata** | Solo i colori del brand definiti in Admin → Palette. |
| **Admin protetto e nascosto** | Nessun link visibile: si apre solo dall'indirizzo `…/#/admin`. Password (hash SHA-256), blocco dopo 5 tentativi, sessione di 8 ore. |

### Sticker: perché non c'è un pulsante "aggiungi a WhatsApp"

Un sito web non può inserire uno sticker direttamente nelle app: WhatsApp, per esempio, trasforma in foto qualsiasi immagine ricevuta. La strada più semplice è condividere o incollare il PNG trasparente (funziona ovunque). Per averlo come vero sticker WhatsApp: pannello sticker → *+ Crea* → scegli l'immagine (consiglio mostrato nell'app).

### Imperia® Events (concept)

Quarta sezione (`#/events`): programma di esperienze **illustrative** in Italia e Inghilterra.

- Dati: `src/data/events.js` (testi in inglese e italiano, le altre lingue usano l'inglese). Prezzi nella valuta del Paese dell'evento (€ Italia, £ Inghilterra), senza conversioni.
- Filtri combinabili (tipo, luogo, formato, prezzo), salvati nell'indirizzo della pagina: tornando indietro restano attivi.
- Ogni evento ha un oggetto di pasta 3D (`src/lib/pasta3d.js`) fatto con lo stesso studio e gli stessi materiali Crudo / Al Dente / Stracotto di custodie e charm: nella pagina dell'evento è in 3D dal vivo, nelle schede è un'immagine generata dallo stesso motore (`scripts/render-events.py`, da rilanciare se cambi forme o colori).
- Prenotazione **demo**: partecipanti, totale, nome ed email con validazione, conferma con riferimento DEMO. Nessun pagamento, nessuna email, nessun dato inviato.
- Eventi, luoghi, date e posti sono di fantasia e indicati come tali nell'app.

### Dati da verificare (da completare con le schede tecniche)

- **Modelli di telefono** (`src/lib/cover3d.js`, `PHONE_MODELS`): misure = dimensioni ufficiali del telefono + ~2,7 mm di custodia; posizione e forma delle fotocamere, dei tasti e delle aperture in basso (USB-C, altoparlante, microfono) sono ricavate dalle foto, non da file CAD. Prima della produzione vanno confrontate con i disegni tecnici.
- **Materiale e protezione** della custodia: un'unica fonte, `PACK_FINISH` in `src/lib/packaging3d.js` (scatola) + chiavi `spec.material.*` / `spec.protection.*` nelle lingue (app). Un test controlla che app e scatola dicano la stessa cosa. Verificati dall'artwork della scatola solo i valori **Al Dente** ("Polycarbonate (PC) · Satin finish", "Scratch-resistant"); quelli di Raw e Overcooked vanno confermati.
- **Charm**: il materiale non è indicato perché non c'è un dato verificato; si aggiunge in `OrderModal.jsx` (riga `spec.material`).

## Avvio rapido

Requisiti: **Node.js 20.19+** (consigliato 22) e npm.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # test unitari (Vitest)
npm run build      # build di produzione in dist/
npm run preview    # anteprima della build
npm run admin:hash -- "la tua password"   # genera l'hash della password admin
```

- Home: `http://localhost:5173/` · Case: `#/case` · Charm: `#/charm` · Sticker: `#/sticker`
- Admin (nessun link nel menu): `http://localhost:5173/#/admin`, online `https://imperiatool.vercel.app/#/admin`

Al primo accesso ad `/admin` ti viene chiesto di creare la password (se non hai impostato `VITE_ADMIN_PASSWORD_HASH`, vedi sotto).

Al primo avvio la libreria viene popolata importando `src/data/seed/pasta-characters.svg` (il file di esempio, senza le immagini raster di ispirazione) con la **stessa pipeline** del pannello Admin.

## Struttura del progetto

```
imperiatool/
├── .github/workflows/deploy.yml   # CI: test + build + deploy su GitHub Pages
├── public/favicon.svg
├── scripts/hash-password.mjs      # npm run admin:hash -- "password"
├── src/
│   ├── main.jsx · App.jsx · index.css
│   ├── assets/imperia-logo.svg     # logo con "dal 1932"
│   ├── assets/packaging/          # fustella, finestra, icone e lettering della confezione
│   ├── i18n/                      # index.js (useI18n, valute) + en/it/es/fr/de/zh/hi.js
│   ├── data/
│   │   ├── defaults.js            # palette, categorie, opzioni e prezzi Charm
│   │   ├── labels.js              # traduzioni della libreria di esempio
│   │   ├── seedLibrary.js
│   │   └── seed/pasta-characters.svg
│   ├── lib/                       # logica pura, senza React
│   │   ├── three/                 # studio 3D condiviso, materiali, geometrie
│   │   ├── cover3d.js             # custodie per modello e pattern di pasta
│   │   ├── packaging3d.js         # confezione 3D personalizzata
│   │   ├── translate.js           # traduttore integrato del browser
│   │   ├── svgParser.js           # import SVG, livelli, separazione, zone colore
│   │   ├── composition.js         # posizionamento, Randomizza
│   │   ├── geometry.js            # trasformazioni
│   │   ├── exportImage.js         # PNG con contorno fustellato, condividi/copia
│   │   ├── charm3d.js             # charm 3D estruso dagli SVG
│   │   ├── auth.js                # password admin, sessione, blocco tentativi
│   │   ├── colors.js · id.js
│   ├── store/                     # useLibraryStore, useEditorStore (zustand)
│   ├── hooks/useLibrary.js
│   ├── services/orderService.js   # punto di aggancio per l'e-commerce
│   ├── components/
│   │   ├── layout/Header.jsx
│   │   ├── ui/                    # Button, Modal, Slider, Swatches, LabelsEditor…
│   │   ├── cover/                 # CoverPage, PatternIcon
│   │   ├── order/                 # CheckoutForm, MaterialPicker (condivisi)
│   │   ├── three/Viewer3D.jsx     # visore 3D con zoom, ricentra, rotazione
│   │   ├── editor/                # EditorPage (charm/sticker), StickerCanvas, LayersPanel,
│   │   │                          # PropertiesPanel, AssetPicker, ExportModal, OrderModal
│   │   └── admin/                 # AdminPage (+login), Import, Assets, Categories,
│   │                              # Palette, Orders, Data, Security
│   └── __tests__/                 # test unitari (Vitest)
├── .env.example · index.html · package.json · vite.config.js
```

Three.js viene scaricato solo quando serve una vista 3D, così l'editor resta leggero.

### Modello dati

```js
// Elemento della libreria
{ id, categoryId, name, width, height,
  markup: '<g …><path fill="{{s0}}" stroke="{{s1}}" …/></g>',   // segnaposto colore
  slots: [{ id: 's0', kind: 'fill', label: 'Base', original: '#e3201b' }, …] }

// Elemento sulla tela
{ uid, assetId, categoryId, x, y, scale, stretchX, stretchY, rotation, flipX, flipY,
  colors: { s0: '#1a5632' } }
```

### Preparare i file SVG (consigli per il designer)

1. Un livello per categoria (es. `Body`, `Eyes`, `Mouths`) e, idealmente, **un gruppo `<g>` per elemento**: è il caso più affidabile.
2. Se un elemento è fatto di forme sciolte (come la coppia di occhi), lasciale vicine tra loro e ben distanziate dagli altri elementi: l'import le unisce per vicinanza.
3. Usa i colori della palette direttamente nel file: diventano i colori predefiniti delle zone.
4. Testi: convertili in tracciati prima di esportare.

## Password dell'Admin

Ci sono due modi per impostarla:

1. **Consigliato per il sito pubblicato:** genera l'hash con `npm run admin:hash -- "la tua password"` e salvalo su GitHub in **Settings → Secrets and variables → Actions → New repository secret** con nome `ADMIN_PASSWORD_HASH`. Il workflow lo passa alla build (`VITE_ADMIN_PASSWORD_HASH`). In locale puoi metterlo in `.env.local`.
2. **Senza configurazione:** al primo accesso ad `/admin` l'app chiede di creare una password, salvata (come hash) in quel browser. La puoi cambiare da Admin → Password.

**Limite importante:** il sito è statico (GitHub Pages), quindi la password protegge l'**interfaccia** Admin. Libreria e ordini vivono nel browser di ciascun visitatore: chi aggira il blocco modifica solo la propria copia. Per più amministratori con dati condivisi serve un backend con autenticazione vera (es. Supabase Auth), oppure proteggere l'intero sito con un servizio come Cloudflare Access.

## Passare a un backend (quando serve)

- **Libreria condivisa:** esporta la libreria da Admin → Backup e usala come seed, oppure collega `useLibraryStore` a un'API (Supabase, Firebase, REST) cambiando l'opzione `storage` di `persist`.
- **Ordini:** imposta `VITE_ORDER_ENDPOINT` (su GitHub: variabile `ORDER_ENDPOINT`) per inviare l'ordine in POST, oppure sostituisci `submitOrder` in `src/services/orderService.js` con Shopify, WooCommerce o Stripe Checkout.

---

## Pubblicare su GitHub: passo per passo

### 1. Prerequisiti (una tantum)

```bash
git --version                                   # verifica che Git sia installato
git config --global user.name  "Il Tuo Nome"
git config --global user.email "tua@email.com"
```

### 2. Crea il repository vuoto su GitHub

Su <https://github.com/new>: nome `imperiatool` (se l'hai già creato salta questo punto), visibilità a scelta, **senza** README, .gitignore o licenza (li abbiamo già). Clicca **Create repository**.

### 3. Inizializza Git e fai il primo commit

Dalla cartella del progetto:

```bash
cd imperiatool
git init -b main
git add .
git status                      # controlla: node_modules e dist NON devono comparire
git commit -m "Primo commit: Imperia builder di sticker SVG"
```

> Se hai scaricato l'archivio già pronto, il repository è già inizializzato con il primo commit: salta `git init` e il commit e vai al punto 4.

### 4. Collega il remoto e fai il push

```bash
git remote add origin https://github.com/<TUO-UTENTE>/imperiatool.git
git push -u origin main
```

Per l'autenticazione HTTPS GitHub chiede un **Personal Access Token** al posto della password (Settings → Developer settings → Personal access tokens). In alternativa usa SSH (`git@github.com:<TUO-UTENTE>/imperiatool.git`) oppure la GitHub CLI:

```bash
gh auth login
gh repo create imperiatool --private --source=. --remote=origin --push
```

### 5. (Opzionale) Pubblica online con GitHub Pages

Il workflow `.github/workflows/deploy.yml` esegue test e build e pubblica `dist/` a ogni push su `main`.

1. Su GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Fai un push (o lancia il workflow da **Actions → Deploy su GitHub Pages → Run workflow**).
3. L'app sarà su `https://<TUO-UTENTE>.github.io/imperiatool/`.
4. (Facoltativo) aggiungi il secret `ADMIN_PASSWORD_HASH` prima del deploy, così la password vale per tutti i browser.

Grazie a `base: './'` in `vite.config.js` e all'HashRouter non serve altra configurazione.

### 6. Lavoro quotidiano

```bash
git checkout -b feature/accessori     # nuovo ramo per una modifica
# … modifiche …
git add -A
git commit -m "Aggiunge categoria Accessori con cappelli"
git push -u origin feature/accessori  # poi apri una Pull Request su GitHub
```
