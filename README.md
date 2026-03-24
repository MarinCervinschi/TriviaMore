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
| `pnpm build` | Production build with secrets |
| `pnpm preview` | Preview the production build |
| `pnpm dev:no-secrets` | Dev server without Infisical |
| `pnpm build:no-secrets` | Build without Infisical |
| `pnpm test` | Run tests with Vitest |

## Environment Variables (Infisical)

These secrets must be configured in Infisical for the app to work:

| Variable | Scope | Value from `supabase status` |
|---|---|---|
| `VITE_SUPABASE_URL` | Client + Server | **Project URL** (local: `http://127.0.0.1:54321`) |
| `VITE_SUPABASE_ANON_KEY` | Client + Server | **Publishable** key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **Secret** key (`sb_secret_...`) |

Run `supabase status` to see all local credentials after `supabase start`.

> Variables prefixed with `VITE_` are exposed to the browser. Never prefix secret keys with `VITE_`.

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

## Project Structure

```
src/
├── routes/              File-based routing (TanStack Router)
│   ├── __root.tsx       Root layout (providers, toaster, devtools)
│   └── index.tsx        Home page
├── components/
│   └── ui/              34 shadcn/Radix components
├── providers/
│   ├── theme-provider   Dark mode (localStorage + .dark class)
│   └── react-query      Query client with persistent cache
├── hooks/
│   └── useTheme         Theme hook (isDark, toggleTheme, etc.)
├── lib/
│   ├── supabase/        Supabase clients (browser, server, admin) + generated types
│   └── utils            cn() for Tailwind classes, serializeId()
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
