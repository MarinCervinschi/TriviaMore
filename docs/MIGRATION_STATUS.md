# Migration Status: Next.js → TanStack Start + Supabase

## Strategia Branch

```
master          → Produzione Next.js (intoccato)
trivia-more-3.0 → Riferimento: codice Next.js + roadmap migrazione
tanstack-start  → Nuovo progetto TanStack Start (branch orfano, storia pulita)
```

Il branch `tanstack-start` è un **branch orfano** — non condivide storia git con `master` o `trivia-more-3.0`. Questo garantisce un progetto pulito senza file residui.

### Copiare file dal vecchio progetto

```bash
# Singolo file
git show trivia-more-3.0:src/components/ui/button.tsx > src/components/ui/button.tsx

# Vedere un file senza copiarlo
git show trivia-more-3.0:src/lib/services/quiz.service.ts | less

# Diff tra vecchio e nuovo
git diff trivia-more-3.0 -- src/components/ui/button.tsx
```

---

## Stato delle Fasi

- [x] **Fase 0** — Setup progetto TanStack Start
- [x] **Fase 1** — Setup Supabase e migrazione database
- [x] **Fase 2** — Autenticazione con Supabase Auth
- [x] **Fase 3** — Row Level Security (RLS)
- [x] **Fase 4** — Routing e layout TanStack Start
- [x] **Fase 5** — Pagine pubbliche e browse
- [x] **Fase 6** — Area utente (dashboard, classi, bookmarks, progress)
- [x] **Fase 7** — Quiz system
- [x] **Fase 8** — Flashcard system
- [x] **Fase 9** — Admin CRUD, gestione contenuti e utenti
- [ ] **Fase 10** — SEO, analytics, e polish
- [ ] **Fase 11** — Cleanup e dismissione Next.js

---

## Decisioni Prese

| Decisione | Scelta | Motivazione |
|---|---|---|
| Package manager | **pnpm** | Performance, disk space, strict dependency resolution |
| Secrets management | **Infisical** | Centralizzato, niente `.env` lunghi, team-friendly |
| Struttura branch | **Branch orfano** | Progetto pulito, nessun file residuo Next.js |
| Database client | **Supabase JS diretto** | Meno dipendenze, RLS integrato, realtime gratis (no Prisma) |
| Tabella utenti | **`profiles` separata** | FK a `auth.users(id)`, trigger `on_auth_user_created` |
| Tailwind | **v4** (da scaffold TanStack Start) | Versione più recente, CSS-native config |
| React | **v19** | Da scaffold TanStack Start |
| Dark mode | **Custom ThemeProvider** | Sostituto di `next-themes`, usa `localStorage` + classe `dark` |
| Naming convention DB | **snake_case** | Convenzione Supabase (camelCase → snake_case) |
| ID utenti | **UUID** (da `auth.users`) | CUIDs solo per entity di contenuto |
| React Query | **Integrazione nativa TanStack Start** | `setupRouterSsrQueryIntegration`, niente provider manuale né localStorage persistence |
| RLS | **Helper functions gerarchiche** | `SECURITY DEFINER` functions per check a cascata (superadmin → dept admin → maintainer → class → section) |
| Protezione ruoli | **Trigger `protect_profile_role`** | RLS non limita colonne, serve trigger BEFORE UPDATE per impedire role escalation |
| Accesso sezioni | **`can_access_section()` function** | `is_public=true` OR admin gerarchico OR riga in `section_access` |
| Admin panel | **Pannello dedicato** (`/admin/*`) | Separazione netta da browse, UX migliore, no rebuild necessario (SSR) |
| Cambio ruoli | **`supabaseAdmin` (service_role)** | Trigger `protect_profile_role` impedisce cambio via client autenticato |

---

## Cambiamenti Tecnici Rilevanti

### Da Tailwind v3 a v4
- `@tailwind base/components/utilities` → `@import "tailwindcss"`
- Config file `tailwind.config.js` → `@theme` block in CSS
- Colori shadcn registrati in `@theme` come `--color-*`

