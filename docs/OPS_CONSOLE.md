# Ops console — architecture

**Status:** accepted (#193, part of #188). The points marked *to verify* are checked in #194.

The ops console is a second app, deployed on its own, from which the owner runs and watches the jobs that keep
TriviaMore's official data current: catalog, syllabi, plans, and later timetables and exam sittings. It is not
part of the student app, and its access has nothing to do with the app's roles.

## Context

- The data jobs exist today as scripts run by hand: `catalog:sync`, `catalog:syllabi`, `catalog:recover-names`,
  `catalog:diff`. Each run takes minutes, reads from public sources one request at a time with a disk cache, and
  ends with a re-plan that must come out empty.
- The app is self-hosted on a VPS, on Coolify behind Cloudflare. A long-running Node process is available; there
  is no serverless runtime.
- **Infisical's `staging` and `prod` environments point at the same database today.** There is no separate
  staging instance yet.
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

### A separate staging database

Jobs write to a staging instance; production receives source data only through a promotion (#196).

- Staging is a **Supabase** instance, like production, so the whole migration chain applies unchanged. The
  baseline and its triggers reference `auth.users`, `auth.uid()` and `storage.objects`, which a bare Postgres
  does not have.
- Until it is hosted, the **local Supabase plays staging**. It behaves the same, and the console runs locally
  against it.
- Migrations are applied by hand to both instances, as today.

### Jobs are managed from the console

Start a run, dry-run first, see its state and history, see the next scheduled run. The console is where a run is
read; the terminal stops being the interface.

### Rules every job follows

- A job writes only to staging. Promotion to production is its own step, with an explicit approval.
- One request at a time to a source, with the cache.
- No job starts on deploy, exactly like migrations.
- Logs go to Seq with message templates (see `docs/OBSERVABILITY.md`).

### Jobs run in a worker process, with pg-boss

Three options were weighed, all able to run today's scripts. The jobs are short, weekly to daily, and mostly single-step; the
one multi-step flow is *fetch → write staging → diff → wait for approval → promote*.

| | Worker process + pg-boss | Child process of the console | Temporal |
|---|---|---|---|
| Infrastructure added | none: a queue schema in the staging Postgres | none | a Temporal server, its UI, and its persistence (Postgres 12+ is enough since 1.20) |
| Resources | one Node process | none | sized at 2 GB / 2 vCPU for a light self-hosted node |
| Scheduling | cron built in | to build (node-cron) | Schedules built in |
| Retries, backoff | built in | to build | built in |
| Run history | our own `ops.job_runs` table | our own table | built in, with its UI |
| Waiting for approval | a state in our table, and a second job | same | a workflow waiting on a signal |
| Survives a restart | yes, the queue is in Postgres | no | yes |

**Chosen: a worker process with pg-boss.** It adds no infrastructure, survives restarts, and covers
cron, retries and concurrency. The console reads and writes the queue through the same database. The approval
step is a state in `ops.job_runs` plus a promotion job started from the console, which is little code for one
flow.

Temporal earns its cost when flows grow to several durable steps or long waits, or once the server already runs
for something else. Since the worker contract is "a function that takes typed input and reports a result", the
jobs written for pg-boss port to Temporal activities later without rewriting them.

graphile-worker was considered: it deletes a job on completion and expects a shadow table for history, so it
saves nothing over pg-boss here.

### The tailnet is the only way in; Supabase is the login

Two independent layers.

1. **Network: Tailscale.** The console has no public hostname and no record on Cloudflare. Tailscale already runs
   on the VPS and on the owner's machines, so the console is published on the tailnet only: the page does not
   open without the VPN on.
   - Coolify publishes the console's port on `127.0.0.1` of the host, not on a public interface.
   - `tailscale serve` on the host proxies the tailnet to that port over HTTPS, with the VPS's `*.ts.net`
     certificate. HTTPS is required, because the Supabase session cookies are `Secure`.
   - A Tailscale ACL limits the VPS's console port to the owner's devices.
2. **Login: Supabase.** The console signs in against the production Supabase auth, like the app, then checks the
   user id against `CONSOLE_OWNER_IDS` from Infisical. A valid TriviaMore account is not enough, whatever its
   role.

Either layer alone keeps a stranger out. The VPN keeps the console off the internet, and the login keeps a device
on the tailnet from being enough.

**To verify in #194:**
- Traefik listens on `0.0.0.0:443` on the host, which includes the Tailscale interface. If it conflicts with
  `tailscale serve` on 443, Serve uses another HTTPS port, for example `https://<vps>.<tailnet>.ts.net:8443`.
- The console's URL must be added to the allowed redirect URLs of the production Supabase auth.

## Connections

| Connection | Used for | Rights |
|---|---|---|
| Staging | jobs' output, the queue, `ops.job_runs` | read and write |
| Production | counts and the staging-vs-production diff | read only |
| Production, promotion | applying an approved promotion | write, used by the promotion job alone |

Two production credentials keep the everyday console unable to write production by mistake.

The console reaches the databases and Seq over the Docker network on the VPS, the same way the app does.

## Consequences

- The root becomes a pnpm workspace. The app's scripts, build and Dockerfile are unchanged; the console has its
  own `package.json`, build and Dockerfile under `admin-console/`.
- Coolify runs the console as a second resource from the same repository, with no domain. The worker is a third
  service from the console's image with a different command, and publishes no port.
- A new Infisical environment holds the console's secrets: the staging database, the two production
  credentials, `CONSOLE_OWNER_IDS`.
