<div align="center">
  <img src="./public/logo512.png" alt="TriviaMore" width="120" />

  <h1>TriviaMore</h1>

  <p><strong>An open source study ecosystem for UniMore — full university catalog, hierarchical content, role-based collaboration. Built by students, for students.</strong></p>

  <p>
    <a href="https://trivia-more.it"><img src="https://img.shields.io/badge/live-trivia--more.it-bc351a?style=for-the-badge" alt="Live site" /></a>
    <a href="https://github.com/MarinCervinschi/TriviaMore/stargazers"><img src="https://img.shields.io/github/stars/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="Stars" /></a>
    <a href="https://github.com/MarinCervinschi/TriviaMore/network/members"><img src="https://img.shields.io/github/forks/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="Forks" /></a>
    <a href="https://github.com/MarinCervinschi/TriviaMore/issues"><img src="https://img.shields.io/github/issues/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="Open issues" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/github/license/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="License" /></a>
    <img src="https://img.shields.io/github/last-commit/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="Last commit" />
  </p>
</div>

## About

TriviaMore is an open source study **ecosystem** for the University of Modena and Reggio Emilia (UniMore). It is not just a quiz tool: it mirrors the full UniMore catalog as a five-level hierarchy (departments → courses → classes → sections → questions), wraps it in interactive learning surfaces (study quizzes, exam simulations, flashcards), and exposes a layered role system (guest → student → maintainer → admin → superadmin) so the catalog can be curated collaboratively by the students who actually take the exams. Personal dashboards turn that catalog into a structured study path: follow your classes, bookmark questions, track progress over time, and see where you stand course by course.

## Features

- **Quizzes** — Study mode (no timer, instant feedback) and Exam Simulation (timer, randomized questions, final score). Multiple choice, true/false, short answer.
- **Flashcards** — Flip-card sessions with progress tracking.
- **Hierarchical catalog** — Browse departments → courses → classes → sections → questions, with search, filters and breadcrumbs.
- **Personal dashboard** — Followed classes, bookmarks, interactive progress charts, notifications.
- **Guest mode** — Quizzes and flashcards work without an account.
- **Role-based back office** — Department-scoped maintainers curate content; admins manage users; superadmins manage the platform itself.
- **Bulk content tools** — Mass import, request workflow for community-submitted edits.

## Stack

A short tour of the technologies that power the platform — click any name to jump to its docs.

