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
- [ ] **Fase 4** — Routing e layout TanStack Start
- [ ] **Fase 5** — Pagine pubbliche e browse
- [ ] **Fase 6** — Area utente (dashboard, classi, bookmarks, progress)
- [ ] **Fase 7** — Quiz system
- [ ] **Fase 8** — Flashcard system
- [ ] **Fase 9** — Admin CRUD e gestione contenuti
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

> **Nota per fasi successive**: il vecchio codice (branch `trivia-more-3.0`) usa `useVolatileQuery` e `PERSISTENT_QUERY_CACHE` con localStorage. Nella migrazione, sostituire tutte le query persistenti/volatili con `useQuery` standard di `@tanstack/react-query` — la persistenza in localStorage è stata rimossa, l'SSR hydration è gestita nativamente dal router.
