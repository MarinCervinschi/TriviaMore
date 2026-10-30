# Secrets & environment variables

Two modes: **with Infisical** (default) and **without** (fallback for contributors who don't have access to the Infisical project).

## Variables

| Variable | Scope | Where to find it |
|---|---|---|
| `DATABASE_URL` | Server only | The runtime role, `trivia_app` |
| `SUPABASE_DB_URL` | Scripts only | The admin role, `postgres`, for `drizzle-kit` and the migration scripts; the name is kept from before the move |
| `S3_*` | Server only | The Garage bucket names, key and endpoint, and `S3_PUBLIC_URL`, where public files are served |
| `BETTER_AUTH_URL` | Server only | The app's own origin, used in the links Better Auth emails and in the OAuth callbacks (local: `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Server only | Signs the session cookies; at least 32 random characters, one per environment (`openssl rand -base64 32`) |
| `AUTH_ALLOWED_EMAIL_DOMAIN` | Server only | Staging only: `trivia-more.it`. Turns off password sign-up and admits only verified addresses of that domain |
| `VITE_SITE_URL` | Client + Server | Canonical site URL (default `https://www.trivia-more.it`) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Server only | GitHub OAuth app, callback `<BETTER_AUTH_URL>/api/auth/callback/github` — optional locally |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Server only | Google OAuth client, redirect URI `<BETTER_AUTH_URL>/api/auth/callback/google` — optional locally |
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

Copy the example file, point it at a Postgres you run yourself, and run the no-secrets variant:

```bash
cp .env.example .env
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
