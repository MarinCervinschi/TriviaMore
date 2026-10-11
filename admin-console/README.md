# TriviaMore Console

The ops console: the owner's app for running and watching the jobs that keep TriviaMore's official data
current. It is deployed apart from the student app, at `admin.trivia-more.it` behind Cloudflare Access. The architecture and its
reasons are in [`docs/OPS_CONSOLE.md`](../docs/OPS_CONSOLE.md).

## Run it

From the repository root:

```bash
pnpm install
pnpm console:dev      # http://localhost:3100
pnpm console:build
```

Or from this folder: `pnpm dev`, `pnpm build`, `pnpm typecheck`.

## Environment

`pnpm dev` runs through Infisical, like the app; the console reads these on the server only.

| Variable                                      | Used for                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | the sign-in, against the same Supabase auth as the app                 |
| `CONSOLE_OWNER_IDS`                           | comma-separated user ids allowed in; anyone else is signed out at once |
| `DATABASE_URL`                                | the one database: local in `dev`, production in `prod`                 |
| `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`      | the Cloudflare Access token every request must carry; unset locally    |

Without `CONSOLE_OWNER_IDS` nobody can sign in. A missing `DATABASE_URL` shows as _non configurata_ on
Impostazioni → Connessione. A built console labels itself _Produzione_; `pnpm console:dev` is _Locale_.

## The worker

The jobs run in a separate process, `pnpm console:worker`, one at a time. It reads the same database. In
production a schedule only simulates; applying is always a run started by hand, after its simulation.

## Docker

The image builds from the repository root, because the console imports the app's components:

```bash
docker build -f admin-console/Dockerfile .
```

It needs no secrets to build. At start, `docker-entrypoint.sh` exchanges the Infisical machine identity for a
token and runs the server on port 3100.

## How it is built

Same stack as the app: TanStack Start (React 19, Vite, Nitro) and Tailwind v4.

- `~/…` is the console's own code, `@/…` is the app's `src/`. The console imports the app's design system
  (tokens, `ui/` primitives, the theme provider) instead of copying it, so a change there shows here too.
- `src/lib/nav.ts` is the whole navigation: the sections of the rail and the pages of each section's sidebar.
  A new page is a route under `src/routes/` plus an entry there.
- The section sidebar remembers whether it is open in the `console_section_sidebar` cookie, so the server
  renders it in the right state.
- Every page sits under the `_console` layout, whose `beforeLoad` sends anyone but the owner to `/login`.
  An endpoint that touches data calls `requireOwner()` itself, because a server function can be called
  without its page.

## The shell

- **Rail**: the sections as icons, always collapsed; the name shows on hover.
- **Inset panel**: the header (breadcrumb, ⌘K search, environment), then the section's own sidebar, which
  opens and closes from the grip on its edge, then the page.
- Below `md` the rail is replaced by a sheet with the whole navigation.

A page not built yet is a placeholder that links to its issue of epic #188.
