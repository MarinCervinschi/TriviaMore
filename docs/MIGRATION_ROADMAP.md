# Migration Roadmap: Next.js → TanStack Start + Supabase

Ogni fase è autonoma e può essere espansa in un piano dettagliato prima dell'esecuzione.
Le fasi sono ordinate per dipendenza: completare una fase prima di iniziare la successiva (salvo dove indicato).

---

## Fase 0 — Setup progetto TanStack Start

**Obiettivo:** Avere un progetto TanStack Start funzionante con la struttura base, senza migrare ancora nulla.

- Inizializzare un nuovo progetto TanStack Start con Vite
- Configurare TypeScript (portare `tsconfig.json` attuale)
- Configurare Tailwind CSS v3 con la stessa config (`tailwind.config.js`, CSS variables, dark mode)
- Installare e configurare le dipendenze UI: Radix UI, Framer Motion, lucide-react, sonner, cmdk, recharts
- Installare react-hook-form + zod, react-markdown + remark/rehype plugins, katex
- Copiare la cartella `src/components/ui/` (componenti Radix/shadcn) — devono compilare senza errori
- Copiare `src/styles/` (global CSS, markdown styles)
- Verificare che `npm run dev` parta e che un componente UI di test si renderizzi correttamente
- Configurare gli alias di import (`@/` → `src/`)

**File coinvolti:** `package.json`, `tsconfig.json`, `tailwind.config.js`, `src/components/ui/*`, `src/styles/*`

**Dipendenze da installare:** Tutte le attuali tranne `next`, `next-auth`, `@auth/prisma-adapter`, `prisma`, `@prisma/client`, `next-sitemap`, `next-themes`, `@vercel/analytics`, `@vercel/speed-insights`, `sharp`

**Decisioni da prendere:**
- Struttura cartelle: mantenere `src/` o adattarsi alla convenzione TanStack Start (`app/`)?
- Come gestire il dark mode senza `next-themes` (alternative: classe CSS manuale, oppure libreria generica come `theme-change`)

---

## Fase 1 — Setup Supabase e migrazione database

**Obiettivo:** Avere il database PostgreSQL su Supabase con lo stesso schema e dati di Neon/Prisma.

- Creare progetto Supabase (o usare CLI per sviluppo locale: `supabase init` + `supabase start`)
- Esportare lo schema Prisma in SQL puro (`prisma migrate diff --from-empty --to-schema-datamodel`)
- Adattare lo SQL per Supabase:
  - Rimuovere le tabelle NextAuth (`Account`, `Session`, `VerificationToken`) — saranno gestite da Supabase Auth
  - Adattare il campo `User` per usare `auth.users` di Supabase come riferimento (UUID)
  - Convertire gli enum Prisma in PostgreSQL enum o in check constraints
  - Aggiungere le colonne `created_at`/`updated_at` con default `now()` dove mancano
- Creare le tabelle su Supabase via SQL editor o migration files
- Migrare i dati esistenti da Neon (pg_dump → pg_restore, o export CSV)
- Installare `@supabase/supabase-js` e `@supabase/ssr` nel progetto TanStack Start
- Creare il client Supabase (`src/lib/supabase/client.ts` e `src/lib/supabase/server.ts`)
- Verificare la connessione leggendo dati da una tabella

**File coinvolti:** `prisma/schema.prisma` (riferimento), nuovi file SQL, `src/lib/supabase/*`

**Decisioni da prendere:**
- Mantenere Prisma come ORM sopra Supabase PostgreSQL, oppure usare il client Supabase JS direttamente?
  - Pro Prisma: type-safety, migrazioni, query builder familiare
  - Pro Supabase client: meno dipendenze, RLS integrato, realtime gratis
  - **Consiglio:** Supabase client diretto + generazione tipi con `supabase gen types typescript`
- Supabase local dev (`supabase start`) vs progetto cloud per lo sviluppo?
- Come gestire la tabella `User`: profilo separato con FK a `auth.users`, o estendere `auth.users` con metadata?
  - **Consiglio:** Tabella `profiles` separata con trigger `on_auth_user_created` che crea il profilo automaticamente

---

## Fase 2 — Autenticazione con Supabase Auth

**Obiettivo:** Login/register funzionanti con Google, GitHub ed email/password tramite Supabase Auth.

- Configurare i provider OAuth su Supabase dashboard (Google, GitHub)
- Creare il flusso di autenticazione:
  - `signInWithOAuth({ provider: 'google' })` / `signInWithOAuth({ provider: 'github' })`
  - `signUp({ email, password })` + `signInWithPassword({ email, password })`
- Creare le pagine auth in TanStack Start:
  - `/auth/login` → form con email/password + bottoni OAuth
  - `/auth/register` → form registrazione
