# TriviaMore

Open source study platform for UniMore. TanStack Start (React 19, Vite, Nitro) on a self-hosted
Postgres, with Better Auth and files on Garage. Content is a five-level hierarchy: departments → courses → classes → sections →
questions.

Stack: web-ts 3 (the `stack-web-ts` plugin); `docs/PLATFORM.md` records how the app left Supabase.
Skills come from the plugins enabled in `.claude/settings.json` (`method`, `stack-web-ts`,
`platform`), called as `plugin:skill`, and from `.claude/skills/` for what only TriviaMore has. Each
machine installs each plugin once: `claude plugin install <plugin>@<marketplace> --scope project`.
Beyond the routing below: `method:spec-interview` to decide a large feature, `method:feature-review`
after a UI change, `method:pre-pr-checklist` before a PR, and the `platform:*` skills for staging,
secrets and buckets.

## Commands

| | |
|---|---|
| `pnpm dev` | dev server (Infisical injects secrets) |
| `pnpm build:dev` | production build with secrets |
| `pnpm test` | Vitest — unit tier only (`*.test.ts`, offline) |
| `pnpm db:test:up` | an empty Postgres on :54329 with the migrations applied, for `pnpm test:db` |
| `pnpm test:db` | Vitest — integration tier (`*.itest.ts`, on the database `db:test:up` starts) |
| `pnpm exec tsc --noEmit` | typecheck |
| `pnpm storybook` | component workbench on :6006 |
| `pnpm build-storybook` | verify every story compiles |
| `pnpm format` | Prettier — the house style is tabs + semicolons |
| `pnpm db:generate --name x` | generate a migration from the Drizzle schema |
| `pnpm db:migrate` | apply pending migrations to the local database |
| `pnpm db:migrate:staging [--apply]` | read, then apply, what staging lacks |
| `pnpm db:dump:prod` · `pnpm db:migrate:prod [--apply]` | back up production, then read and apply what it lacks, before merging a release |
| `pnpm smoke:reads` | run every migrated read path against the live database |
| `pnpm smoke:writes` | run the quiz write paths in a transaction, then roll back |

**Use pnpm, never npm.** Anything needing secrets goes through the `pnpm` scripts, which wrap
`infisical run` — don't call `infisical` by hand or expect a `.env` to exist.

## Architecture

`createServerFn` is the only API the browser talks to. The client never queries the database
directly, and its files reach S3 through a server function too; private attachments are read through
`src/routes/api/requests/$requestId/attachment.ts`.

```
src/lib/<domain>/api/<endpoint>.ts   one server function per file — the API surface
src/lib/<domain>/service.ts          use cases: rules, transactions, queries, view models
src/lib/<domain>/db/<table>.ts       only for queries shared across modules (DbOrTx first arg)
src/lib/<domain>/schemas.ts          zod input schemas
src/lib/<domain>/types.ts            row types (from $inferSelect) + view models
src/lib/<domain>/queries.ts          client: TanStack Query queryOptions
src/lib/<domain>/mutations.ts        client: useMutation hooks
src/lib/server/middleware/           auth · optionalAuth · error mapping
src/lib/server/errors.ts             AppError family — the messages users are allowed to see
src/lib/catalog/                     cross-domain catalog queries (section chain, question pools)
src/lib/auth/guards.ts               requireAuth / requireAdmin / requireSuperadmin
src/lib/auth/checks.ts               section access gate (replaces the can_access_section RLS helper)
src/lib/admin/access.ts              content-scoped authorization (MAINTAINER scoping)
src/lib/logging/                     structured logging to Seq — server only
src/start.ts                         global request and function middleware
src/db/                              Drizzle client + schema
src/routes/                          file-based routes
src/components/data-table/           the one table component — every table goes through it
```

### The three layers

**`api/`** — one endpoint per file, named after it: `startQuizFn` → `api/start-quiz.ts`. It only
declares the middleware, validates the input and calls a use case. `api/index.ts` re-exports
everything, so import sites never name a file.

