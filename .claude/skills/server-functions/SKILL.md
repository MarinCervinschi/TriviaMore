---
name: server-functions
description: How server functions are structured in TriviaMore — api/ endpoints, service flow, when a query earns a db/ file, middleware, errors, input validation and view models. Use whenever adding, moving, splitting or reviewing a createServerFn, a Drizzle query behind one, or a domain's api/service/db layout. Also use before migrating a domain off supabase-js.
---

# Server functions

`createServerFn` is the only API the browser talks to. There is no controller class, no DI container
and no repository interface: **a module is the class, exported functions are its public members and
non-exported ones are its private methods.**

```
src/lib/<domain>/
  api/<endpoint>.ts     one server function per file, named after it
  api/index.ts          re-exports only
  service.ts            the flow: rules, transactions, queries, view models
  service/<area>.ts     same thing, split by area when one file gets long
  db/<table>.ts         only for queries used from more than one module
  schemas.ts            zod input schemas
  types.ts              row types from $inferSelect + view models
  columns.ts            shared column maps, when two queries must return one shape
  queries.ts            client: TanStack Query queryOptions
  mutations.ts          client: useMutation hooks
```

## The layers

### api/ — the endpoint

One file per server function, named after it in kebab-case minus the `Fn`: `startQuizFn` →
`api/start-quiz.ts`. Grep works in both directions and the file is findable without a search.

It declares middleware, validates input, calls a use case. Nothing else.

```ts
export const startQuizFn = createServerFn({ method: "POST" })
  .middleware([errorMiddleware, authMiddleware])
  .inputValidator(startQuizSchema)
  .handler(({ data, context }) => startQuiz(context.user.id, data))
```

An endpoint that is a single query with no rules may hold that query in the handler — see
`api/get-evaluation-modes.ts`. Do not export anything else from an `api/` file: `api/index.ts`
re-exports it, and a live export keeps server-only code reachable from the client graph.

### service — the flow

Owns transactions, authorization calls, its own queries and the mapping to view models. Use one
`service.ts` per domain; split into `service/<area>.ts` when it grows (browse has seven areas).

Never imported by client code. That is what keeps `pg` out of the browser bundle: the compiler
strips the handler and every import that only the handler used.

### db/<table>.ts — the exception

**A query earns a file here only when it is used from more than one module.** One caller means a
private function in the service that uses it. Two rules follow:

- **Cohesion wins over the counting rule.** Once a table has a `db/` file, put all of its queries
  there. Splitting one table between a service and a `db/` file is worse than either choice.
- **First argument is always `db: DbOrTx`.** That is what lets the same query run standalone or
  inside `db.transaction()`, and what lets `pnpm smoke:writes` drive a whole write flow and roll it
  back without touching real data.

No authorization, no user, no view models in `db/`. `src/lib/catalog/db/` is the cross-domain case:
the section chain, the primary-course subquery and the grouped question counts are used by quiz,
flashcard and browse alike.

## Why not a repository layer

Coming from EF Core the reflex is to inject a `DbContext` into a controller and to hide queries
behind an interface. Neither transfers:

- **Drizzle is not a `DbContext`.** No change tracking, no unit of work, no `SaveChanges()`. A query
  is a function of (connection, arguments) — so passing the handle explicitly *is* the injection.
- **An interface over the ORM buys nothing here.** It exists in .NET largely to mock the context;
  the write paths are tested against real Postgres in a rolled-back transaction instead.
- **A class would only pay for itself** with request-scoped state or a second implementation. There
  is neither.

## Middleware

`src/lib/server/middleware/`:

| | |
|---|---|
| `authMiddleware` | requires a session, puts `context.user` (`id`, `email`) in scope |
| `optionalAuthMiddleware` | `context.user` or `null` — for pages anonymous visitors can see |
| `errorMiddleware` | logs the real error, re-throws `AppError` untouched, replaces anything else |

Attach them per endpoint: `.middleware([errorMiddleware, authMiddleware])`. Not globally, because
`errorMiddleware` masks unexpected errors and the domains still on supabase-js rely on
`throw new Error("<italian message>")` reaching the toast. When every domain is migrated it moves to
`createStart({ functionMiddleware: [...] })` in `src/start.ts`.

Roles beyond authentication stay where they are: `requireAuth` / `requireAdmin` /
`requireSuperadmin` in `src/lib/auth/guards.ts`, MAINTAINER scoping in
`src/lib/admin/server/access.ts`, section access in `src/lib/auth/checks.ts`.

**Never wrap `createServerFn` in a factory.** The Vite plugin finds it by import binding; a wrapper
like `authedFn({ ... })` compiles and then silently fails to register the function.

## Errors

`src/lib/server/errors.ts` — `AppError` with `Unauthorized`, `Forbidden`, `NotFound`, `Conflict`,
`Invalid`. Its message is written for the user and reaches the toast verbatim. Anything else that
escapes a handler is logged with its stack and replaced by a generic message, so a Postgres error
never reaches the browser.

`rethrowPgError(err, { unique: "…" })` turns a constraint violation into a `Conflict` with a message
worth reading, and re-throws everything else untouched.

## Input and output

- Validate with a zod schema from `schemas.ts`, never a passthrough `(input: T) => input`.
- View models are **camelCase** and derive from `$inferSelect`, not from
  `src/lib/supabase/database.types.ts` — that file dies with PostgREST.
- Never ship a generated `fts` column to the client; select columns explicitly (`columns.ts`) when
  `select()` would include one.
- Return `null` for "not found or not visible" on read endpoints whose route renders a not-found
  state; throw for genuine failures.

## Before calling it done

```
pnpm exec tsc --noEmit     # catches every consumer of a renamed field
pnpm smoke:reads           # every migrated read path against the live database
pnpm smoke:writes          # write paths in a transaction, rolled back
pnpm build                 # must leave no drizzle/pg in .output/public
```

`tsc` proves nothing about SQL. Aliased subqueries in particular are silent: two joined tables with a
`code` column will both render as `"alias"."code"` unless every column in the subquery gets an
explicit alias — see `primaryCourseByClass` in `src/lib/catalog/db/course-classes.ts`. That bug was
written once and only the smoke test caught it.

When migrating a domain off supabase-js, add its read paths to `scripts/smoke/read-endpoints.ts` as
you go — that is the only automated check the project has until #109.
