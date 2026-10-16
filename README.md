# StickerLab: builder di sticker e charm componibili

Web app in **React + Tailwind CSS** per comporre personaggi a partire da file **SVG vettoriali**: l'utente sceglie corpo, occhi, bocca e accessori, li trasforma sulla tela (scala, rotazione, stiramento X/Y), li ricolora **solo con la palette del brand**, poi scarica lo sticker oppure richiede un **Charm 3D**.

Il **pannello Admin** importa file SVG con più elementi (anche esportati da Illustrator con stili in CSS e livelli nascosti), li separa automaticamente e li assegna alle categorie.

---

## Funzionalità

| Area | Cosa fa |
| --- | --- |
| **Import SVG (Admin)** | Legge i livelli (`<g>` di primo livello), riconosce quelli nascosti (`display:none`), converte le classi CSS (`.st5{…}`) in attributi, separa gli elementi: un `<g>` = un elemento, mentre le forme sciolte vicine vengono unite (es. una coppia di occhi composta da 4 tracciati). Distanza di unione regolabile, modalità *Ogni figlio* / *Livello intero*, unione manuale. |
| **Zone colore** | Ogni coppia (riempimento/tratto, colore) diventa una zona ricolorabile. Le sagome disegnate solo col contorno ricevono un riempimento "Base" e vengono spostate dietro ai dettagli (es. le pupille restano sopra). |
| **CRUD (Admin)** | Categorie (ordine, sovrapposizione, forma base, multi-elemento, Randomizza, posizione e dimensione predefinite), elementi (rinomina, categoria, colori predefiniti, sostituisci disegno, elimina), palette (HEX/RGB, ordine), ordini, backup JSON. |
| **Editor** | Maniglie sulla tela: angoli = scala, quadratini laterali = stiramento X/Y, pallino rosso = rotazione (Shift = scatti di 15°). Cursori di precisione, specchia/capovolgi, livelli, duplica, annulla/ripeti (Ctrl+Z / Ctrl+Shift+Z), frecce per spostare, aggancio al centro. |
| **Palette vincolata** | Nessun color picker libero: solo i colori definiti in Admin → Palette. |
| **Randomizza** | Combinazione casuale con colori della palette scelti per avere contrasto (corpo, elementi, dettagli). |
| **Crea Sticker** | PNG (512/1024/2048 px) con bordo fustellato opzionale, SVG vettoriale, condivisione nativa su mobile (Web Share API). |
| **Ordina Charm 3D** | Riepilogo del design (elementi, colori, trasformazioni), formato/finitura/attacco/quantità, dati cliente, validazione. Il payload JSON è pronto per un e-commerce. |

## Avvio rapido

Requisiti: **Node.js 20.19+** (consigliato 22) e npm.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # test unitari (Vitest)
npm run build      # build di produzione in dist/
npm run preview    # anteprima della build
```

- Editor: `http://localhost:5173/#/`
- Admin: `http://localhost:5173/#/admin`

Al primo avvio la libreria viene popolata importando `src/data/seed/pasta-characters.svg` (il file di esempio, senza le immagini raster di ispirazione) con la **stessa pipeline** del pannello Admin.

## Struttura del progetto

