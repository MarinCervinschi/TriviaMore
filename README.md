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
- <img src="https://api.iconify.design/logos:supabase-icon.svg" height="16" /> **[Supabase](https://supabase.com)** — Self-hosted Postgres, auth and storage.
- <img src="https://api.iconify.design/simple-icons:infisical.svg" height="16" /> **[Infisical](https://infisical.com)** — Secrets, injected by the CLI in dev and in the container entrypoint.
- <img src="https://api.iconify.design/logos:vitest.svg" height="16" /> **[Vitest](https://vitest.dev)** — Unit and integration tests.
- <img src="https://api.iconify.design/logos:storybook-icon.svg" height="16" /> **[Storybook](https://storybook.js.org)** — Component workbench.

## Quick start

```bash
pnpm install
supabase start        # local Postgres, auth and storage (requires Docker)
infisical login       # first time only
infisical init
pnpm dev
```

For UI-only work without secrets, run `pnpm dev:no-secrets` and skip the Infisical steps.

| Local service | URL |
|---|---|
| App | http://127.0.0.1:3000 |
| Supabase Studio | http://127.0.0.1:54323 |
| Supabase API | http://127.0.0.1:54321 |
| Database | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Mailpit | http://127.0.0.1:54324 |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server with Infisical secrets |
| `pnpm dev:no-secrets` | Dev server without Infisical |
| `pnpm build` / `pnpm build:dev` | Production build, without / with secrets |
| `pnpm start` | Serve the production build |
| `pnpm test` | Unit tests — offline, no database |
| `pnpm test:db` | Integration tests — needs the local stack |
| `pnpm storybook` / `pnpm build-storybook` | Component workbench, and the build that proves stories compile |
| `pnpm format` | Prettier — tabs and semicolons |
| `pnpm db:generate --name x` | Generate a migration from the schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm db:dump` | Back up schema + data under `backups/` |
| `pnpm smoke:reads` / `pnpm smoke:writes` | Run every read path, and the write paths in a rolled-back transaction |

## Configuration

Secrets are managed with [Infisical](https://infisical.com), self-hosted. Every script that needs
them wraps `infisical run`, so there is no `.env` to maintain — contributors without access use the
`:no-secrets` variants. The full variable list and the production setup are in
[`docs/SECRETS.md`](./docs/SECRETS.md).

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

The app connects through `DATABASE_URL`; `drizzle-kit` and the Supabase CLI connect as the admin
role through `SUPABASE_DB_URL`.

`supabase/migrations/` is a frozen archive from before the cut-over — nothing new goes there, but it
is still what `supabase start` uses to build the local database. The Drizzle migrations run **on top
of a Supabase-provisioned database**: `drizzle/0000_baseline.sql` expects the `auth` schema, so they
do not bootstrap an empty one on their own.

Conventions for entities, relations, enums and row types are in
[`.claude/skills/drizzle-schema`](./.claude/skills/drizzle-schema/SKILL.md).

## Authentication

Supabase Auth with email/password and OAuth (GitHub, Google). Routes are protected by guards in
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
Cloudflare, co-located with the Supabase stack. `prod` is production, `preview` is the preview
instance. Secrets come from Infisical at container start — an unreachable Infisical fails the start
rather than leaving a container serving errors.

Auth emails are served as static assets from `public/email-templates/`, so both the local CLI and the
self-hosted GoTrue can fetch them.

## Documentation

| | |
|---|---|
| [`CHANGELOG.md`](./CHANGELOG.md) | Technical release notes, written at each merge to `prod` |
| [`CLAUDE.md`](./CLAUDE.md) | Architecture, conventions and the rules that are not negotiable |
| [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) · [`docs/DESIGN_DECISIONS.md`](./docs/DESIGN_DECISIONS.md) | The UI system, and the reasoning behind each decision |
| [`docs/OBSERVABILITY.md`](./docs/OBSERVABILITY.md) | Structured logging to Seq |
| [`docs/SECRETS.md`](./docs/SECRETS.md) · [`docs/SECURITY.md`](./docs/SECURITY.md) | Secrets, and the security model |
| [`.claude/skills/`](./.claude/skills) | Working conventions per area: schema, tables, design system, server functions, Storybook |

## Contributing

Contributions are welcome — to the code and to the catalog content.

- **A wrong question or a missing topic?** Open an issue with the `content` label, linking the section.
- **A bug or an idea?** Open an issue with the `bug` or `enhancement` label.
- **Code:** fork, branch off `preview` (`feat/quiz-shortcuts`, `fix/sitemap-encoding`), keep commits
  small and in Conventional Commits style, run `pnpm test` and `pnpm build`, then open a pull request
  against `preview` with screenshots for UI changes.

Want to maintain the catalog of your own department? Open an issue and we'll grant you the
maintainer role for that scope.

## Branches

```
preview → Active development, and the preview instance
prod    → Production (default branch)
```

`master` is frozen at the pre-rewrite state and kept as an archive; the Next.js version before it is
tagged [`v2.0.0`](https://github.com/MarinCervinschi/TriviaMore/releases/tag/v2.0.0).

## License

Released under the [MIT License](./LICENSE).
