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

TriviaMore mirrors the full UniMore catalog as a five-level hierarchy — departments → courses →
classes → sections → questions — and wraps it in study quizzes, exam simulations and flashcards. A
layered role system (guest → student → maintainer → admin → superadmin) lets the catalog be curated
by the students who actually sit the exams, and personal dashboards turn it into a study path:
follow your classes, bookmark questions, and track where you stand course by course.

## Features

- **Quizzes** — Study mode (no timer, instant feedback) and Exam Simulation (timer, randomized
  questions, final score). Multiple choice, true/false, short answer.
- **Flashcards** — Flip-card sessions with progress tracking.
- **Hierarchical catalog** — Browse the five levels, with search, filters and breadcrumbs.
- **Progress hub** — Trends over time, per-course rollup, per-difficulty mastery, study rhythm and
  the full attempt history.
- **Guest mode** — Quizzes and flashcards work without an account.
- **Role-based back office** — Course-scoped maintainers curate content, admins manage users,
  superadmins manage the platform.
- **Contribution flow** — Propose sections, questions or files; report a wrong question; follow your
  requests in a personal inbox.

## Stack

- <img src="https://api.iconify.design/logos:react.svg" height="16" /> **[React 19](https://react.dev)** — UI library.
- <img src="https://api.iconify.design/logos:typescript-icon.svg" height="16" /> **[TypeScript](https://www.typescriptlang.org)** — Strict typing across client, server functions and the schema.
- <img src="https://api.iconify.design/logos:tanstack.svg" height="16" /> **[TanStack Start](https://tanstack.com/start)** — Full-stack React framework: file-based routing, server functions, data loading. Built by Vite, served by Nitro.
- <img src="https://api.iconify.design/logos:tailwindcss-icon.svg" height="16" /> **[Tailwind CSS v4](https://tailwindcss.com)** — Utility-first styling with CSS variables and `@theme`.
- <img src="https://api.iconify.design/simple-icons:shadcnui.svg" height="16" /> **[shadcn/ui](https://ui.shadcn.com)** — New York style components on Radix UI primitives.
- <img src="https://api.iconify.design/logos:tanstack.svg" height="16" /> **[TanStack Query](https://tanstack.com/query)** — Server-state cache.
- <img src="https://api.iconify.design/simple-icons:drizzle.svg" height="16" /> **[Drizzle ORM](https://orm.drizzle.team)** — Schema, queries and migrations, over a direct Postgres connection.
- <img src="https://api.iconify.design/logos:postgresql.svg" height="16" /> **[PostgreSQL](https://www.postgresql.org)** — Self-hosted, one database per environment.
- <img src="https://api.iconify.design/simple-icons:betterauth.svg" height="16" /> **[Better Auth](https://www.better-auth.com)** — Email and password, and OAuth, inside the app.
- **[Garage](https://garagehq.deuxfleurs.fr)** — Self-hosted S3 store for uploaded files.
- <img src="https://api.iconify.design/simple-icons:infisical.svg" height="16" /> **[Infisical](https://infisical.com)** — Secrets, injected by the CLI in dev and in the container entrypoint.
- <img src="https://api.iconify.design/logos:vitest.svg" height="16" /> **[Vitest](https://vitest.dev)** — Unit and integration tests.
- <img src="https://api.iconify.design/logos:storybook-icon.svg" height="16" /> **[Storybook](https://storybook.js.org)** — Component workbench.

## Quick start

```bash
pnpm install
infisical login       # first time only
pnpm dev
```

`pnpm dev` reads Infisical's `dev` environment, which points at the staging database, files and mail
on the staging server, so it needs the tailnet.

For UI-only work without secrets, run `pnpm dev:no-secrets` and skip the Infisical steps.

| Service | URL |
|---|---|
| App | http://127.0.0.1:3000 |
| Staging | https://pr.trivia-more.it, behind Cloudflare Access |
| Staging mail | https://mail-pr.trivia-more.it, behind Cloudflare Access |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server with Infisical secrets |
| `pnpm dev:no-secrets` | Dev server without Infisical |
| `pnpm build` / `pnpm build:dev` | Production build, without / with secrets |
| `pnpm start` | Serve the production build |
| `pnpm test` | Unit tests — offline, no database |
| `pnpm db:test:up` / `pnpm db:test:down` | An empty Postgres on :54329 with the migrations applied, and its removal |
| `pnpm test:db` | Integration tests, on the database `db:test:up` starts |
| `pnpm storybook` / `pnpm build-storybook` | Component workbench, and the build that proves stories compile |
| `pnpm format` | Prettier — tabs and semicolons |
| `pnpm db:generate --name x` | Generate a migration from the schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm db:dump` | Back up schema + data under `backups/` |
| `pnpm smoke:reads` / `pnpm smoke:writes` | Run every read path, and the write paths in a rolled-back transaction |
| `pnpm catalog:sync [--anno 2025] [--apply]` | Plan, then with `--apply` write, the changes from the official catalogue; `--anno` targets another academic year |
| `pnpm catalog:populate [--apply]` | Create the departments of `scripts/catalog/departments.json` and the degree courses of the official catalogue they lack; `catalog:sync` then adds the classes and plans |
| `pnpm db:reset-staging [--syllabi]` | Rebuild the staging database on `rieti`: migrations, the catalogue from CINECA, made-up sections and questions |
| `pnpm catalog:syllabi [--apply]` | Plan, then with `--apply` write, the official syllabi and the class descriptions taken from them |
| `pnpm catalog:recover-names [--apply]` | Name the curricula the catalogue labels only with a code |

## Configuration

Secrets are managed with [Infisical](https://infisical.com), self-hosted. Every script that needs
them wraps `infisical run`, so there is no `.env` to maintain — contributors without access use the
`:no-secrets` variants. The full variable list and the production setup are in
[`docs/SECRETS.md`](./docs/SECRETS.md).

The scripts that reach production or the shared infrastructure project (`*:prod`, `db:migrate:staging`,
`db:reset-staging`) take the project ids from the shell, never from the repo: export
`TRIVIAMORE_INFISICAL_PROJECT_ID` (production) and `INFISICAL_INFRA_PROJECT_ID` (`cervinschi-infra`).

## Database

The Drizzle schema in `src/db/schema/` is the source of truth. `drizzle-kit` diffs it against the
database and writes SQL into `drizzle/`; the TypeScript change and the generated `.sql` are committed
together. There is deliberately no `db:push` — every change leaves a reviewable file.

```bash
pnpm db:generate --name add_something   # diff the schema into drizzle/*.sql
pnpm db:generate --custom --name grants # an empty file for raw SQL
pnpm db:migrate                         # apply what is pending
```

**Migrations are always applied by hand.** Never on container start, in an entrypoint, or in a
deploy hook, in any environment. Apply the migration first and deploy the code second; use
expand/contract for destructive changes, because rolling back a deploy does not roll back the schema.
Take a `pnpm db:dump` before touching a shared database.

For a shared database, use `scripts/db/migrations.ts` instead of `pnpm db:migrate`. drizzle-kit runs
every pending migration in one transaction and hides the SQL error when one fails, so a migration that
adds an enum value next to one that uses it fails with no message. The script applies each migration
in its own transaction, records it the way drizzle does, and prints the statement that broke:

```bash
pnpm db:migrate:staging            # staging: the last one applied, and what is pending
pnpm db:migrate:staging --apply    # apply them, one transaction each
pnpm db:dump:prod                  # production: back up first
pnpm db:migrate:prod               # then read what is pending
pnpm db:migrate:prod --apply       # and apply it, before the release is merged
```

Both read the admin URL of their database from Infisical. CI applies every migration to an empty
Postgres on each pull request, and applies nothing anywhere else.

The app connects through `DATABASE_URL`, as `trivia_app`; `drizzle-kit` and the migration scripts
connect as the admin role through `SUPABASE_DB_URL`, a name kept from before the move.

`drizzle/archive/` holds the Drizzle migrations up to `0069`, squashed on
2026-10-11 into `drizzle/0000_baseline.sql`. The baseline builds the whole schema on an empty Postgres:
it creates a minimal `auth.users` where none exists, which nothing reads since Better Auth (#211). On a
database that already ran the old chain it counts as applied, since its timestamp is the one of `0069`.

Conventions for entities, relations, enums and row types are in the
[`drizzle-schema`](https://github.com/MarinCervinschi/claude-kit/tree/main/plugins/stack-web-ts/skills/drizzle-schema)
skill of the `stack-web-ts` plugin, and TriviaMore's own rules in [`CLAUDE.md`](./CLAUDE.md#database).

## Authentication

Better Auth inside the app (`src/lib/auth/server.ts`): email and password with a verified
address, and OAuth (GitHub, Google). Routes are protected by guards in
`beforeLoad`, from `src/lib/auth/guards.ts`:

```typescript
export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => requireAuth(),
  component: Dashboard,
})
```

Server functions declare their own middleware and authorize inside the service layer;
`requireAdmin` / `requireSuperadmin` cover the back office, and content-scoped checks live in
`src/lib/admin/access.ts`.

## Deployment

The app runs on a self-hosted VPS: Coolify builds the `Dockerfile` and deploys on push, behind
Cloudflare, next to its Postgres. `prod` is production, `staging` is the integration
branch and its instance. Secrets come from Infisical at container start — an unreachable Infisical fails the start
rather than leaving a container serving errors.

## Documentation

| | |
|---|---|
| [`CHANGELOG.md`](./CHANGELOG.md) | Technical release notes, written at each merge to `prod` |
| [`CLAUDE.md`](./CLAUDE.md) | Architecture, conventions and the rules that are not negotiable |
| [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) · [`docs/DESIGN_DECISIONS.md`](./docs/DESIGN_DECISIONS.md) | The UI system, and the reasoning behind each decision |
| [`docs/OBSERVABILITY.md`](./docs/OBSERVABILITY.md) | Structured logging to Seq |
| [`docs/ACHIEVEMENTS.md`](./docs/ACHIEVEMENTS.md) | Running the achievement backfill, reconcile and replay — and against which database |
| [`docs/SECRETS.md`](./docs/SECRETS.md) · [`docs/SECURITY.md`](./docs/SECURITY.md) | Secrets, and the security model |
| [`.claude/skills/`](./.claude/skills) | Working conventions per area: schema, tables, design system, server functions, Storybook |

## Contributing

Contributions are welcome — to the code and to the catalog content.

- **A wrong question or a missing topic?** Open an issue with the `content` label, linking the section.
- **A bug or an idea?** Open an issue with the `bug` or `enhancement` label.
- **Code:** fork, branch off `staging` (`feat/quiz-shortcuts`, `fix/sitemap-encoding`), keep commits
  small and in Conventional Commits style, run `pnpm test` and `pnpm build`, then open a pull request
  against `staging` with screenshots for UI changes.

Want to maintain the catalog of your own department? Open an issue and we'll grant you the
maintainer role for that scope.

## Branches

```
staging → Active development, and the staging instance (default branch)
prod    → Production
```

`master` is frozen at the pre-rewrite state and kept as an archive; the Next.js version before it is
tagged [`v2.0.0`](https://github.com/MarinCervinschi/TriviaMore/releases/tag/v2.0.0).

## License

Released under the [MIT License](./LICENSE).