- <img src="https://api.iconify.design/logos:react.svg" height="16" /> **[React 19](https://react.dev)** — UI library, Server Components-aware.
- <img src="https://api.iconify.design/logos:typescript-icon.svg" height="16" /> **[TypeScript](https://www.typescriptlang.org)** — Strict end-to-end typing across client, server functions and Supabase schema.
- <img src="https://api.iconify.design/logos:tanstack.svg" height="16" /> **[TanStack Start](https://tanstack.com/start)** — Full-stack React framework with file-based routing, server functions and built-in data loading.
- <img src="https://api.iconify.design/logos:vitejs.svg" height="16" /> **[Vite](https://vite.dev)** — Dev server and build tool.
- <img src="https://api.iconify.design/logos:tailwindcss-icon.svg" height="16" /> **[Tailwind CSS v4](https://tailwindcss.com)** — Utility-first styling with CSS variables and `@theme`.
- <img src="https://api.iconify.design/simple-icons:shadcnui.svg" height="16" /> **[shadcn/ui](https://ui.shadcn.com)** — New York style components on top of Radix UI primitives.
- <img src="https://api.iconify.design/logos:tanstack.svg" height="16" /> **[TanStack Query](https://tanstack.com/query)** — Server-state cache with persistent storage.
- <img src="https://api.iconify.design/logos:supabase-icon.svg" height="16" /> **[Supabase](https://supabase.com)** — Postgres database, auth, storage and realtime.
- <img src="https://api.iconify.design/simple-icons:infisical.svg" height="16" /> **[Infisical](https://infisical.com)** — Secrets management (CLI in dev, SDK in production).
- <img src="https://api.iconify.design/logos:vitest.svg" height="16" /> **[Vitest](https://vitest.dev)** — Unit testing.

## Quick start

**1. Install dependencies**

```bash
pnpm install
```

**2. Start the local Supabase stack** (requires Docker)

```bash
supabase start
```

**3. Log in to Infisical** (first time only)

```bash
infisical login
infisical init
```

**4. Start the dev server** with secrets injected

```bash
pnpm dev
```

For UI-only work without secrets, skip steps 3–4 and run `pnpm dev:no-secrets`.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server with Infisical secrets |
| `pnpm dev:no-secrets` | Dev server without Infisical |
| `pnpm build` | Production build + sitemap |
| `pnpm build:dev` | Dev build with Infisical CLI |
| `pnpm start` | Start production server (`node .output/server/index.mjs`) |
| `pnpm preview` | Preview the production build |
| `pnpm test` | Run tests with Vitest |
| `pnpm db:types` | Regenerate Supabase TypeScript types |
| `pnpm generate:sitemap` | Generate `sitemap.xml` (runs automatically after build) |

## Environment variables

### Development (Infisical CLI)

Secrets are stored in Infisical and injected via `infisical run --` in dev scripts.

| Variable | Scope | Value from `supabase status` |
|---|---|---|
| `VITE_SUPABASE_URL` | Client + Server | **Project URL** (local: `http://127.0.0.1:54321`) |
| `VITE_SUPABASE_ANON_KEY` | Client + Server | **Publishable** key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **Secret** key (`sb_secret_...`) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Server only | GitHub OAuth app |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Server only | Google OAuth app |
| `VITE_APP_URL` | Server only | App URL for OAuth redirects (defaults to `http://localhost:3000`) |
| `VITE_SITE_URL` | Client + Server | Canonical site URL (defaults to `https://trivia-more.it`) |

> OAuth providers are optional locally — email/password works without them. Variables prefixed with `VITE_` are exposed to the browser; never prefix secret keys with `VITE_`.

### Local dev without Infisical

If you don't have access to the Infisical project, copy the example file and fill in the values from `supabase status`:

```bash
cp .env.example .env
supabase status                  # read the local Supabase credentials
pnpm dev:no-secrets              # Vite picks up `.env` automatically
```

OAuth client IDs/secrets in `.env.example` can be left blank — email/password auth works without them. `.env` is gitignored; `.env.example` is committed as the template.

### Production (Infisical SDK)

In production the app uses `@infisical/sdk` to load secrets at server startup via Universal Auth.

| Variable | Required | Description |
|---|---|---|
| `INFISICAL_CLIENT_ID` | Yes | Machine Identity client ID |
| `INFISICAL_CLIENT_SECRET` | Yes | Machine Identity client secret |
| `INFISICAL_PROJECT_ID` | Yes | Infisical project ID |
| `INFISICAL_ENV` | No | Infisical environment slug (default: `prod`) |
| `INFISICAL_SITE_URL` | Yes | Infisical instance URL (self-hosted) |
| `MAINTENANCE_MODE` | No | Set to `true` to show the Coming Soon page |

All other secrets are loaded from Infisical at runtime. `VITE_*` variables must also be set on the hosting platform because Vite embeds them at build time.

### Maintenance mode

Set `MAINTENANCE_MODE=true` in production to redirect every route to the Coming Soon page (authenticated users included). Set it back to `false` to go live.

## Supabase local development

```bash
supabase start          # start all services (requires Docker)
supabase status         # show URLs and keys
supabase stop           # stop all services
supabase db reset       # re-apply migrations + seed
```

| Service | URL |
|---|---|
| Studio | http://127.0.0.1:54323 |
| API | http://127.0.0.1:54321 |
| Database | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Mailpit | http://127.0.0.1:54324 |

## Database

`supabase db reset` applies all migrations and runs `supabase/seed.sql`, which provisions:

- A superadmin user (`admin@triviamore.local` / `password123`)
- Catalog data (departments, courses, classes, sections, questions) dumped from staging

### Refresh seed from staging

```bash
# Catalog-only (used to update seed.sql)
infisical run -- supabase db dump --data-only --linked --schema catalog -f supabase/seed_catalog.sql

# Full backup
infisical run -- supabase db dump --data-only --linked -f data/dump.sql
```

To restore a full dump locally:

```bash
docker exec -i supabase_db_TriviaMore psql -U postgres -d postgres < data/dump.sql
```

### Regenerate TypeScript types

```bash
pnpm db:types
```

This generates types from the local database and applies post-processing fixes (e.g. `tsvector` columns typed as `string | null`). The fix script is `supabase/scripts/fix-types.ts`.

## Authentication

Supabase Auth with email/password and OAuth (GitHub, Google). Routes are protected via `requireAuth` / `requireGuest` guards in `beforeLoad`:

```typescript
export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => requireAuth(),
  component: Dashboard,
})
```

## Contributing

Contributions are welcome — both to the code and to the catalog content.

- **Found a wrong question or missing topic?** Open an issue with the `content` label and link to the affected section.
- **Found a bug or want to propose a feature?** Open an issue with the `bug` or `enhancement` label.
- **Code contributions:**
  1. Fork the repo and create a branch off `master` (e.g. `feat/quiz-shortcuts`, `fix/sitemap-encoding`).
  2. Follow the existing patterns and keep commits small and logical.
  3. Run `pnpm test` and `pnpm build` before pushing.
  4. Open a pull request against `master` with a short description and screenshots for UI changes.

Want to maintain the catalog of your own department? Open an issue and we'll grant you the maintainer role for that scope.

## Branches

```
master          → Production (TanStack Start v3.0)
trivia-more-3.0 → Reference: old Next.js code + migration roadmap
```

The previous Next.js version is archived as tag [`v2.0.0`](https://github.com/MarinCervinschi/TriviaMore/releases/tag/v2.0.0).

## License

Released under the [MIT License](./LICENSE).