- Gestire il callback OAuth (Supabase gestisce il redirect, serve solo la route di callback)
- Creare un `AuthProvider` context che espone `user`, `session`, `signIn`, `signOut`
- Portare le validazioni Zod esistenti (`registerSchema`, `loginSchema`) da `src/lib/validations/`
- Creare il trigger SQL `on_auth_user_created` per popolare la tabella `profiles` con nome e ruolo default (STUDENT)

**File da migrare:** `src/lib/auth.ts`, `src/lib/validations/auth.ts`, `src/app/auth/*`, `src/providers/user-provider.tsx`

**File da eliminare:** `src/lib/auth.ts` (NextAuth config), `src/middleware.ts` (NextAuth middleware)

**Decisioni da prendere:**
- Come gestire i ruoli (SUPERADMIN, ADMIN, MAINTAINER, STUDENT)? Opzioni:
  - Custom claim nel JWT Supabase (via `auth.users.raw_app_meta_data`)
  - Colonna `role` nella tabella `profiles` (più semplice, query esplicita)
  - **Consiglio:** Colonna nella tabella `profiles` + RLS policy che la legge
- Come migrare gli utenti esistenti? Supabase ha un'API admin per creare utenti con password hash specifici

---

## Fase 3 — Row Level Security (RLS)

**Obiettivo:** Proteggere tutte le tabelle con policy RLS che rispecchiano il modello di permessi attuale.

- Abilitare RLS su tutte le tabelle
- Scrivere le policy per ogni tabella, partendo dalla logica in `UserService.getSectionWhereClause()` e `AdminService.checkAdminPermissions()`:

  **Tabelle pubbliche (lettura):**
  - `departments`, `courses`, `classes` → SELECT per tutti (anche anonimi)
  - `sections` → SELECT dove `isPublic = true` OR utente ha accesso (tabella `section_access`) OR utente è admin/maintainer della risorsa
  - `questions` → SELECT solo se la section è accessibile all'utente

  **Tabelle utente (CRUD proprio):**
  - `bookmarks` → CRUD solo per `auth.uid() = user_id`
  - `user_classes` → CRUD solo per `auth.uid() = user_id`
  - `progress` → SELECT/UPDATE solo per `auth.uid() = user_id`
  - `recent_classes` → CRUD solo per `auth.uid() = user_id`
  - `quiz_attempts`, `answer_attempts` → INSERT/SELECT per il proprio utente

  **Tabelle admin (CRUD gerarchico):**
  - `departments` → INSERT/UPDATE/DELETE solo SUPERADMIN
  - `courses` → INSERT/UPDATE/DELETE per ADMIN del dipartimento o SUPERADMIN
  - `classes`, `sections` → INSERT/UPDATE/DELETE per ADMIN del dipartimento o MAINTAINER del corso
  - `questions` → INSERT/UPDATE/DELETE per chi gestisce la section padre
  - `section_access` → INSERT/DELETE per admin/maintainer della section

- Testare ogni policy con utenti di ruoli diversi via Supabase SQL editor o test automatici
- Creare funzioni SQL helper se le policy diventano troppo complesse (es. `is_admin_of_department(dept_id)`)

**File da migrare (come riferimento logico):** `src/lib/services/user-service.ts`, `src/lib/services/admin-service.ts`

**Decisioni da prendere:**
- Usare funzioni `SECURITY DEFINER` per le policy complesse che richiedono join multipli?
- Come gestire il check gerarchico (MAINTAINER di un corso → accesso a tutte le sections delle classi di quel corso)?

---

## Fase 4 — Routing e layout TanStack Start

**Obiettivo:** Ricreare tutta la struttura di navigazione del sito con TanStack Router.

- Definire il route tree:
  ```
  __root.tsx                          (layout globale: providers, navbar, footer)
  ├── index.tsx                       (landing page /)
  ├── about.tsx                       (/about)
  ├── contact.tsx                     (/contact)
  ├── auth/
  │   ├── login.tsx                   (/auth/login)
  │   └── register.tsx                (/auth/register)
  ├── browse/
  │   └── $department/
  │       └── $course/
  │           └── $class/
  │               └── $section.tsx    (/browse/:dept/:course/:class/:section)
  ├── quiz/
  │   ├── $quizId.tsx                 (/quiz/:quizId)
  │   └── results/$attemptId.tsx      (/quiz/results/:attemptId)
  ├── flashcard/
  │   └── $sessionId.tsx              (/flashcard/:sessionId)
  └── user/
      ├── index.tsx                   (/user — dashboard)
      ├── classes.tsx                 (/user/classes)
      ├── bookmarks.tsx              (/user/bookmarks)
      ├── progress.tsx               (/user/progress)
      └── settings.tsx               (/user/settings)
  ```
