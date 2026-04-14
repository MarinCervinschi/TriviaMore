# TriviaMore

Quiz and flashcard platform for better studying.

## Stack

- [TanStack Start](https://tanstack.com/start) + [Vite](https://vite.dev)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (New York style, Radix UI)
- [TanStack React Query](https://tanstack.com/query) with persistent caching
- [Supabase](https://supabase.com) (database, auth, realtime)
- [Infisical](https://infisical.com) for secrets management

## Setup

```bash
# Install dependencies
pnpm install

# Start local Supabase (requires Docker)
supabase start

# Login to Infisical (first time only)
infisical login
infisical init

# Start the dev server (injects secrets from Infisical)
pnpm dev

# Start without secrets (for pure UI testing)
pnpm dev:no-secrets
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server with Infisical secrets |
| `pnpm dev:no-secrets` | Dev server without Infisical |
| `pnpm build` | Production build + sitemap (secrets from SDK or env) |
| `pnpm build:dev` | Dev build with Infisical CLI |
| `pnpm start` | Start production server (`node .output/server/index.mjs`) |
| `pnpm preview` | Preview the production build |
| `pnpm test` | Run tests with Vitest |
| `pnpm db:types` | Regenerate Supabase TypeScript types (with post-processing) |
| `pnpm generate:sitemap` | Generate sitemap.xml (runs automatically after build) |
| `pnpm generate:sitemap:dev` | Generate sitemap.xml with Infisical CLI |

## Environment Variables

### Development (managed by Infisical CLI)

These secrets are stored in Infisical and injected via `infisical run --` in dev scripts:

| Variable | Scope | Value from `supabase status` |
|---|---|---|
| `VITE_SUPABASE_URL` | Client + Server | **Project URL** (local: `http://127.0.0.1:54321`) |
| `VITE_SUPABASE_ANON_KEY` | Client + Server | **Publishable** key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **Secret** key (`sb_secret_...`) |
| `GITHUB_CLIENT_ID` | Server only | GitHub OAuth app Client ID |
| `GITHUB_CLIENT_SECRET` | Server only | GitHub OAuth app Client Secret |
| `GOOGLE_CLIENT_ID` | Server only | Google OAuth app Client ID |
| `GOOGLE_CLIENT_SECRET` | Server only | Google OAuth app Client Secret |
| `VITE_APP_URL` | Server only | App URL for OAuth redirects (defaults to `http://localhost:3000`) |
| `VITE_SITE_URL` | Client + Server | Canonical site URL (defaults to `https://triviamore.it`) |

Run `supabase status` to see all local credentials after `supabase start`.

> OAuth providers are optional for local development. Email/password auth works without them.

> Variables prefixed with `VITE_` are exposed to the browser. Never prefix secret keys with `VITE_`.

### Production (Infisical SDK)

In production, the Infisical CLI is not available. The app uses `@infisical/sdk` to load secrets at server startup via Universal Auth (Machine Identity).

Set these environment variables on your hosting platform:

| Variable | Required | Description |
|---|---|---|
| `INFISICAL_CLIENT_ID` | Yes | Machine Identity client ID |
| `INFISICAL_CLIENT_SECRET` | Yes | Machine Identity client secret |
| `INFISICAL_PROJECT_ID` | Yes | Infisical project ID |
| `INFISICAL_ENV` | No | Infisical environment slug (default: `prod`) |
| `INFISICAL_SITE_URL` | No | Infisical instance URL (default: `https://app.infisical.com`) |

All other secrets (Supabase, OAuth, etc.) are loaded automatically from Infisical at runtime and injected into `process.env`.

## Supabase Local Development

```bash
supabase start          # Start all services (requires Docker)
supabase status         # Show URLs and keys
supabase stop           # Stop all services
supabase db reset       # Re-apply all migrations from scratch
```

| Service | URL |
|---|---|
| Studio (dashboard) | http://127.0.0.1:54323 |
| API | http://127.0.0.1:54321 |
| Database | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Mailpit (email testing) | http://127.0.0.1:54324 |

## Database Setup

`supabase db reset` applies all migrations and seeds the database automatically:

```bash
supabase db reset       # Migrations + seed in one step
```

### Seed

The seed (`supabase/seed.sql`) populates the local database with:

- **Superadmin user** — `admin@triviamore.local` / `password123`
- **Catalog data** — departments, courses, classes, sections, questions (dump from staging)

### Dump from staging

To refresh the seed with the latest staging data:

```bash
# Full backup (all schemas)
infisical run -- supabase db dump --data-only --linked -f data/dump.sql

# Catalog-only (for updating seed.sql)
infisical run -- supabase db dump --data-only --linked --schema catalog -f supabase/seed_catalog.sql
```

To restore a full dump locally:

```bash
docker exec -i supabase_db_TriviaMore psql -U postgres -d postgres < data/dump.sql
```

### Regenerate TypeScript types

After any schema change, regenerate the types:

```bash
pnpm db:types
```

This generates types from the local database and applies post-processing fixes (e.g. `tsvector` columns typed as `string | null` instead of `unknown`). The fix script lives in `supabase/scripts/fix-types.ts`.

Custom helper types like `CatalogTables` live in `src/lib/supabase/database.helpers.ts` and are not affected by regeneration.

## Authentication

Supabase Auth with email/password and OAuth (GitHub, Google).

- **Login:** `/auth/login`
- **Register:** `/auth/register`
- **OAuth callback:** `/auth/callback`

Auth state is managed via React Query (`useAuth` hook). Route protection uses `requireAuth`/`requireGuest` guards in `beforeLoad`.

```typescript
// Protect a route
export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => requireAuth(),
  component: Dashboard,
})

// Use auth in components
const { user, isAuthenticated, login, logout } = useAuth()
```

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx              Root layout (providers, toaster, devtools)
│   ├── _app.tsx                App layout (navbar + footer)
│   ├── _app/
│   │   ├── index.tsx           Home page
│   │   ├── about.tsx           About page
│   │   ├── contact.tsx         Contact page
│   │   ├── browse/             Browse hierarchy ($department/$course/$class/$section)
│   │   ├── admin/              Admin panel (CRUD, user management, dashboard)
│   │   │   └── route.tsx       Auth guard layout (requireAdmin)
│   │   └── user/               Protected area (dashboard, classes, progress, bookmarks, settings)
│   │       └── route.tsx       Auth guard layout (requireAuth)
│   ├── auth/
│   │   ├── login.tsx           Login page
│   │   ├── register.tsx        Register page
│   │   └── callback.tsx        OAuth callback
│   ├── quiz/$quizId.tsx        Quiz (standalone, no layout)
│   └── flashcard/$sessionId.tsx Flashcard (standalone, no layout)
├── components/
│   ├── ui/              34 shadcn/Radix components
│   ├── admin/           Admin panel (sidebar, forms, search, pagination, sortable headers)
│   ├── auth/            Auth forms, OAuth buttons, auth card
│   ├── browse/          Browse cards, breadcrumb, stats, filters
│   ├── contact/         Contact form
│   ├── flashcard/       Flashcard UI (flip card, sidebar, results)
│   ├── landing/         Hero, features, benefits, footer
│   ├── layout/          Navbar, footer
│   ├── quiz/            Quiz UI (questions, timer, navigation, results)
│   └── user/            User dashboard components
├── providers/
│   └── theme-provider   Dark mode (localStorage + .dark class)
├── hooks/
│   ├── useTheme         Theme hook (isDark, toggleTheme, etc.)
│   └── useAuth          Auth hook (user, login, signup, logout)
├── lib/
│   ├── admin/           Admin types, schemas, server functions, queries, mutations
│   ├── auth/            Auth types, schemas, server functions, guards
│   ├── browse/          Browse types, server functions, query options, contact schema
│   ├── flashcard/       Flashcard types, server functions, guest session helpers
│   ├── quiz/            Quiz types, server functions, scoring, randomization, session
│   ├── user/            User data types, server functions, queries
│   ├── supabase/        Supabase clients (browser, server, admin) + generated types
│   └── utils/           cn(), grading, quiz results formatting
└── styles/
    ├── globals.css       CSS variables, @theme, custom styles
    └── markdown.css      Markdown/KaTeX rendering styles
```

## Branches

```
master          → Production (Next.js, untouched)
trivia-more-3.0 → Reference: Next.js code + migration roadmap
tanstack-start  → This branch (new project)
```

For migration details: [`docs/MIGRATION_STATUS.md`](docs/MIGRATION_STATUS.md)
