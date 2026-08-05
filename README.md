<div align="center">
  <img src="./public/logo512.png" alt="TriviaMore" width="120" />

  <h1>TriviaMore</h1>

  <p><strong>An open source study ecosystem for UniMore — full university catalog, hierarchical content, role-based collaboration. Built by students, for students.</strong></p>

  <p>
    <a href="https://www.trivia-more.it"><img src="https://img.shields.io/badge/live-trivia--more.it-bc351a?style=for-the-badge" alt="Live site" /></a>
    <a href="https://github.com/MarinCervinschi/TriviaMore/stargazers"><img src="https://img.shields.io/github/stars/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="Stars" /></a>
    <a href="https://github.com/MarinCervinschi/TriviaMore/network/members"><img src="https://img.shields.io/github/forks/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="Forks" /></a>
    <a href="https://github.com/MarinCervinschi/TriviaMore/issues"><img src="https://img.shields.io/github/issues/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="Open issues" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/github/license/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="License" /></a>
    <img src="https://img.shields.io/github/last-commit/MarinCervinschi/TriviaMore?style=for-the-badge&color=bc351a" alt="Last commit" />
  </p>
</div>

## About

TriviaMore is an open source study **ecosystem** for the University of Modena and Reggio Emilia (UniMore). It is not just a quiz tool: it mirrors the full UniMore catalog as a five-level hierarchy (departments → courses → classes → sections → questions), wraps it in interactive learning surfaces (study quizzes, exam simulations, flashcards), and exposes a layered role system (guest → student → maintainer → admin → superadmin) so the catalog can be curated collaboratively by the students who actually take the exams. Personal dashboards turn that catalog into a structured study path: follow your classes, bookmark questions, track progress over time, and see where you stand course by course.

## Features

- **Quizzes** — Study mode (no timer, instant feedback) and Exam Simulation (timer, randomized questions, final score). Multiple choice, true/false, short answer.
- **Flashcards** — Flip-card sessions with progress tracking.
- **Hierarchical catalog** — Browse departments → courses → classes → sections → questions, with search, filters and breadcrumbs.
- **Personal dashboard** — Followed classes, bookmarks, interactive progress charts, notifications.
- **Guest mode** — Quizzes and flashcards work without an account.
- **Role-based back office** — Department-scoped maintainers curate content; admins manage users; superadmins manage the platform itself.
- **Bulk content tools** — Mass import, request workflow for community-submitted edits.

## Stack

A short tour of the technologies that power the platform — click any name to jump to its docs.

