# TriviaMore

Open source study platform for UniMore. TanStack Start (React 19, Vite, Nitro) on a self-hosted
Supabase stack. Content is a five-level hierarchy: departments → courses → classes → sections →
questions.

## Commands

| | |
|---|---|
| `pnpm dev` | dev server (Infisical injects secrets) |
| `pnpm build:dev` | production build with secrets |
| `pnpm test` | Vitest |
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
src/lib/admin/server/access.ts       content-scoped authorization (MAINTAINER scoping)
src/db/                              Drizzle client + schema
src/routes/                          file-based routes
```

Domains not yet migrated still use the old shape: a single `src/lib/<domain>/server.ts` on
supabase-js, with snake_case view models.

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

Middleware is per-endpoint (`.middleware([errorMiddleware, authMiddleware])`) rather than global,
because `errorMiddleware` replaces unexpected errors with a generic message and the unmigrated
domains still rely on `throw new Error("<italian message>")` reaching the toast. It moves to
`createStart({ functionMiddleware })` in `src/start.ts` once every domain is migrated.

## Refactor in progress — read #87 first

Data access is moving from supabase-js to Drizzle and PostgREST is being closed. Both paths coexist
until it lands: **check which one a file uses before editing.** Auth and Storage stay on supabase-js
permanently. Issue #87 holds the plan, the ordering, the decisions behind it and a checkpoint of how
far it has got; the phase issues hold the detail.

Migrated so far: `quiz`, `browse`, `flashcard`, `catalog` and the section access gate — on Drizzle,
with camelCase view models. Everything else (`admin`, `requests`, `user`, `notifications`, `legal`,
`changelogs`, `sitemap`) is still on supabase-js with snake_case view models.

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

- **Comments in English**, and only when they explain something the code cannot — a *why*, a
  workaround, a non-obvious constraint. No comments that restate the line below them.
- Prefer editing an existing file over adding one; match the surrounding style.
- When a route has a `pendingComponent`, update the matching skeleton in
  `src/components/skeletons/` whenever you change the page layout.
- Seed data is applied through a SQL console, not a seed script.

## Verification

Run `pnpm exec tsc --noEmit`, `pnpm test` and the build yourself, and report the real output.
**Browser verification is the user's job** — never claim a UI change works because it compiles.
