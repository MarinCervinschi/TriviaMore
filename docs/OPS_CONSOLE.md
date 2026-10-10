# Ops console — architecture

**Status:** accepted (#193, part of #188). The points marked *to verify* are checked in #194.
**Amended 2026-10-10:** no staging instance and no promotion. The deployed console works on production, with a
simulation before every write; the local Supabase is where a job is developed and tried.

The ops console is a second app, deployed on its own, from which the owner runs and watches the jobs that keep
TriviaMore's official data current: catalog, syllabi, plans, and later timetables and exam sittings. It is not
part of the student app, and its access has nothing to do with the app's roles.

## Context

- The data jobs exist today as scripts run by hand: `catalog:sync`, `catalog:syllabi`, `catalog:recover-names`,
  `catalog:diff`. Each run takes minutes, reads from public sources one request at a time with a disk cache, and
  ends with a re-plan that must come out empty.
- The app is self-hosted on a VPS, on Coolify behind Cloudflare. A long-running Node process is available; there
  is no serverless runtime.
- **There is one hosted database, production.** Infisical's `staging` and `prod` environments point at it; the
  local Supabase is the only other one.
- The app's roles (SUPERADMIN, ADMIN, MAINTAINER, STUDENT) govern content and section access. The console's
  concerns (jobs, sync, data health, later feature flags and analytics) belong to the platform's owner only.

## Decisions taken

### Monorepo

The console lives in this repository as a pnpm workspace. The Drizzle schema has one copy, used by both apps:
two copies of a schema drift, and the migration chain must stay single.

```
/                  the student app, unchanged
admin-console/     the ops console, a workspace package
packages/db/       Drizzle schema, client, migrations (today's src/db/ and drizzle/), when the console needs them
packages/sources/  source readers and pure planners (today's scripts/catalog/ and src/lib/catalog/sync/), when the jobs move
```

The student app stays at the root. Moving it into `apps/web` would touch the build, Vitest, Storybook, the
Dockerfile and Coolify for no gain to the console; it can happen later as its own change.

Until `packages/ui` exists, the console imports the app's design system directly: the tokens in
`src/styles/globals.css` and the primitives in `src/components/ui/`. The console's own code uses the `~/` alias,
so the app's `@/` alias keeps resolving inside the imported components. One design system, no copies.

### One database: the local one in development, production once deployed

The console works on one database, read from `DATABASE_URL` like the app: Infisical `dev` gives the local
Supabase, `prod` gives production. A built console is the deployed one, so it labels itself *Produzione*.

- **No staging instance and no promotion step.** Every job already runs as a simulation first and reports what
  it would change, which is what a staging copy was for. A second hosted Supabase would cost upkeep and a
  migration chain to keep level, for a check the simulation already gives. It can come back if the jobs outgrow
  that.
- A job is developed and tried against the local Supabase, then run on production from the deployed console.
- Migrations are applied by hand to both, as today.

### Jobs are managed from the console

Start a run, dry-run first, see its state and history, see the next scheduled run. The console is where a run is
read; the terminal stops being the interface.

### Rules every job follows

- **Simulate first.** Applying is a run of its own, started by hand; in production it asks for confirmation.
- **Nothing writes production on its own.** In production a schedule only simulates, and the worker enforces it.
- **A job with nothing to simulate runs directly.** Rebuilding the achievement counters from history only
  recomputes derived values, so it has no simulation (`simulates: false`); production never schedules it.
- **Every run keeps what it changed.** A job returns its counts and, where it can, the rows it changed or would
  change with their values before and after (`ops.job_runs.changes`), which the run's page shows.
- One request at a time to a source, with the cache.
- No job starts on deploy, exactly like migrations.
- Logs go to Seq with message templates (see `docs/OBSERVABILITY.md`).

### Jobs run in a worker process, with pg-boss

Three options were weighed, all able to run today's scripts. The jobs are short, weekly to daily, and mostly single-step;  none
needs a durable wait.

| | Worker process + pg-boss | Child process of the console | Temporal |
|---|---|---|---|
| Infrastructure added | none: a queue schema in the console's Postgres | none | a Temporal server, its UI, and its persistence (Postgres 12+ is enough since 1.20) |
| Resources | one Node process | none | sized at 2 GB / 2 vCPU for a light self-hosted node |
| Scheduling | cron built in | to build (node-cron) | Schedules built in |
| Retries, backoff | built in | to build | built in |
| Run history | our own `ops.job_runs` table | our own table | built in, with its UI |
| Waiting for approval | a state in our table, and a second job | same | a workflow waiting on a signal |
| Survives a restart | yes, the queue is in Postgres | no | yes |

**Chosen: a worker process with pg-boss.** It adds no infrastructure, survives restarts, and covers
cron, retries and concurrency. The console reads and writes the queue through the same database.

Temporal earns its cost when flows grow to several durable steps or long waits, or once the server already runs
for something else. Since the worker contract is "a function that takes typed input and reports a result", the
jobs written for pg-boss port to Temporal activities later without rewriting them.

graphile-worker was considered: it deletes a job on completion and expects a shadow table for history, so it
saves nothing over pg-boss here.

### Cloudflare Access in front; Supabase is the login

**Amended 2026-10-10:** the console moved from the tailnet to a public domain, `admin.trivia-more.it`,
so it opens from any device without a VPN, and Traefik serves it like the app. Two layers still stand
apart:

1. **Cloudflare Access** lets only the owner's address through. The VPS's IP reaches Traefik without
   Cloudflare, so the console checks the token Access signs on every request and refuses one without it.
2. **The login** is Supabase, against the production auth, checked against `CONSOLE_OWNER_IDS`.

Either layer alone keeps a stranger out. The domain, the DNS record and the Access application are in
Terraform (`infra/access.tf`, #203).

## Connections

| Connection | Used for | Rights |
|---|---|---|
| `DATABASE_URL` | the app's tables the jobs write, the queue (`pgboss`), `ops.job_runs` and `ops.job_schedules` | read and write |

The console reaches the database and Seq over the Docker network on the VPS, the same way the app does.

## Consequences

- The root becomes a pnpm workspace. The app's scripts, build and Dockerfile are unchanged; the console has its
  own `package.json`, build and Dockerfile under `admin-console/`.
- Coolify runs the console as a second resource from the same repository, with no domain. The worker is a third
  service from the console's image with a different command, and publishes no port.
- The console reads Infisical's `prod` environment, like the app, plus `CONSOLE_OWNER_IDS`.
