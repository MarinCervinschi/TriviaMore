# Platform — leaving Supabase, a staging environment and a release pipeline

**Status:** accepted, 2026-10-11. Nothing here is built yet; the phases at the end become the issues of the
epic.

TriviaMore stops depending on Supabase. Production keeps a plain Postgres, a self-hosted S3 store and an
authentication library inside the app. A staging environment on its own server becomes the place where the new
stack is built first and where every change lands before production. Migrations reach production only through
a gated pipeline.

## Context

**What the app uses of Supabase.** Measured on 2026-10-11, across `src/`, `admin-console/src/` and `scripts/`
(21 files import a Supabase client):

- **Auth (GoTrue):** email and password sign-up with an emailed code, password sign-in, Google and GitHub OAuth,
  the session cookie and its refresh, sign-out, the name in the user metadata, account deletion through the
  admin API. There is no password-reset flow.
- **Storage:** `avatars` (public, server-generated SVGs), `avatar-uploads` (public, raster photos) and
  `contributions` (private, request attachments). The request form is the only place the browser talks to
  Supabase: it uploads to `contributions`, guarded by two policies on `storage.objects` that read `auth.uid()`.
- **Database coupling:** `profiles.id` references `auth.users`, the trigger `on_auth_user_created` creates the
  profile, and `drizzle/0000_baseline.sql` expects the `auth` schema and the `anon`, `authenticated` and
  `service_role` roles. The migrations therefore cannot rebuild an empty Postgres.

**What runs and is not used.** PostgREST (closed by #92), Realtime, Edge Functions, Supavisor (`DATABASE_URL`
goes straight to Postgres), Logflare and Vector (the app logs to Seq). Studio is used as a SQL console. The app
already sends its own mail with `nodemailer`; GoTrue uses the same SMTP for its confirmation emails only.

**What it costs.**

- **Latency:** every server function checks the session with `getUser()`, a call to GoTrue. On the Docker
  network it costs about 55 ms, of which Kong is 1.7 ms; GoTrue's own lookup is the rest. Four checks in
  parallel on the dashboard queue behind each other.
- **Resources:** 14 containers on the production VPS for one database and one bucket.
- **Upkeep:** the Coolify template lags Supabase by months. Kong 3.9.1 is the last open-source image, Supabase's
  own compose moved to Envoy, and MinIO was archived in April 2026, which already broke a restart once.

