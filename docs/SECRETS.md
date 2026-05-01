# Secrets & environment variables

Two modes: **with Infisical** (default) and **without** (fallback for contributors who don't have access to the Infisical project).

## Variables

| Variable | Scope | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | Client + Server | `supabase status` → Project URL (local: `http://127.0.0.1:54321`) |
| `VITE_SUPABASE_ANON_KEY` | Client + Server | `supabase status` → Publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | `supabase status` → Secret key (`sb_secret_...`) |
| `VITE_APP_URL` | Server only | App URL for OAuth redirects (default `http://localhost:3000`) |
| `VITE_SITE_URL` | Client + Server | Canonical site URL (default `https://www.trivia-more.it`) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Server only | GitHub OAuth app — optional locally |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Server only | Google OAuth app — optional locally |
| `MAINTENANCE_MODE` | Server only | `true` to redirect every route to the Coming Soon page |

`VITE_*` variables are exposed to the browser. Never prefix secret keys with `VITE_`.

## With Infisical (recommended)

Secrets live in self-hosted Infisical. Inject them into any command via `infisical run -- <cmd>`.

```bash
infisical login    # first time only
infisical init     # link this folder to the Infisical project
pnpm dev           # already wraps the dev server with infisical run
```

The `pnpm dev` / `pnpm build:dev` / etc. scripts already wrap the underlying tool with `infisical run --recursive --`. Run them as-is.

## Without Infisical (fallback)

Copy the example file, fill in values from `supabase status`, run the no-secrets variants:

```bash
cp .env.example .env
supabase status
pnpm dev:no-secrets
```

OAuth client IDs/secrets in `.env.example` can be left blank — email/password works without them. `.env` is gitignored.

## Production

The deployed app loads secrets at server startup via `@infisical/sdk` (Universal Auth machine identity).

| Variable | Required | Description |
|---|---|---|
| `INFISICAL_CLIENT_ID` | ✅ | Machine Identity client ID |
| `INFISICAL_CLIENT_SECRET` | ✅ | Machine Identity client secret |
| `INFISICAL_PROJECT_ID` | ✅ | Infisical project ID |
| `INFISICAL_SITE_URL` | ✅ | Self-hosted Infisical URL |
| `INFISICAL_ENV` | — | Environment slug (default `prod`) |

All other secrets come from Infisical at runtime. `VITE_*` variables must additionally be set on the hosting platform (Vercel) because Vite embeds them at build time.
