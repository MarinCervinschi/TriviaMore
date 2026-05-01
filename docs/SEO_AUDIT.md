# SEO Audit — TriviaMore

> Audit eseguito il 2026-04-27 su `https://www.trivia-more.it`.
> Ordinato per **rapporto impatto / modifica al codice esistente**: prima ciò che ha alto impatto e basso costo, poi gli investimenti strategici.

---

## Stato fix (aggiornato 2026-04-27)

### ✅ Applicati nel codice (in attesa di deploy + verifica live)

| # | Fix | File | Note |
|---|---|---|---|
| 1 | Devtools production-only | `src/routes/__root.tsx:75-86` | Avvolto in `import.meta.env.DEV` — bundle più snello in prod |
| 2 | Title homepage SEO-friendly | `src/routes/_app/index.tsx:36-42` | Da `TriviaMore` → `Studia gli esami UniMore in modo organizzato \| TriviaMore` |
| 3 | Description homepage | `src/routes/_app/index.tsx:36-42` | Cita catalogo, dipartimento, corso, insegnamento, simulazioni, flashcard, dashboard, open source |
| 4 | H1 homepage | `src/components/landing/hero-section.tsx:62-69` | Mantenuto `Studia meglio, supera gli esami` (preferenza UX). Keyword UniMore già presente nel title meta, nella description, nel badge sopra l'H1 e nello stats row. |
| 5 | Subtitle hero (sotto H1) | `src/components/landing/data.ts:58-64` | Allineato al posizionamento "ecosistema" del README — cita gerarchia, modalità, dashboard |
| 6 | Title/desc dipartimento | `src/routes/_app/browse/$department/index.tsx:39-44` | Rimosso `\| Esplora` (titolo più corto, sotto i 60 char). Description fallback parla di catalogo+esami+UniMore |
| 7 | Title/desc corso | `src/routes/_app/browse/$department/$course/index.tsx:39-44` | Stessa pulizia + description con keyword UniMore |
| 8 | Title/desc classe | `src/routes/_app/browse/$department/$course/$class/index.tsx:59-64` | Stessa pulizia + description "Sezioni, quiz e flashcard per l'esame di X a UniMore" |
| 9 | Title/desc sezione (2.6k pagine) | `src/routes/_app/browse/$department/$course/$class/$section/index.tsx:34-47` | Title `${section} – ${class}`, description con `${question_count} domande di X per l'esame di Y (Z) a UniMore` — ora veicola valore reale |
| 10 | Manifest description allineato | `public/manifest.json:3-4` | Coerente con SEO description |
| 11 | Audit dei link non-www | tutto il repo | Grep eseguito: nessun `https://trivia-more.it` (no-www) hardcoded; tutti i riferimenti usano già `www.` |
| 12 | **JSON-LD ora rendered in SSR** (era CRITICO) | `src/lib/json-ld.ts`, `src/lib/seo.ts`, 5 route browse | Refactor: `json-ld.ts` ritorna oggetti puri (`JsonLd`); `seoHead` accetta `jsonLd?: JsonLd \| JsonLd[]` e lo emette via la chiave `"script:ld+json"` dentro `meta` (path TanStack `headContentUtils.js:22-29` che produce `<script type="application/ld+json">` inline in SSR). Le 5 route hanno smesso di usare `head.scripts` (che TanStack droppa per `type` custom in SSR — `Asset.js:94`). |

### ⏳ Non applicati — richiedono debug o intervento esterno

| # | Fix | Motivo / blocker | Cosa fare |
|---|---|---|---|
| 13 | Redirect apex 307 → 308 | Configurazione Vercel, non nel codice | Vercel Dashboard → Project → Domains → trivia-more.it (apex) → impostare redirect tipo permanent (308). Oppure tramite `vercel.json`/`vercel.ts`. |

### 📋 Strategici — non avviati

Vedi sezione "Investimenti strategici" più sotto. Punti A→I (Quiz/LearningResource schema, FAQPage, copy descrittivo su dept/course/class, pillar guide, internal linking laterale, backlink OSS, blog pubblico, riduzione HTML payload, image sitemap).

### 🔍 Da verificare dopo il prossimo deploy