### Da Next.js a TanStack Start
- `"use client"` non necessario (non c'è RSC)
- `next/font` → font importati via CSS
- `next-themes` → custom `ThemeProvider` in `src/providers/theme-provider.tsx`
- `next/image` → `<img>` standard o CDN
- API routes → server functions (`createServerFn`)
- `middleware.ts` → `beforeLoad` nei route

### Da Prisma a Supabase (Fase 1+)
- Column naming: `camelCase` → `snake_case`
- User ID: `CUID (text)` → `UUID`
- `@prisma/client` types → `supabase gen types typescript`
- Prisma queries → `supabase.from('table').select()`

### Da NextAuth a Supabase Auth (Fase 2)
- `next-auth` → `@supabase/ssr` + `createServerFn`
- Password hashing: `bcryptjs` manuale → gestito da Supabase Auth
- Session: NextAuth session token → Supabase JWT + refresh token (cookie-based)
- Account/OAuth: tabella `accounts` → `auth.identities` (gestito da Supabase)
- Email verification: `VerificationToken` custom → built-in Supabase
- Middleware auth: `middleware.ts` → `requireAuth()` in `beforeLoad`
- Cookie handling: `getCookies`/`setCookie` da `@tanstack/react-start/server`
- Auth state client: custom context → React Query `useQuery` standard
- React Query: `ReactQueryProvider` custom con localStorage persistence → integrazione nativa via `setupRouterSsrQueryIntegration` + `createRootRouteWithContext`

### Row Level Security (Fase 3)
- RLS abilitato su tutte le 18 tabelle
- 6 helper functions `SECURITY DEFINER` per check gerarchici: `is_superadmin()`, `is_department_admin()`, `is_course_maintainer()`, `is_class_admin()`, `is_section_admin()`, `can_access_section()`
- Tabelle pubbliche in lettura: `departments`, `courses`, `classes`, `evaluation_modes`
- Contenuti controllati via sezione: `sections`, `questions`, `quizzes`, `quiz_questions`
- Dati utente isolati: `bookmarks`, `user_classes`, `user_recent_classes`, `quiz_attempts`, `answer_attempts`, `progress`
- Trigger `protect_profile_role` impedisce role escalation (solo superadmin o service_role possono cambiare ruoli)
- Script di verifica: `supabase/scripts/verify-rls.ts` (36 test)

### Routing e Layout (Fase 4)
- Layout pathless `_app.tsx`: wrappa navbar + footer attorno a tutte le pagine app (non auth, non quiz/flashcard standalone)
- Navbar responsive: logo gradient, nav links con `activeProps`, theme toggle, auth-aware (guest buttons o user dropdown menu), mobile Sheet
- Route browse con segmenti dinamici: `/browse/$department/$course/$class/$section`
- Route protette `/user/*`: layout `route.tsx` con `requireAuth()` in `beforeLoad`
- Route standalone: `/quiz/$quizId` e `/flashcard/$sessionId` (fullscreen, senza layout app)
- Route auth (`/auth/*`) fuori dal layout app (mantengono AuthCard centrato)

> **Nota per fasi successive**: il vecchio codice (branch `trivia-more-3.0`) usa `useVolatileQuery` e `PERSISTENT_QUERY_CACHE` con localStorage. Nella migrazione, sostituire tutte le query persistenti/volatili con `useQuery` standard di `@tanstack/react-query` — la persistenza in localStorage è stata rimossa, l'SSR hydration è gestita nativamente dal router.

### Pagine Pubbliche e Browse (Fase 5)
- Landing page completa: hero, features (4 cards), benefits, CTA, footer 3 colonne
- About page: missione, valori (4 cards), stack tecnologico, CTA GitHub
- Contact page: form (react-hook-form + zod), cards metodi contatto, FAQ, linee guida community
- Browse service: `src/lib/browse/` (types, server functions, query options)
- Data fetching: `ensureQueryData` in loader + `useSuspenseQuery` in component (SSR pattern)
- 5 livelli browse: dipartimenti → corsi → classi → sezioni → dettaglio sezione
- Componenti condivisi: breadcrumb, hero, stats, empty state, search filter, item grid
- Cards per livello: DepartmentCard, CourseCard, ClassCard, SectionCard
- Filtri client-side: ricerca per nome + filtro tipo corso (Triennale/Magistrale)
- SEO: `head` function con title e description su ogni route
- Sezione dettaglio: QuizCard e FlashcardCard (funzionalità in Fase 7-8)
- Permessi sezioni: delegati a RLS via `can_access_section()`, nessuna logica custom

### Area Utente (Fase 6)
- Dashboard con profilo, statistiche quiz, attività recente con link cliccabili ai risultati
- My Classes con ricerca/filtri e gestione classi salvate
- Bookmarks con revisione domande e toggle risposte
- Progress con grafici e tracking performance
- Settings con informazioni profilo e account

### Quiz System (Fase 7)
- Tipi domanda: MULTIPLE_CHOICE, TRUE_FALSE (filtrati da `question_type`)
- Modalità: STUDY (timing flessibile), EXAM_SIMULATION (timing rigido, domande da tutta la classe)
- Scoring configurabile via `evaluation_modes` (punti corretta/errata, credito parziale)
- Flusso duale: guest (sessionStorage, nessun salvataggio DB) e autenticato (quiz_attempts, progress tracking)
- Componenti: start-quiz-dialog, question-card, quiz-header con timer, quiz-navigation, quiz-sidebar, quiz-progress
- Risultati inline per guest, pagina risultati persistente per utenti autenticati (`/quiz/results/$attemptId`)
- Randomizzazione domande e opzioni, bookmark durante il quiz, conferma uscita con dialog
- Shortcut tastiera: frecce per navigazione

### Flashcard System (Fase 8)
- **Architettura stateless**: nessuna tabella DB, nessun salvataggio sessione/punteggio — coerente con la vecchia app
- Tipi domanda: SHORT_ANSWER (filtrati da `question_type`)
- Flusso duale: guest (sessionStorage + randomizzazione casuale) e autenticato (sessionId codificato con base64 + randomizzazione deterministica con seed)
- Formato sessionId auth: `user.{timestamp}.{base64(sectionId:cardCount)}` — parsato server-side, nessuna tabella lookup
- Componenti: start-flashcard-dialog (selezione numero carte), flashcard-question-card (animazione 3D flip CSS), flashcard-header, flashcard-navigation, flashcard-sidebar, flashcard-progress, flashcard-results
- Tracking "studiato": `Set<number>` client-side delle carte girate, mostrato come percentuale completamento
- Shortcut tastiera: frecce per navigazione, Spazio/Invio per girare carta
- Conferma uscita con dialog, risultati inline con riepilogo carte e possibilità di ricominciare
- Server functions read-only: `generateGuestFlashcardFn`, `startFlashcardFn`, `getFlashcardSessionFn`

### Admin CRUD e Gestione Contenuti (Fase 9)
- **Pannello admin dedicato** a `/admin/*` — separato dal browse, miglioramento rispetto al vecchio inline edit mode
- Layout con sidebar (navigazione + statistiche contenuti e utenti) + area contenuto principale
- Guard `requireAdmin` in `beforeLoad`: redirige STUDENT a `/`
- Dashboard con statistiche contenuti (dipartimenti, corsi, classi, sezioni, domande) e statistiche utenti (totali per ruolo, quiz completati, punteggio medio, utenti attivi)
- **CRUD completo** per tutta la gerarchia: dipartimenti → corsi → classi → sezioni → domande
- Ogni pagina dettaglio: form modifica + tabella entità figlie con ricerca, ordinamento colonne, paginazione (10 per pagina)
- Form domanda: campi dinamici per `question_type`, gestione opzioni `{id, text}`, anteprima Markdown + LaTeX, import bulk da JSON
- Validazione Zod con messaggi in italiano (portati dal vecchio codice, adattati a snake_case)
- **Gestione utenti**: lista con filtro ruolo (chips), ricerca, ordinamento, paginazione
- Dettaglio utente: cambio ruolo (solo SUPERADMIN, via `supabaseAdmin` service_role per bypassare trigger `protect_profile_role`), assegnazione dipartimenti (ADMIN), corsi (MAINTAINER), sezioni private
- Gestione accessi sezioni private da due punti: pagina utente e pagina sezione
- **RLS enforced a livello DB** — nessuna migration necessaria, le policy esistenti coprono tutti i casi
- Cache invalidation: ogni mutation invalida query admin + browse correlate; `refetchOnWindowFocus` per sincronizzazione cross-tab
- Bottone "Gestisci" contestuale nelle pagine browse (visibile solo ad admin) per navigare direttamente alla pagina admin corrispondente
- Link "Gestione" nella navbar per utenti con ruolo admin
- Componenti condivisi: `AdminSearch`, `AdminPagination` con `usePaginatedSearch`, `SortableHeader` con `useSort`, `AdminPageHeader` con backTo/backParams
- Server functions: `src/lib/admin/server.ts` (~1050 righe) con CRUD per tutte le entità + gestione utenti + stats aggregate
- Footer condizionale nel layout: `LandingFooter` per guest, `MinimalFooter` per utenti autenticati
- Cache clear completa al logout (`queryClient.clear()`)
- Invalidazione `["user", "profile"]` dopo aggiornamento corsi recenti
- Pagine auth: bottone tema in alto a destra, link "Torna alla home" con logo sopra la card

### Decisione Architetturale: Pannello Admin vs Inline Edit Mode
Il vecchio sistema usava un **inline edit mode** integrato nelle pagine browse (toggle "Modalità Modifica" con overlay, toolbar e modal CRUD). Questo approccio:
- Mescolava navigazione e gestione, confondendo gli studenti
- Richiedeva un rebuild manuale Vercel dopo ogni modifica (pagine statiche)
- Form di validazione complesse non stavano bene dentro le card

Il nuovo sistema usa un **pannello admin dedicato** che:
- Separa nettamente browse (lettura) e admin (gestione)
- Le modifiche sono immediatamente visibili grazie all'SSR (nessun rebuild)
- Form completi con validazione, preview Markdown, e UX dedicata
