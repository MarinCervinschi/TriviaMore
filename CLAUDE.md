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

**Use pnpm, never npm.** Anything needing secrets goes through the `pnpm` scripts, which wrap
`infisical run` — don't call `infisical` by hand or expect a `.env` to exist.

## Architecture

`createServerFn` is the only API the browser talks to. The client never queries the database
directly; the one exception is a Storage upload in `src/components/requests/request-form.tsx`.

```
src/lib/<domain>/server.ts    server functions (the API surface)
src/lib/<domain>/types.ts     row types + view models
src/lib/auth/guards.ts        requireAuth / requireAdmin / requireSuperadmin
src/lib/auth/checks.ts        section access gate (replaces the can_access_section RLS helper)
src/lib/admin/server/access.ts  content-scoped authorization (MAINTAINER scoping)
src/db/                       Drizzle client + schema
src/routes/                   file-based routes
```

## Refactor in progress — read #87 first

Data access is moving from supabase-js to Drizzle and PostgREST is being closed. Both paths coexist
until it lands: **check which one a file uses before editing.** Auth and Storage stay on supabase-js
permanently. Issue #87 holds the plan, the ordering, the decisions behind it and a checkpoint of how
far it has got; the phase issues hold the detail.

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
