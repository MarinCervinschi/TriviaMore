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
| `SEQ_URL` | Server only | Seq ingestion base URL — **unset means logs go to the console** |
| `SEQ_API_KEY` | Server only | Seq API key, one per environment — see `docs/OBSERVABILITY.md` |
| `LOG_LEVEL` | Server only | `debug` \| `info` \| `warn` \| `error` (default `info`) |

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

The container gets its secrets from the Infisical CLI, not from application code. `docker-entrypoint.sh`
exchanges the machine-identity credentials for a short-lived token and execs the server through
`infisical run`, so the environment is populated **before** the process starts.

| Variable | Required | Description |
|---|---|---|
| `INFISICAL_CLIENT_ID` | ✅ | Machine Identity client ID |
| `INFISICAL_CLIENT_SECRET` | ✅ | Machine Identity client secret |
| `INFISICAL_PROJECT_ID` | ✅ | Infisical project ID |
| `INFISICAL_SITE_URL` | ✅ | Self-hosted Infisical URL |
| `INFISICAL_ENV` | — | Environment slug (default `prod`) |

Everything else comes from Infisical. Those five are needed **at build time as well as at runtime**,
because Vite inlines the `VITE_*` values into the client bundle — so each environment produces its
own image and `INFISICAL_ENV` is what distinguishes them. The build reaches Infisical but not the
database: the sitemap is served by a route at runtime, not written during the build.

If Infisical is unreachable the entrypoint exits non-zero and the container never starts, so a failed
deploy leaves the previous one running. It does not start and then serve errors.

On Coolify, enable **Docker Build Secrets** in the application's environment settings: the five
variables are then passed as BuildKit secret mounts instead of `--build-arg`, and never reach an
image layer.

### CLI version pin

`INFISICAL_CLI_VERSION` is pinned for reproducibility: an unpinned `apt-get install infisical` means
the same commit builds a different image whenever a new CLI ships. Bump it deliberately.

It is **not** pinned for compatibility — every 0.43.x fetches secrets from `/api/v4/secrets`. What
matters is the server: an Infisical without that route answers `404 Route not found`, and the build
fails immediately after a *successful* login, which reads like an auth problem and isn't. Check with
`curl -o /dev/null -w '%{http_code}' https://<instance>/api/v4/secrets` — 401 means the route exists,
404 means the server is too old. v0.154.6 serves both v3 and v4.