**What there is.** The production VPS (`savvy`, 4 Ampere cores, 24 GB) runs Coolify behind Cloudflare. A second
server, `rieti` (AMD FX-770K, 4 cores, 7.7 GB, 500 GB disk), is on the same tailnet and attached to Coolify.
Terraform already manages the ops console, its DNS record and its Cloudflare Access application (#203), with
the secrets in Infisical.

## Decisions

### Postgres without Supabase

A plain `postgres:17` container, managed by Coolify and declared in Terraform. Its port is bound to the tailnet
address only. The schema stays in Drizzle; a new baseline replaces `0000` so the migrations rebuild an empty
database, without the `auth` schema and without Supabase's roles. Backups run on a schedule to `rieti`, off the
VPS.

### Authentication in the app, with Better Auth

[Better Auth](https://www.better-auth.com) runs inside the app on the Drizzle adapter. Users, sessions, accounts
and verifications become our tables, with migrations and types like the rest. `profiles` references our user
table instead of `auth.users`.

- **Existing users keep their password.** `auth.users` stores bcrypt hashes; Better Auth verifies them once it
  is configured for bcrypt. Google and GitHub accounts are relinked from `auth.identities`.
- **Every open session ends once.** Everyone signs in again after the switch.
- **Emails** go through the existing `nodemailer` sender with our own templates. A password-reset flow comes
  with it.
- **A session check becomes a query on our own database**, or no query at all with the session cached in the
  cookie.

Considered and set aside: asymmetric JWT signing keys with `getClaims()` on GoTrue (local verification, but it
keeps every other GoTrue and template constraint), and moving to Supabase's official compose with Envoy (newer
images, same 14 containers).

### A self-hosted S3 store

Garage is the first candidate: one binary, sized for small installations, presigned uploads supported. Its
narrower permission model and path-style-only addressing are checked during the staging phase; SeaweedFS is the
fallback. Browser uploads use URLs signed by a server function, which also enforces what the storage policies
enforce today. Public files are served from a domain of ours.

### A staging environment on `rieti`

Staging is a full copy of the stack on `rieti`: the app, Postgres, the S3 store and Mailpit. The preview app
moves there. Keeping only the database on `rieti` was set aside, because every query would then cross from the
VPS to a home connection, at 10 to 40 ms each.

- **Exposure:** a Cloudflare Tunnel, so no port opens at home, with Cloudflare Access in front.
- **Accounts:** email and password sign-up is off. OAuth accepts only a verified email ending in
  `@trivia-more.it`, checked on the server. Google's `hd` parameter cannot do it: the domain's mail is on
  Hostinger, not Google Workspace.
- **Data:** no personal data from production. The catalogue (departments, courses, classes, sections,
  questions) is not personal and is synchronised from production by a console job. Users and their activity
  come from a versioned seed script, which replaces seeding from the SQL console.
- **Email:** captured by Mailpit, never delivered.
- **Separate everything:** OAuth clients, bucket, Seq key (`Environment = staging`), Infisical `staging`.
- **Rebuildable:** `db:reset-staging` drops the database, applies the migrations of `preview`, synchronises the
  catalogue and runs the seed. A staging whose schema drifted is rebuilt from scratch.

The limit accepted: staging depends on the power and the connection of the place `rieti` is in.

### Local development works on staging

Infisical `dev` points at staging, so local work reads and writes realistic data. Migrations may be applied to
staging straight from a local checkout. That is safe because every migration is backward compatible (the
`safe-changes` skill), and because staging is rebuilt when a migration under development diverges from what
was applied. A disposable local Postgres, filled from staging, is the place for anything destructive.

### Migrations reach production only through the pipeline

GitHub Actions, in three places:

| When | What |
|---|---|
| Every pull request | `drizzle-kit check`, a rebuild of an empty Postgres from the migrations, the integration tests on it |
| A push to `preview` | the migrations applied to staging, then the deploy |
| A push to `prod` | a job in the `production` environment, which needs an approval: backup, the pending migrations shown, applied, then the deploy |

The runner reaches the databases through the Tailscale GitHub Action, as a short-lived node tagged `tag:ci`. The
tailnet ACL lets that tag reach the two Postgres ports and nothing else. Production secrets live in the
`production` environment only. Until this pipeline exists, production migrations stay manual with
`scripts/db/migrations.ts`.

### Infrastructure as code for every service

Terraform holds shared modules (`app`, `database`, `storage`, `access`) and one root per environment,
`infra/envs/staging` on `rieti` and `infra/envs/prod` on the VPS, each with its own state on R2. Infisical keeps
one environment per target (`dev` points at staging, `staging`, `prod`) and one folder per concern:

| Folder | Holds |
|---|---|
| `/database` | `DATABASE_URL`, and the admin URL the migrations use |
| `/auth` | `BETTER_AUTH_SECRET`, the Google and GitHub clients |
| `/storage` | the S3 keys the app uses at runtime |
| `/email` | SMTP, as today |
| `/app` | everything else the app reads |
| `/infra` | what Terraform reads, never the app |

## What is given up

- GoTrue's features that are not used today: MFA, magic links, phone and SAML. Better Auth has them as plugins if
  they are wanted later.
- Authentication security becomes ours to configure and update: rate limits, hashing, session rotation, CSRF.
  Better Auth implements them; keeping it current is on us.
- Studio's table browser. The SQL console moves to a client on the tailnet or to `pnpm db:studio`.
- Supabase Realtime, which #93 planned to use. Realtime is postponed; when it returns, Postgres `LISTEN` /
  `NOTIFY` with server-sent events from the Node process is the first option.

## Phases

Each phase ships on its own, and Supabase keeps running until the last one.

1. **This ADR**, the `safe-changes` skill, and `CLAUDE.md` updated.
2. **A baseline without Supabase:** the migrations rebuild an empty Postgres. Every later phase needs it.
3. **Staging on `rieti`**, in Terraform: Postgres, the S3 store, the app, Mailpit, the tunnel and Access; the
   catalogue synchronised, the seed written.
4. **The pipeline:** pull-request checks, staging on push, production behind an approval, Tailscale in CI.
5. **Storage on S3**, tried on staging, then the existing files moved and `profiles.image` rewritten.
6. **Better Auth**, tried on staging with its rules, then the production users migrated.
7. **Production on the new stack:** Postgres, the S3 store, the switch, a last full dump of Supabase, and
   Supabase turned off.

Later and separate: building the images in CI and publishing them, so neither server builds.