- `<title>`, `<meta name="description">`, H1 della home reflect il nuovo copy.
- `<title>` di `/browse/{dept}` non contiene più `| Esplora`.
- `<title>` di una sezione = `${sectionName} – ${className} | TriviaMore`.
- Bundle JS della home: TanStackDevtools assente in production build.
- **JSON-LD presente in SSR** su home (`WebSite`), dipartimento/classe/sezione (`BreadcrumbList`), corso (`BreadcrumbList` + `Course`):
  ```bash
  curl -s https://www.trivia-more.it/ | grep -c "ld+json"
  curl -s https://www.trivia-more.it/browse/dscg | grep -c "ld+json"
  ```
  Atteso ≥1 su entrambe.
- [Google Rich Results Test](https://search.google.com/test/rich-results) sulla home + una pagina sezione → tipi rilevati senza errori.
- Lighthouse / PSI: LCP migliorato, CLS invariato.
- Search Console (se configurata): re-crawl manuale per le pagine principali.

---

## TL;DR — i 3 problemi che pesano di più

1. **JSON-LD codato ma non rendered nell'HTML live.** `src/lib/json-ld.ts` esporta `websiteJsonLd`, `breadcrumbJsonLd`, `courseJsonLd` e 5 route li montano via `head.scripts: [...]`, ma su home/`/browse`/`/about`/`/browse/{dept}` il sorgente HTML contiene **0 blocchi** `application/ld+json`. Tutti gli sforzi di structured data sono invisibili a Google.
2. **Homepage `<title>TriviaMore</title>` solo brand.** Zero keyword, zero contesto UniMore. Stessa storia per la meta description: "La piattaforma di quiz e flashcard per studiare meglio. Creata da studenti per studenti." — non cita mai "UniMore" né "Modena".
3. **TanStack Devtools montati in produzione.** `src/routes/__root.tsx:77-86` carica `TanStackDevtools` + `TanStackRouterDevtoolsPanel` senza guard `import.meta.env.DEV`. Bundle JS gonfiato → LCP/INP penalizzati su tutte le pagine.

Fixare questi tre dà più ROI di qualsiasi altra iniziativa SEO al momento.

---

## Cosa funziona già (non toccare)

- Canonical corretto su tutte le pagine, generato da `seoHead`.
- Redirect HTTPS+www (apex → www, http → https).
- `robots.txt` ben configurato (admin/user/auth/quiz/flashcard bloccati correttamente).
- Sitemap di produzione con 2.675 URL `https://www.…`, `lastmod` aggiornato (lo script `scripts/lib/sitemap.ts` viene rigenerato in build).
- OG/Twitter completi, `og:locale=it_IT`, `<html lang="it">`.
- PWA manifest, theme-color, icons multi-size.
- Zero `<img>` senza `alt` sulla home.
- HSTS attivo.
- Skip-link "Vai al contenuto principale" già presente in `__root.tsx`.

---

## Quick Wins — Ordine consigliato (impact alto, modifica minima)

### 1. Rimuovi i devtools dalla build production
- **File**: `src/routes/__root.tsx:77-86`
- **Modifica**: avvolgere `<TanStackDevtools …/>` in `{import.meta.env.DEV && (…)}`.
- **Effort**: ~10 min.
- **Impatto**: alto su Core Web Vitals (LCP/INP) → tutte le pagine.

### 2. Riscrivi title e description della homepage
- **File**: `src/routes/_app/index.tsx:36-42`
- **Pattern proposto**:
  - title: `TriviaMore — Quiz e Flashcard per gli esami UniMore` (~55 char)
  - description: `Quiz, simulazioni d'esame e flashcard per gli studenti UniMore. Catalogo curato per dipartimento, modalità studio o simulazione esame. Gratis e open source.`
- **Effort**: ~10 min.
- **Impatto**: alto su CTR e ranking per query branded + UniMore-related.

### 3. Aggiungi "UniMore" all'H1 della homepage
- **File**: `src/components/landing/HeroSection.tsx` (via `heroContent`)
- **Pattern**: `Studia meglio per gli esami UniMore` invece di `Studia meglio, supera gli esami`.
- **Effort**: 5 min.
- **Impatto**: medio — H1 più keyword-rich senza perdere copy.

### 4. Sistema le meta delle sezioni (2.675 URL)
- **File**: `src/routes/_app/browse/$department/$course/$class/$section/index.tsx:36-40`
- **Pattern proposto**:
  - title: `${section.name} — ${class.name} | Quiz UniMore` (rimuove "Esplora", aggiunge classe e keyword)
  - description: `${question_count} domande di ${section.name} per l'esame di ${class.name} (${course.name}). Modalità studio o simulazione su TriviaMore.`
- **Effort**: 30 min (richiede passare `class.name`/`question_count` al `head()`).
- **Impatto**: alto — riscrive title/description per il **70% delle pagine indicizzabili**.

### 5. Sistema le meta dei dipartimenti
- **File**: `src/routes/_app/browse/$department/index.tsx:39-44`
- **Pattern proposto**:
  - title: `${dept.name} — Quiz UniMore` (rimuove "| Esplora", riduce lunghezza da ~75 a ~50 char)
- **Effort**: 5 min.
- **Impatto**: medio.

### 6. Cambia il redirect apex da 307 a 308
- **Dove**: configurazione Vercel (domains).
- **Effort**: 2 min.
- **Impatto**: basso ma signal corretto.

### 7. Allinea description manifest ↔ seoHead
- **File**: `public/manifest.json` line 4
- **Modifica**: usare la stessa description del homepage SEO.
- **Effort**: 2 min.
- **Impatto**: basso (consistency, nessun effetto ranking).

---

## Fix critico tecnico — JSON-LD non rendered

### Diagnosi
`src/lib/json-ld.ts` ritorna oggetti compatibili con `script` JSX:
```ts
{ type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify(data) } }
```
Le route li passano in `head: () => ({ scripts: [websiteJsonLd()] })`.

Il `<head>` reso server-side **non contiene alcuno `<script type="application/ld+json">`**. L'API `head.scripts` di TanStack Start probabilmente:
- emette gli script in `<body>` via il componente `<Scripts />` (lazy/deferred), oppure
- non supporta `dangerouslySetInnerHTML` in modalità SSR per script inline, oppure
- richiede un campo diverso (`HeadContent` vs `Scripts`).

### Soluzioni in ordine di preferenza
1. **Render manuale nel componente di pagina** con un `<script>` dichiarato direttamente nel JSX accanto all'`<Outlet>`/contenuto:
   ```tsx
   <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
   />
   ```
   Garantisce render SSR + presenza nel DOM iniziale.
2. **Verifica firma `head.scripts` nella versione installata** di `@tanstack/react-router` / `@tanstack/start` — possibile breaking change tra minor.
3. **Sposta in `head.meta`** se la versione lo permette tramite tag `<script>` (alcune API documentano questo pattern).

Verifica con `curl -sL https://www.trivia-more.it/ | grep "ld+json"` dopo il fix.

**Effort stimato**: 1-2h (debug + test su tutte le 5 route).
**Impatto**: alto — sblocca rich snippet già scritti su 5 tipi di pagina.

---

## Investimenti strategici (questo trimestre)

Ordinati per impatto SEO, non per effort.

### A. Schema `LearningResource` / `Quiz` sulle section page
Una volta sistemato il rendering JSON-LD, aggiungi a `src/lib/json-ld.ts`:
```ts
export function quizJsonLd({ name, description, questionCount, classLabel, path })
```
con `@type: "Quiz"` o `LearningResource`, `learningResourceType: "Quiz"`, `educationalLevel: "University"`, `inLanguage: "it"`, `numberOfQuestions: questionCount`. Monta nelle section route.
**Impatto**: rich result con conteggio domande in SERP — differenziante vs Studocu su query "{materia} unimore quiz".

### B. Schema `FAQPage` sulla homepage
5-7 FAQ ("È gratis?", "Serve registrarsi?", "Quali atenei copre?", "Come funziona la simulazione esame?", "Come segnalo un errore?", "È open source?"). Visibili sulla pagina + JSON-LD `FAQPage`.
**Impatto**: rich result + cattura query informazionali.

### C. Pagine dipartimento / corso / classe arricchite con copy
Oggi sono **tabelle nude**. Bassissimo valore SEO. Aggiungi:
- 200-400 parole descrittive sopra la tabella;
- statistiche live (n. domande, n. sezioni, ultimo aggiornamento);
- 3-5 link interni a sezioni "in evidenza".
**Impatto**: alto — sblocca 100+ pagine dept/course/class come landing reali.

### D. Pillar guide "Come prepararsi all'esame di {materia} UniMore"
Per i 10 esami più popolari del catalogo (Analisi 1, Fisica 1, Programmazione, Anatomia, Diritto Privato, ecc.). Linkate dalla pagina classe corrispondente.
**Impatto**: alto — content top-of-funnel oggi totalmente assente; oggi vincono Studocu/UniD/Skuola su queste query.

### E. Internal linking laterale
Oggi il grafo è solo top-down (dept → course → class → section). Aggiungi:
- "Altre sezioni di questo insegnamento" sulla section page;
- "Insegnamenti correlati" sulla class page;
- "Altri corsi di questo dipartimento" sulla course page.
**Impatto**: medio — distribuisce PageRank interno su 2.6k URL.

### F. Backlink dal lato OSS
TriviaMore è open source: vantaggio enorme che Studocu/Docsity non hanno. Submit a:
- Awesome lists italiane (`awesome-italia`, `awesome-italian-tools`);
- r/Universitaly, r/UniMoRe;
- dev.to / Medium con post tecnici sullo stack;
- blog UniMore studenteschi (Repubblica degli Stagisti, Universita.it, ecc.).
**Impatto**: fattore #1 per crescita SEO di un dominio nuovo.

### G. Blog/changelog pubblico
Oggi `/news` esiste ma è interno utenti. Esponi `/blog` o `/changelog` SEO-targeted.
**Impatto**: medio — freshness signal + linkbait.

### H. Riduci HTML payload home (350KB)
Audit del bundle, lazy-load di componenti pesanti, defer JS non critico. Target <150KB initial.
**Impatto**: medio su LCP — già parzialmente coperto dal fix devtools.

### I. Image sitemap
Solo se introduci OG image dinamiche per sezione/classe.
**Impatto**: basso (ora og-default è unica).

---

## Riferimenti rapidi ai file

| Cosa | File |
|---|---|
| Helper SEO | `src/lib/seo.ts` |
| Helper JSON-LD | `src/lib/json-ld.ts` |
| Root layout / devtools | `src/routes/__root.tsx` |
| Homepage SEO | `src/routes/_app/index.tsx` |
| Section page SEO | `src/routes/_app/browse/$department/$course/$class/$section/index.tsx` |
| Department page SEO | `src/routes/_app/browse/$department/index.tsx` |
| Course page SEO | `src/routes/_app/browse/$department/$course/index.tsx` |
| Class page SEO | `src/routes/_app/browse/$department/$course/$class/index.tsx` |
| About page | `src/routes/_app/about.tsx` |
| Sitemap generator | `scripts/lib/sitemap.ts` |
| Robots | `public/robots.txt` |
| Manifest PWA | `public/manifest.json` |
| `llms.txt` (LLM-friendly site map) | `public/llms.txt` |

---

## Stato dell'arte vs competitor

| Aspetto | TriviaMore | Studocu/Docsity | Vantaggio difendibile |
|---|---|---|---|
| Volume contenuti | ~2.6k URL | 100k+ unimore-related | ❌ Non competibile |
| Curation | Curata, gerarchia ufficiale UniMore | UGC rumoroso | ✅ Sì |
| Paywall | Mai | Spesso | ✅ Sì |
| Modalità simulazione esame (timer) | Sì | No | ✅ Sì |
| Open source | Sì | No | ✅ Sì → backlink dev/edu |
| Rich snippet attivi | ❌ (JSON-LD broken) | ✅ | ⚠️ Recuperabile subito |
| Pagine TOLC/ammissione | No | Parziale | Off-scope |

---

## Checklist sintetica per ripartire dopo il fix

- [ ] Devtools fuori dalla build production
- [ ] Title/description home + UniMore in H1
- [ ] Title/description section + department riscritti
- [ ] JSON-LD fix rendering (verifica `curl | grep ld+json`)
- [ ] Redirect 307 → 308 su Vercel
- [ ] Quiz/LearningResource schema su section page
- [ ] FAQPage schema su home
- [ ] Copy descrittivo su pagine dept/course/class
- [ ] 10 pillar guide pubblicate e linkate
- [ ] Submission a awesome list / Reddit / dev.to