```
sticker-builder/
├── .github/workflows/deploy.yml   # CI: test + build + deploy su GitHub Pages
├── public/favicon.svg
├── src/
│   ├── main.jsx                   # entry point (HashRouter)
│   ├── App.jsx                    # layout, rotte, seed iniziale
│   ├── index.css                  # Tailwind v4 + token del brand (@theme)
│   ├── data/
│   │   ├── defaults.js            # palette, categorie, opzioni Charm, dimensione tela
│   │   ├── seedLibrary.js         # import del file di esempio al primo avvio
│   │   └── seed/pasta-characters.svg
│   ├── lib/                       # logica pura, senza React
│   │   ├── svgParser.js           # parsing SVG, CSS→attributi, livelli, separazione, zone colore, render
│   │   ├── composition.js         # creazione/posizionamento elementi, Randomizza
│   │   ├── geometry.js            # trasformazioni e coordinate della tela
│   │   ├── exportImage.js         # SVG finale, PNG, download, condivisione
│   │   ├── colors.js              # normalizzazione colori, contrasto
│   │   └── id.js
│   ├── store/
│   │   ├── useLibraryStore.js     # categorie, elementi, palette (persistiti)
│   │   └── useEditorStore.js      # elementi sulla tela, selezione, undo/redo
│   ├── hooks/useLibrary.js
│   ├── services/orderService.js   # punto di aggancio per l'e-commerce
│   ├── components/
│   │   ├── layout/Header.jsx
│   │   ├── ui/                    # Button, Modal, Slider, Swatches, Toggle, AssetThumb…
│   │   ├── editor/                # EditorPage, StickerCanvas, AssetPicker, PropertiesPanel, ExportModal, OrderModal
│   │   └── admin/                 # AdminPage, ImportTab, AssetsTab, CategoriesTab, PaletteTab, OrdersTab, DataTab
│   └── __tests__/                 # test unitari
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

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

## Passare a un backend (quando serve)

Oggi libreria e ordini vivono nel `localStorage` del browser: perfetto per prototipo e demo, **non** per più amministratori.

- **Libreria condivisa:** esporta la libreria da Admin → Backup e sostituisci il seed con quel JSON, oppure collega `useLibraryStore` a un'API (Supabase, Firebase, un endpoint REST) cambiando l'opzione `storage` di `persist`.
- **Ordini:** imposta `VITE_ORDER_ENDPOINT` in `.env.local` per inviare l'ordine in POST, oppure sostituisci `submitOrder` in `src/services/orderService.js` con Shopify Storefront API, WooCommerce REST o Stripe Checkout.
- **Admin:** `VITE_ADMIN_PIN` aggiunge un PIN lato client: è solo un deterrente. In produzione proteggi `/admin` con un'autenticazione reale.

---

## Pubblicare su GitHub: passo per passo

### 1. Prerequisiti (una tantum)

```bash
git --version                                   # verifica che Git sia installato
git config --global user.name  "Il Tuo Nome"
git config --global user.email "tua@email.com"
```

### 2. Crea il repository vuoto su GitHub

Su <https://github.com/new>: nome `sticker-builder`, visibilità a scelta, **senza** README, .gitignore o licenza (li abbiamo già). Clicca **Create repository**.

### 3. Inizializza Git e fai il primo commit

Dalla cartella del progetto:

```bash
cd sticker-builder
git init -b main
git add .
git status                      # controlla: node_modules e dist NON devono comparire
git commit -m "Primo commit: StickerLab builder di sticker SVG"
```

> Se hai scaricato l'archivio già pronto, il repository è già inizializzato con il primo commit: salta `git init` e il commit e vai al punto 4.

### 4. Collega il remoto e fai il push

```bash
git remote add origin https://github.com/<TUO-UTENTE>/sticker-builder.git
git push -u origin main
```

Per l'autenticazione HTTPS GitHub chiede un **Personal Access Token** al posto della password (Settings → Developer settings → Personal access tokens). In alternativa usa SSH (`git@github.com:<TUO-UTENTE>/sticker-builder.git`) oppure la GitHub CLI:

```bash
gh auth login
gh repo create sticker-builder --private --source=. --remote=origin --push
```

### 5. (Opzionale) Pubblica online con GitHub Pages

Il workflow `.github/workflows/deploy.yml` esegue test e build e pubblica `dist/` a ogni push su `main`.

1. Su GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Fai un push (o lancia il workflow da **Actions → Deploy su GitHub Pages → Run workflow**).
3. L'app sarà su `https://<TUO-UTENTE>.github.io/sticker-builder/`.

Grazie a `base: './'` in `vite.config.js` e all'HashRouter non serve altra configurazione.

### 6. Lavoro quotidiano

```bash
git checkout -b feature/accessori     # nuovo ramo per una modifica
# … modifiche …
git add -A
git commit -m "Aggiunge categoria Accessori con cappelli"
git push -u origin feature/accessori  # poi apri una Pull Request su GitHub
```