**`service.ts`** (or `service/<area>.ts`) — the flow: transactions, authorization calls, **its own
queries**, and the mapping to view models. Never imported by client code, which is what keeps `pg`
out of the browser bundle: `createServerFn` strips the handler, and with it every server-only import.

**`db/<table>.ts`** — the exception, not the default. **A query goes here only when it is used from
more than one module**; a query with a single caller stays a private function in that service, or
inline in the handler for one-query endpoints. Once a table has a `db/` file, all of its queries
live there — splitting one table across two layers is worse than either choice. These functions take
`db: DbOrTx` first, so the same query runs standalone or inside `db.transaction()`, which is also
what lets `pnpm smoke:writes` drive the write paths and roll back. No authorization, no user, no
view models.

`stack-web-ts:server-functions` holds the reasoning behind each rule, and how a change to an endpoint
stays safe for tabs opened before a deploy: **use it when adding, moving or changing a server function.**

`errorMiddleware` is registered globally in `src/start.ts`, so an endpoint only declares what it
adds: `.middleware([authMiddleware])`. An `AppError` reaches the toast with its own message;
anything else is logged and replaced, so **a message meant for the user must be an `AppError`**.

## Logging

Structured events go to Seq via `log` from `@/lib/logging/server` — **server only**, it reaches
`node:async_hooks`. One canonical line per request is emitted automatically; add a call only for
something that line cannot show. The rules, with the reasoning, are in `docs/OBSERVABILITY.md`:

- **A message template, never interpolation**: `log.info("Imported {Count}", { Count: n })`. Seq
  indexes properties, so `Count > 100` is a query; an interpolated string is just text.
- **Never pass a whole object** — `{ user }` is how emails leak. Pass `userId`.
- **`Forbidden` and `NotFound` are not `Error` level.** They are expected outcomes.
- **Do not log and rethrow**: `errorMiddleware` already logs once, at the boundary.

## Data access

Every query runs through Drizzle on a direct connection, as the service role. **RLS therefore never
filters anything** — a read that used to be narrowed by a policy has to say so in a where clause.
This caused three near-regressions during the migration; check `pg_policies` before trusting a query
ported from the old code. Authentication is Better Auth inside the app (`src/lib/auth/server.ts`).
Files are on Garage, an S3 store reached only from the tailnet, through `src/lib/storage/server.ts`;
public ones are served on `S3_PUBLIC_URL`.