- <img src="https://api.iconify.design/logos:react.svg" height="16" /> **[React 19](https://react.dev)** — UI library, Server Components-aware.
- <img src="https://api.iconify.design/logos:typescript-icon.svg" height="16" /> **[TypeScript](https://www.typescriptlang.org)** — Strict end-to-end typing across client, server functions and Supabase schema.
- <img src="https://api.iconify.design/logos:tanstack.svg" height="16" /> **[TanStack Start](https://tanstack.com/start)** — Full-stack React framework with file-based routing, server functions and built-in data loading.
- <img src="https://api.iconify.design/logos:vitejs.svg" height="16" /> **[Vite](https://vite.dev)** — Dev server and build tool.
- <img src="https://api.iconify.design/logos:tailwindcss-icon.svg" height="16" /> **[Tailwind CSS v4](https://tailwindcss.com)** — Utility-first styling with CSS variables and `@theme`.
- <img src="https://api.iconify.design/simple-icons:shadcnui.svg" height="16" /> **[shadcn/ui](https://ui.shadcn.com)** — New York style components on top of Radix UI primitives.
- <img src="https://api.iconify.design/logos:tanstack.svg" height="16" /> **[TanStack Query](https://tanstack.com/query)** — Server-state cache with persistent storage.
- <img src="https://api.iconify.design/logos:supabase-icon.svg" height="16" /> **[Supabase](https://supabase.com)** — Postgres database, auth, storage and realtime.
- <img src="https://api.iconify.design/simple-icons:infisical.svg" height="16" /> **[Infisical](https://infisical.com)** — Secrets management, injected by the CLI in dev and in the container entrypoint.
- <img src="https://api.iconify.design/logos:vitest.svg" height="16" /> **[Vitest](https://vitest.dev)** — Unit testing.

## Quick start

**1. Install dependencies**

```bash
pnpm install
```

**2. Start the local Supabase stack** (requires Docker)

```bash
supabase start
```

**3. Log in to Infisical** (first time only)

```bash
infisical login
infisical init
```

**4. Start the dev server** with secrets injected

```bash
pnpm dev
```

For UI-only work without secrets, skip steps 3–4 and run `pnpm dev:no-secrets`.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server with Infisical secrets |
| `pnpm dev:no-secrets` | Dev server without Infisical |
| `pnpm build` | Production build |
| `pnpm build:dev` | Dev build with Infisical CLI |
| `pnpm start` | Start production server (`node .output/server/index.mjs`) |
| `pnpm preview` | Preview the production build |
| `pnpm test` | Run tests with Vitest |
| `pnpm db:generate` | Generate a migration from the Drizzle schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:check` | Check the migration history for conflicts |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:dump` | Back up the database (schema + data) via the Supabase CLI |

## Environment variables

Secrets are managed via [Infisical](https://infisical.com) (self-hosted). Contributors without access can fall back to a plain `.env` and the `:no-secrets` script variants.

See [`docs/SECRETS.md`](./docs/SECRETS.md) for the full variable list, the with/without-Infisical workflows, and production setup.

## Supabase local development

```bash
supabase start          # start all services (requires Docker)
supabase status         # show URLs and keys
supabase stop           # stop all services
supabase db reset       # re-apply migrations + seed
```

| Service | URL |
|---|---|
| Studio | http://127.0.0.1:54323 |
| API | http://127.0.0.1:54321 |
| Database | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Mailpit | http://127.0.0.1:54324 |

## Database

`supabase db reset` applies all migrations and runs `supabase/seed.sql`, which provisions:

- A superadmin user (`admin@trivia-more.local` / `password123`)
- Catalog data (departments, courses, classes, sections, questions) dumped from staging

### Migrations (Drizzle, Code First)

The Drizzle schema in `src/db/schema/` is the source of truth. `drizzle-kit` diffs it against the database and writes SQL into `drizzle/`; both the TS change and the generated `.sql` are committed together. Same model as EF Core.

Entities live one per file under `src/db/schema/entities/<postgres-schema>/`:

```
src/db/schema/
├── common.ts                  pgSchema handles + the tsvector custom type
├── index.ts                   barrel consumed by drizzle-kit and the runtime client
└── entities/
    ├── public/                profiles.ts, notifications.ts, … + enums.ts + relations.ts
    ├── catalog/               departments.ts, courses.ts, sections.ts, … + enums.ts + relations.ts
    └── quiz/                  quizzes.ts, quiz-attempts.ts, … + enums.ts + relations.ts
```

Naming follows the Drizzle convention: the table object is camelCase plural mirroring the SQL name (`courses`, `quizAttempts`), relations are `<table>Relations`, and row types are derived rather than hand-written — `type Course = typeof courses.$inferSelect`, `type NewCourse = typeof courses.$inferInsert`. Values and types never collide because one is plural camelCase and the other singular PascalCase. Row types stay in `src/lib/*/types.ts` next to the view models built on them.

An entity file holds only what ends up in a migration: columns, indexes, constraints and foreign keys. **Relations live in the per-schema `relations.ts`** — they produce no DDL, they only feed `db.query`. Keeping them out is what makes the module graph acyclic: relations files import entities, entities never import relations, and the foreign-key graph on its own is a DAG. Co-locating them instead creates import cycles that happen to work but break the moment a table is referenced at module scope outside a `foreignKey` or a `relations` callback.

This also maps onto Drizzle's Relational Queries v2, where relations move into `defineRelations` / `defineRelationsPart` merged at client construction — the three files become three parts.

Each folder has its own `enums.ts`. Enum types are declared with `pgEnum`, not `<schema>.enum()`: every enum lives in the `public` Postgres schema because it is shared across the three, so the folder layout is organisational only.

```bash
pnpm db:generate --name add_something   # diff the schema -> drizzle/*.sql   (ef migrations add)
pnpm db:generate --custom --name grants # empty file for raw SQL             (migrationBuilder.Sql)
pnpm db:migrate                         # apply pending migrations           (ef database update)
```

**Migrations are always applied by hand.** They never run on container start, in an entrypoint, or in an automatic pre-deploy hook, in any environment. Apply the migration first, deploy the code second; use expand/contract for destructive changes, because rolling back a deploy does not roll back the schema.

There is deliberately no `db:push` — always generate + migrate, so every change leaves a reviewable SQL file.

The app connects through `DATABASE_URL` — the least-privilege `trivia_app` role in production — while `drizzle-kit` and the Supabase CLI connect as the admin role through `SUPABASE_DB_URL` (falling back to `DATABASE_URL` locally). `supabase/migrations/` is the historical archive from before the cutover and is no longer applied.

### Refresh seed from staging

```bash
# Catalog-only (used to update seed.sql)
infisical run --recursive -- supabase db dump --data-only --linked --schema catalog -f supabase/seed_catalog.sql

# Full backup
infisical run --recursive -- supabase db dump --data-only --linked -f data/dump.sql
```

To restore a full dump locally:

```bash
docker exec -i supabase_db_TriviaMore psql -U postgres -d postgres < data/dump.sql
```

### Backups

`pnpm db:dump` writes a timestamped schema + data dump under `backups/` (gitignored), using the Supabase CLI's bundled `pg_dump` — no local install needed. Take one before applying a migration to a shared database.

```bash
pnpm db:dump                                                                    # local
SUPABASE_DB_URL='postgresql://postgres:PASSWORD@HOST:PORT/postgres' pnpm db:dump prod
```

### Self-hosted production database

The production database runs on a self-hosted Supabase instance (Postgres without TLS exposed on the host). To connect via the Supabase CLI for `db push`, `migration list`, `db dump`, etc., set both `PGSSLMODE` and the connection string:

```bash
export PGSSLMODE=disable
export SUPABASE_DB_URL='postgresql://postgres:PASSWORD@HOST:PORT/postgres'

supabase migration list --db-url "$SUPABASE_DB_URL"
supabase db push --db-url "$SUPABASE_DB_URL"
```

**Why `PGSSLMODE=disable` and not `?sslmode=disable` in the URL?** The Supabase CLI (≥2.40.4) ignores the `sslmode` query parameter in `--db-url`, so the env var is the only working way to disable TLS. See [supabase/cli#4142](https://github.com/supabase/cli/issues/4142).

### Auth email templates

Custom email templates are served as static assets from `public/email-templates/` so both local dev and the self-hosted GoTrue can fetch them. To customise the confirmation email, edit `public/email-templates/confirmation.html` and redeploy. The local CLI reads it via `supabase/config.toml`; self-hosted GoTrue fetches it via the public URL set in `MAILER_TEMPLATES_CONFIRMATION` (e.g. `https://www.trivia-more.it/email-templates/confirmation.html`).

## Authentication

Supabase Auth with email/password and OAuth (GitHub, Google). Routes are protected via `requireAuth` / `requireGuest` guards in `beforeLoad`:

```typescript
export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => requireAuth(),
  component: Dashboard,
})
```

## Contributing

Contributions are welcome — both to the code and to the catalog content.

- **Found a wrong question or missing topic?** Open an issue with the `content` label and link to the affected section.
- **Found a bug or want to propose a feature?** Open an issue with the `bug` or `enhancement` label.
- **Code contributions:**
  1. Fork the repo and create a branch off `master` (e.g. `feat/quiz-shortcuts`, `fix/sitemap-encoding`).
  2. Follow the existing patterns and keep commits small and logical.
  3. Run `pnpm test` and `pnpm build` before pushing.
  4. Open a pull request against `master` with a short description and screenshots for UI changes.

Want to maintain the catalog of your own department? Open an issue and we'll grant you the maintainer role for that scope.

## Branches

```
master          → Production (TanStack Start v3.0)
trivia-more-3.0 → Reference: old Next.js code + migration roadmap
```

The previous Next.js version is archived as tag [`v2.0.0`](https://github.com/MarinCervinschi/TriviaMore/releases/tag/v2.0.0).

## License

Released under the [MIT License](./LICENSE).