- Implementare il layout root (`__root.tsx`):
  - ThemeProvider (sostituto di next-themes)
  - ReactQueryProvider (riusare la config esistente)
  - AuthProvider (Supabase)
  - Navbar + Footer
- Implementare la protezione route `/user/*` con `beforeLoad`:
  ```ts
  beforeLoad: async ({ context }) => {
    if (!context.auth.user) throw redirect({ to: '/auth/login' })
  }
  ```
- Implementare il redirect da `/auth/*` se già autenticati
- Portare i componenti Navbar, Footer, Sidebar dal progetto Next.js

**File da migrare:** `src/app/layout.tsx`, `src/app/page.tsx`, tutti i `layout.tsx` e `page.tsx`, `src/components/layout/*`, `src/providers/*`

**Decisioni da prendere:**
- Come strutturare i route file: flat o nested?
- Come passare il context auth ai route (`routerContext`)?

---

## Fase 5 — Pagine pubbliche e browse

**Obiettivo:** Le pagine pubbliche (landing, about, contact, browse) funzionano con dati reali da Supabase.

- Migrare la landing page (`/`) — componenti statici, nessun data fetching
- Migrare `/about` — pagina statica
- Migrare `/contact` — form con invio email via Resend (server function)
- Migrare il flusso browse:
  - `/browse` → lista dipartimenti (query Supabase: `supabase.from('departments').select()`)
  - `/browse/$department` → lista corsi del dipartimento
  - `/browse/$department/$course` → lista classi
  - `/browse/$department/$course/$class` → lista sezioni
  - `/browse/$department/$course/$class/$section` → lista domande (se accessibile)
- Usare `loader` di TanStack Router per il data fetching SSR:
  ```ts
  loader: async () => {
    return queryClient.ensureQueryData(departmentsQueryOptions())
  }
  ```
- Ricreare i servizi di browse come query Supabase dirette (sostituisce `BrowseService`)
- Portare tutti i componenti UI delle pagine browse

**File da migrare:** `src/app/browse/*`, `src/lib/services/browse-service.ts` (→ query Supabase), `src/components/browse/*`

**File da eliminare:** `src/app/api/` routes relative al browse (non servono più, query dirette dal client)

---

## Fase 6 — Area utente (dashboard, classi, bookmarks, progress)

**Obiettivo:** Le pagine protette dell'utente funzionano con query Supabase protette da RLS.

- `/user` dashboard — query profilo utente + statistiche aggregate
- `/user/classes` — CRUD classi salvate (`supabase.from('user_classes').select/insert/delete()`)
- `/user/bookmarks` — lista bookmarks con join su questions + toggle
- `/user/progress` — dati progress per sezione con grafici (Recharts)
- `/user/settings` — impostazioni utente
- Adattare i custom hooks esistenti:
  - `useUserData()` → query Supabase invece di fetch `/api/protected/user/profile`
  - `useUserClasses()` → query diretta con RLS
  - `useBookmarks()` → query diretta con RLS
  - `useUserProgress()` → query diretta con RLS
- Le mutation (add/remove class, toggle bookmark) diventano `supabase.from().insert/delete()`
- Mantenere React Query come layer di caching sopra le query Supabase

**File da migrare:** `src/app/user/*`, `src/hooks/use-user-*.ts`, `src/hooks/use-bookmarks.ts`, `src/components/user/*`

**File da eliminare:** Tutte le API routes in `src/app/api/protected/user/*`

---

## Fase 7 — Quiz system

**Obiettivo:** Il flusso quiz completo funziona (start → domande → risposte → risultati).

Questa è la fase più complessa perché la logica di quiz non è semplice CRUD.

- Migrare `QuizService` come server functions di TanStack Start:
  - `createServerFn('startQuiz')` → crea quiz, seleziona domande random, crea attempt
  - `createServerFn('completeQuiz')` → calcola punteggio, salva risposte, aggiorna progress
  - `createServerFn('cancelQuiz')` → cancella attempt
  - `createServerFn('generateGuestQuiz')` → quiz per utenti non autenticati
- Migrare `RandomizationService` (puro JS, nessuna dipendenza da Next.js — copia diretta)
- Migrare `EvaluationService` (puro JS — copia diretta)
- Migrare le pagine:
  - `/quiz/$quizId` → interfaccia quiz con timer, domande, risposte
  - `/quiz/results/$attemptId` → pagina risultati con statistiche
- Adattare `useQuizData()` per usare le nuove server functions
- Portare tutti i componenti quiz (`src/components/quiz/*`)

