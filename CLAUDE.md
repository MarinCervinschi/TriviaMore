# TriviaMore

Open source study platform for UniMore. TanStack Start (React 19, Vite, Nitro) on a self-hosted
Supabase stack. Content is a five-level hierarchy: departments → courses → classes → sections →
questions.

## Commands

| | |
|---|---|
| `pnpm dev` | dev server (Infisical injects secrets) |
| `pnpm build:dev` | production build with secrets |
| `pnpm test` | Vitest — unit tier only (`*.test.ts`, offline) |
| `pnpm test:db` | Vitest — integration tier (`*.itest.ts`, needs local Supabase) |
| `pnpm exec tsc --noEmit` | typecheck |
| `pnpm db:generate --name x` | generate a migration from the Drizzle schema |
| `pnpm db:migrate` | apply pending migrations |
| `pnpm smoke:reads` | run every migrated read path against the live database |
| `pnpm smoke:writes` | run the quiz write paths in a transaction, then roll back |

**Use pnpm, never npm.** Anything needing secrets goes through the `pnpm` scripts, which wrap
`infisical run` — don't call `infisical` by hand or expect a `.env` to exist.

## Architecture

`createServerFn` is the only API the browser talks to. The client never queries the database
directly; the one exception is a Storage upload in `src/components/requests/request-form.tsx`.

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

The full rationale, with the reasoning behind each rule, is in the `server-functions` skill — **use
it when adding or moving a server function.**

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
ported from the old code. Auth and Storage stay on supabase-js, and are all `src/lib/supabase/` still
contains.

Issue #87 holds the plan and the decisions; #89 (drop the `_detail` views) and #92 (close PostgREST
at the edge) are what remain.

Automated testing is deliberately deferred until the refactor settles — see #109.

### Roles

`SUPERADMIN > ADMIN > MAINTAINER > STUDENT`. Platform-level features (changelogs, news, user roles)
are **SUPERADMIN-only**. ADMIN and MAINTAINER are content-scoped: a MAINTAINER may only touch
sections and questions of classes belonging to a course they maintain, and never private sections.

## Database

The Drizzle schema in `src/db/schema/` is the source of truth. **For any schema, entity, relation,
migration or row-type work, use the `drizzle-schema` skill** — it holds the conventions and the
traps.

Two rules that are not negotiable:

- **Migrations are applied by hand.** Never add `db:migrate` to a container start command, an
  entrypoint, or an automatic deploy hook, in any environment.
- **No `psql` on the host.** Query the local database through the container:
  `docker exec supabase_db_TriviaMore psql -U postgres -d postgres -c "..."`.

`supabase/migrations/` is a frozen archive. Nothing new goes there.

## Conventions

- **Comments are forbidden by default.** Code must read on its own. Two exceptions only, both used
  with maximum caution: a doc comment where one is genuinely needed, and a *strictly necessary* `why`
  — a non-obvious constraint, security rule or workaround whose absence would mislead. Both in
  English. Never restate the code or narrate what a line does. When in doubt, no comment.
- Prefer editing an existing file over adding one; match the surrounding style.
- When a route has a `pendingComponent`, update the matching skeleton in
  `src/components/skeletons/` whenever you change the page layout.
- Seed data is applied through a SQL console, not a seed script.

## Verification

Run `pnpm exec tsc --noEmit`, `pnpm test` and the build yourself, and report the real output.
**Browser verification is the user's job** — never claim a UI change works because it compiles.

Tests are co-located with the source they cover. Two tiers, split by suffix, in `vitest.config.ts`
(kept separate from `vite.config.ts`): `*.test.ts` is pure logic with no I/O — offline, CI-safe, the
`pnpm test` gate; `*.itest.ts` is DB-backed via `pnpm test:db`. The integration tier needs the local
stack up (`supabase start`), connects as the postgres admin through `TEST_DATABASE_URL` (defaults to
the local database, refuses any non-local host), and runs each test inside a transaction that is
always rolled back — so it seeds its own fixtures and leaves the database untouched. Helpers live in
`src/lib/testing/`. Component tests are deliberately out of scope (#109).
