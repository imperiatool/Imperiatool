# Imperia: builder di sticker e charm componibili

Web app in **React + Tailwind CSS** per comporre personaggi a partire da file **SVG vettoriali**: l'utente sceglie corpo, occhi, bocca e accessori, li trasforma sulla tela (scala, rotazione, stiramento X/Y), li ricolora **solo con la palette del brand**, poi scarica lo sticker oppure richiede un **Charm 3D**.

Il **pannello Admin** importa file SVG con più elementi (anche esportati da Illustrator con stili in CSS e livelli nascosti), li separa automaticamente e li assegna alle categorie.

---

## Funzionalità

L'app ha tre prodotti, nell'ordine delle schede: **Cover** (pagina iniziale), **Charm** e **Sticker**.

| Area | Cosa fa |
| --- | --- |
| **Cover** | Cover per telefono in 3D, ruotabile a 360° con zoom. 6 pattern di pasta in rilievo: Raviolo (bordo pizzicato), Ravioli (cuscinetti trapuntati), Sfoglia (linee tratteggiate), Tagliatelle (onde), Spaghetti (righe sottili), Spighe (trecce). Colore dalla palette del brand, 3 materiali, modello di telefono, prezzo e ordine. I pattern sono generati via codice (`src/lib/cover3d.js`): se ne aggiungono altri scrivendo una funzione d'altezza. |
| **Charm** | Editor del personaggio a passi guidati (1 Corpo → 2 Occhi → 3 Bocca, con avanzamento automatico), poi "Vedi in 3D e ordina": charm estruso con tratti/contorni in rilievo, forme tonde lisce, 3 materiali. |
| **Sticker** | Stesso personaggio del Charm; "Scarica lo sticker": PNG trasparente con bordo fustellato completo (sottile/spesso, colore a scelta), sticker WhatsApp, SVG in "Altri formati". |
| **Materiali** | **Raw**: pasta cruda opaca con grana e puntini di semola visibili zoomando. **Al dente**: plastica morbida satinata. **Overcooked**: silicone morbido, bordi gonfi e rimbalzo "gelatina" quando lo selezioni. Valgono sia per i charm sia per le cover (`src/lib/three/materials.js`). |
| **Lingue** | Inglese, spagnolo, francese, italiano con bandierine. Alla prima visita si usa automaticamente la lingua del dispositivo (inglese se non è tra le quattro). Nomi di elementi, categorie e colori tradotti; in Admin il pulsante "Traduci automaticamente" usa il traduttore integrato di Chrome/Edge recenti (gratuito, senza chiavi). |
| **Import SVG (Admin)** | Legge i livelli, riconosce quelli nascosti, converte le classi CSS, separa gli elementi (le forme vicine vengono unite, es. una coppia di occhi). |
| **Livelli stile Photoshop** | Trascina per riordinare, primo piano/sfondo, nascondi, blocca, annulla/ripeti. |
| **Palette vincolata** | Solo i colori del brand definiti in Admin → Palette. |
| **Admin protetto** | Password (hash SHA-256), blocco dopo 5 tentativi, sessione di 8 ore, logout, cambio password. |

### Sticker WhatsApp: come funziona davvero

WhatsApp **converte in JPG qualsiasi immagine inviata direttamente in chat**, anche se è PNG/WebP trasparente: un sito web non può forzare l'invio "come sticker". Per questo l'app genera il file nel formato ufficiale degli sticker (**WebP 512×512, trasparente, margine 16 px, max 100 KB**) e mostra all'utente come aggiungerlo dal pannello sticker:

- **WhatsApp Web / Desktop:** chat → icona sticker → *Crea* → scegli il file salvato.
- **iPhone (iOS 17+):** salva in Foto → chat → icona sticker → *Crea sticker*.
- **Android:** *Crea* dal pannello sticker se la versione lo prevede, altrimenti un'app per pacchetti sticker che importa WebP.

Le istruzioni del dispositivo in uso vengono mostrate per prime. Su Safari vecchi, che non sanno generare WebP, viene creato un PNG con le stesse caratteristiche.

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

- Cover: `http://localhost:5173/#/cover` · Charm: `#/charm` · Sticker: `#/sticker`
- Admin: `http://localhost:5173/#/admin`

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
│   ├── assets/imperia-logo.svg
│   ├── i18n/                      # index.js (useI18n) + en/es/fr/it.js
│   ├── data/
│   │   ├── defaults.js            # palette, categorie, opzioni e prezzi Charm
│   │   ├── labels.js              # traduzioni della libreria di esempio
│   │   ├── seedLibrary.js
│   │   └── seed/pasta-characters.svg
│   ├── lib/                       # logica pura, senza React
│   │   ├── three/                 # studio 3D condiviso, materiali, geometrie
│   │   ├── cover3d.js             # cover procedurale e pattern di pasta
│   │   ├── translate.js           # traduttore integrato del browser
│   │   ├── svgParser.js           # import SVG, livelli, separazione, zone colore
│   │   ├── composition.js         # posizionamento, Randomizza
│   │   ├── geometry.js            # trasformazioni
│   │   ├── exportImage.js         # SVG/PNG, sticker WhatsApp, condivisione
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

Three.js viene scaricato solo quando si apre "Ordina Charm 3D", così l'editor resta leggero.

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