**File da migrare:** `src/lib/services/quiz-service.ts`, `src/lib/services/randomization-service.ts`, `src/lib/services/evaluation-service.ts`, `src/app/quiz/*`, `src/hooks/use-quiz-data.ts`, `src/components/quiz/*`

**Nota:** Le query Supabase nelle server functions possono usare il `supabase-js` server client con service role per bypassare RLS dove necessario (es. inserire progress per conto dell'utente dopo il quiz).

---

## Fase 8 — Flashcard system

**Obiettivo:** Il flusso flashcard funziona (start → studio → exam simulation).

- Migrare `FlashcardService` come server functions:
  - `createServerFn('startFlashcardSession')` → seleziona domande SHORT_ANSWER
  - `createServerFn('generateGuestFlashcardSession')`
  - `createServerFn('startExamSimulation')`
- Migrare le pagine:
  - `/flashcard/$sessionId` → interfaccia studio con flip cards
- Adattare `useFlashcardData()` per le nuove server functions
- Portare tutti i componenti flashcard (`src/components/flashcard/*`)

**File da migrare:** `src/lib/services/flashcard-service.ts`, `src/app/flashcard/*`, `src/hooks/use-flashcard-data.ts`, `src/components/flashcard/*`

---

## Fase 9 — Admin CRUD e gestione contenuti

**Obiettivo:** Gli admin possono gestire dipartimenti, corsi, classi, sezioni, domande.

- Migrare `AdminService` come server functions con controllo permessi:
  - CRUD departments (solo SUPERADMIN)
  - CRUD courses (ADMIN del dipartimento)
  - CRUD classes/sections (ADMIN o MAINTAINER)
  - CRUD questions (bulk import JSON incluso)
  - Gestione section access (grant/revoke)
- Le server functions verificano i permessi lato server (non affidarsi solo a RLS per le operazioni admin complesse)
- Migrare i componenti admin: edit mode, inline editing, form di creazione
- Migrare il rebuild hook (Vercel deploy webhook) come server function

**File da migrare:** `src/lib/services/admin-service.ts`, `src/app/api/protected/admin/*`, `src/components/admin/*`, `src/hooks/use-edit-mode.ts`

---

## Fase 10 — SEO, analytics, e polish

**Obiettivo:** Il sito è pronto per il deploy con SEO, analytics, e tutte le funzionalità accessorie.

- Configurare i meta tag per ogni route (TanStack Start usa `Meta` component o `head` nelle route)
- Generare sitemap (sostituire `next-sitemap` con una soluzione custom o `sitemap.js`)
- Sostituire `@vercel/analytics` e `@vercel/speed-insights`:
  - Se deploy su Vercel: funzionano ancora con adapter Vercel per Vinxi
  - Se deploy altrove: Plausible, Umami, o simili
- Sostituire `sharp` per image optimization (Vite plugin o CDN)
- Configurare l'adapter di deploy (Vercel, Node, Cloudflare, etc.)
- Testare tutti i flussi end-to-end
- Performance audit (Lighthouse)

**File da migrare:** `next-sitemap.config.js`, meta tags da ogni `page.tsx`

---

## Fase 11 — Cleanup e dismissione Next.js

**Obiettivo:** Rimuovere tutto il codice Next.js e le dipendenze obsolete.

- Rimuovere `next`, `next-auth`, `@auth/prisma-adapter`, `next-themes`, `next-sitemap`
- Rimuovere `prisma`, `@prisma/client` e la cartella `prisma/`
- Rimuovere `bcryptjs`, `jsonwebtoken` (gestiti da Supabase Auth)
- Rimuovere `sharp` (se non più necessario)
- Rimuovere `next.config.js`, `middleware.ts`
- Rimuovere tutte le API routes (`src/app/api/`)
- Aggiornare i docs (`ARCHITECTURE.md`, `AUTH.md`, `API_DOCUMENTATION.md`)
- Aggiornare `docker-compose.yml` se necessario (Supabase local dev usa il suo Docker)
- Aggiornare `.github/workflows` per il nuovo build system
- Aggiornare `.env.example` con le nuove variabili Supabase

---

## Note generali

**Ordine consigliato:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

**Fasi parallelizzabili:** 7 e 8 possono essere fatte in parallelo. 5 e 6 possono essere fatte in parallelo dopo la 4.

**Strategia di sviluppo:** Il nuovo progetto TanStack Start vive in una cartella/branch separata. Il sito Next.js resta attivo fino al completamento della fase 10. Switch finale in un colpo solo.

**Type generation:** Dopo ogni modifica allo schema Supabase, rigenerare i tipi con:
```bash
supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
```
Questo sostituisce completamente i tipi Prisma generati.