**Supabase is gone** (`docs/PLATFORM.md`, #206): production runs on a plain Postgres on the VPS, backed
up every night to the staging server, and staging is where every change lands first. Read that ADR before
touching auth, storage, the infrastructure or how migrations are applied.

Issue #87 holds the plan and the decisions. Every phase of it is closed except #93, which is future
work — browser-direct reads with Realtime. Hosting is **self-hosted on the VPS** (Coolify behind
Cloudflare): there is no Vercel and no serverless runtime, so a long-running Node process is what
the app can rely on.

The app is **in production** at `www.trivia-more.it`, with real users: a regression on `prod` is an
incident, which is why every change lands on `staging` first.

### Derived state

The achievement metrics are **rollups, not a recomputation**: four tables written incrementally
inside the transaction that produced the event, with the raw history kept as the authority that
proves them right. **For anything touching traguardi — a new badge, a new metric, the rollup tables,
or the backfill/reconcile/replay runbook — use the `achievements` skill.**

### Roles

`SUPERADMIN > ADMIN > MAINTAINER > STUDENT`. Platform-level features (changelogs, news, user roles)
are **SUPERADMIN-only**. ADMIN and MAINTAINER are content-scoped: a MAINTAINER may only touch
sections and questions of classes belonging to a course they maintain, and never private sections.

### Tables

Every table in the app is the one `DataTable` in `src/components/data-table/`, built on TanStack
Table **v9**, a redesign: v8 snippets from shadcn or elsewhere do not transfer. Column defs own the
header, sorting, alignment, responsive hiding and filters; state lives in the route's search params.
**For any table, column or filter work, use `stack-web-ts:data-tables`**, with these TriviaMore rules:

- Toolbars use `filterVariant="inline"` (one icon, then chips with *è uno di* / *non è uno di*), and
  every facet has an icon.
- A filter the table cannot own is a `CustomInlineFilter` in `inlineFilters`, with its params in
  `extraResetKeys`, or a control in the toolbar's `filters` slot.
- `arrHas` is still registered but has no exclude operator: new code does not use it.
- Columns resize by default: `enableResizing: false` on an actions column, `minSize` where 48 px is
  too narrow.
- In the admin console a detail sheet pairs `onRowClick` with `rowLink`, both writing `?detail=<id>`.
  A change to `DataTable` also runs the console's typecheck,
  `pnpm --filter admin-console exec tsc --noEmit -p .`.

## Database

The Drizzle schema in `src/db/schema/` is the source of truth. **For any schema, entity, relation,
migration or row-type work, use `stack-web-ts:drizzle-schema`.** TriviaMore adds to it, or departs
from it, in the rules below; where the two disagree, these win.

- `src/db/schema/entities/` has one folder per Postgres schema (`public`, `catalog`, `quiz`,
  `internal`, `crm`, `ops`), each with its own `enums.ts` and, where needed, `relations.ts`. Tables
  outside `public` use the schema handles in `common.ts`, which also holds the `tsvector` type.
- Timestamps are `mode: "string"`, except in the Better Auth tables (`users`, `sessions`,
  `accounts`, `verifications`), which are Dates because Better Auth reads and writes them.
- A new table with `updated_at` gets a `set_<table>_updated_at` trigger on the existing
  `public.handle_updated_at()`, in a `--custom` migration; never a second trigger function. The
  Better Auth tables have no trigger, on purpose.
- `drizzle-kit` reads `SUPABASE_DB_URL ?? DATABASE_URL` (the admin role, for DDL); `getDb()` and
  `scripts/**` read only `DATABASE_URL` (the runtime role).
- Staging, production, the test database and CI apply migrations through `scripts/db/migrations.ts`,
  which runs each file in its own transaction and prints the failing statement. A
  `CREATE INDEX CONCURRENTLY` cannot run in a transaction, so it needs that script changed first.
- The rebuild check: `pnpm db:test:up`, then `pg_dump --schema-only --no-owner --no-privileges
  --no-comments -n public -n catalog -n quiz -n internal -n crm -n ops -n pgboss` on it and on the
  database the migrations were developed against, leaving out the `queue_stats_*` partitions that
  pg-boss creates at run time. The diff must be empty. Then `pnpm db:test:down`.

Rules that are not negotiable:

- **Every table gets `.enableRLS()` and no policy.** That denies every role that does not bypass
  RLS; the app's runtime role, `trivia_app`, has `BYPASSRLS`. This overrides the plugin, which
  leaves RLS out.
- **Every migration is backward compatible.** The code of the previous release must run on the new
  schema: drops, renames, type changes and new `NOT NULL`s are split into expand and contract steps
  across releases. **For any migration, use `method:safe-changes`; for a change to a server
  function's input or behaviour, `stack-web-ts:server-functions`.**
- **Migrations are applied by hand, never from a container start command, an entrypoint, a deploy
  hook or a pipeline.** To staging while the change is developed (`pnpm db:migrate:staging --apply`);
  to production before its release is merged, after `pnpm db:dump:prod` (`pnpm db:migrate:prod`, then
  `--apply`). CI only checks them, on an empty Postgres. A migration that changes after it reached
  staging means `pnpm db:reset-staging`, not a repair: staging is the only place an applied
  migration may still change, and only until it is merged.
- **No `psql` on the host.** Run it from the image, as the scripts do:
  `docker run --rm -i postgres:17 psql "$URL" -c "..."`.

`drizzle/archive/` is a frozen archive. Nothing new goes there. The chain
starts at `drizzle/0000_baseline.sql`, which builds the whole schema on an empty Postgres.

## Conventions

- **For any UI work — a component, a colour, a radius, a shadow, a background, an animation — use the
  `design-system` skill.** It holds the rules and the traps `tsc` cannot catch. The decisions are in
  `docs/DESIGN_DECISIONS.md` (D1–D26) and the system as it stands in `docs/DESIGN_SYSTEM.md`; **token
  values live in `src/styles/globals.css` and nowhere else.** A colour change must clear
  `src/styles/contrast.test.ts`, which fails `pnpm test` on a regression.
- **Comments are forbidden by default, and every one is a single line.** A one-line TSDoc only where
  the signature cannot say it; a one-line `//` only where the line would look wrong without it. No
  history, no redirects, no section labels, no TODO (not even with an issue number: open the
  issue), English only, domain terms included. The reasoning goes in the commit, the PR or the
  issue. **For any comment, use `method:code-comments`**; the one-line limit here overrides the
  extra doc lines it allows.
- **For any text someone else reads (UI copy, commits, PRs, issues, docs, comments), use
  `method:plain-writing`.** It bans the tics that mark text as generated, and its last pass is not
  optional. The UI is in Italian, and D7 in `docs/DESIGN_DECISIONS.md` sets the bar for its copy.
- Umami custom events go through `track` in `src/lib/analytics/track.ts`, with typed names and properties:
  never an id, an email or text the user typed.
- Prefer editing an existing file over adding one; match the surrounding style.
- When a route has a `pendingComponent`, update the matching skeleton in
  `src/components/skeletons/` whenever you change the page layout.
- **Content outside production comes from scripts:** the catalogue from CINECA (`catalog:populate`, then
  `catalog:sync`), the departments and their sites from `scripts/catalog/departments.json`, and made-up
  sections and questions from `scripts/db/seed-content.ts`. `pnpm db:reset-staging` runs them all.
  Production content is still written through the admin and the SQL console.

## Verification

Run `pnpm exec tsc --noEmit`, `pnpm test` and the build yourself, and report the real output. A UI
change also has to pass `pnpm build-storybook`. **Browser verification is the user's job** — never
claim a UI change works because it compiles, and note that a green Storybook build proves a story
*compiles*, not that it renders.

A server-function change also runs `pnpm smoke:reads` and `pnpm smoke:writes`, and a new read path
goes into `scripts/smoke/read-endpoints.ts`, unless `requireAdmin()` guards it (the guard needs the
request's cookies). `pnpm test` is the offline tier only; the database-backed tests are
`pnpm test:db`.

Every push runs `scripts/check-public.sh --pushed` from `.githooks/pre-push` (enable it once per
clone: `git config core.hooksPath .githooks`). It blocks secrets, addresses, ids and private names in
the lines the push adds, and stops with exit code 2 unless `CLAUDE_KIT_DENYLIST` points at the private
deny list. Its settings are in `.check-public`; the script is a copy of the one in `claude-kit`, and
changes go there first.

Components live in Storybook: every `ui/` primitive has a story, and so does every shared component.
**For writing or fixing a story, or anything under `.storybook/`, use the `storybook` skill** — it
holds the two story shapes, the title taxonomy and the components that cannot be storied at all.

Tests are co-located with the source they cover. Two tiers, split by suffix, in `vitest.config.ts`
(kept separate from `vite.config.ts`): `*.test.ts` needs no database and no network — offline, CI-safe,
the `pnpm test` gate; `*.itest.ts` is DB-backed via `pnpm test:db`. Reading a repo file is allowed in
the unit tier, which is how `src/styles/contrast.test.ts` gates the colour tokens against WCAG. The integration tier runs on the
plain Postgres of `pnpm db:test:up`, connects as the postgres admin through `TEST_DATABASE_URL` (defaults to
that database on :54329, refuses any non-local host), and runs each test inside a transaction that is
always rolled back — so it seeds its own fixtures and leaves the database untouched. Helpers live in
`src/lib/testing/`. Component tests are deliberately out of scope (#109).
