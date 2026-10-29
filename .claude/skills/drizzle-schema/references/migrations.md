# Migrations

```bash
pnpm db:generate --name add_something    # diff the schema  -> drizzle/NNNN_add_something.sql
pnpm db:generate --custom --name grants  # empty file for raw SQL
pnpm db:migrate                          # apply everything pending
pnpm db:check                            # migration history consistency
pnpm db:studio                           # browse data
```

Extra flags pass straight through the pnpm script, so `pnpm db:generate --custom --name x` works.

`db:generate` diffs the TypeScript schema against the **snapshot** in `drizzle/meta/`, not against a
live database. That is why a stale local database never produces a spurious migration — and why
`pull` is the only way to detect real drift.

## Applying

By hand, never in a container start command, an entrypoint, a deploy hook or a pipeline.

- **Staging:** `pnpm db:migrate:staging --apply`, as soon as the change needs it. A migration changed
  after that is fixed with `pnpm db:reset-staging`, which rebuilds staging.
- **Production:** before the release is merged. `pnpm db:dump:prod`, then `pnpm db:migrate:prod` to
  read what is pending, then `pnpm db:migrate:prod --apply`.
- **Local:** `pnpm db:migrate`, while local development still runs on Supabase.

Both remote scripts run `scripts/db/migrations.ts`, which applies each migration in its own
transaction and prints the statement that failed; `drizzle-kit migrate` runs them all in one and
hides the error. CI (`.github/workflows/ci.yml`) applies every migration to an empty Postgres on each
pull request, and applies nothing anywhere else.

Consequences to plan for:

- Migration first, code second.
- Every migration is backward compatible; destructive changes are split into expand and contract
  steps across releases. The rules, the lock traps and the review checklist are in the
  `safe-changes` skill.
- Rolling back a deploy does **not** roll back the schema.

## What needs a custom migration

The DSL covers tables, columns, enums, indexes, constraints, foreign keys and RLS enablement.
Everything else is `--custom`:

- functions and triggers (`handle_updated_at`, `handle_new_user`, `protect_profile_role`)
- grants, revokes, default privileges, roles
- policies, including the two on `storage.objects`
- storage buckets
- reference data the app cannot start without
- enum value removal, generated-column expression changes, anything needing `USING` on a type change

Custom files are plain SQL. Separate statements with `--> statement-breakpoint` so drizzle-kit runs
them individually:

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
--> statement-breakpoint

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

A new table with an `updated_at` column needs its `set_<table>_updated_at` trigger added this way —
the DSL will not do it.

## Verifying against a rebuilt database

For anything beyond a trivial column, prove the migrations rebuild the schema from zero. This has
already caught an inverted composite unique and two indexes that lost their `DESC`.

`pnpm db:test:up` starts an empty Postgres on :54329 and applies every migration to it. Then diff its
schema against the working local database, with the same flags on both:

```bash
for c in supabase_db_TriviaMore triviamore-test-db-1; do
  docker exec $c pg_dump -U postgres -d postgres --schema-only --no-owner --no-privileges --no-comments \
    -n public -n catalog -n quiz -n internal -n crm -n ops -n pgboss \
    | grep -vE '^\\(un)?restrict|^-- Dumped|queue_stats_2026' > /tmp/$c.sql
done
diff /tmp/supabase_db_TriviaMore.sql /tmp/triviamore-test-db-1.sql
```

The diff must be empty. `queue_stats_*` are partitions pg-boss creates at runtime, so they are left
out. `pnpm db:test:down` removes the database; it lives in memory, so nothing remains.

## Baselining an existing database

`drizzle-kit@0.31` has **no `pull --init` and no `migrate --fake`** — the `--init` flag in the docs
belongs to another dialect. To mark migrations as already applied on a database that already has the
schema, insert the row into `drizzle.__drizzle_migrations` by hand (hash = SHA-256 of the migration
file), and only after confirming a `pull` of that database diffs clean against the TypeScript
schema. One mismatched default and every later `db:migrate` tries to "fix" it.

On a local database, always prefer dropping and rebuilding over faking.

## Connection

`drizzle.config.ts` reads **`SUPABASE_DB_URL ?? DATABASE_URL`**, so `SUPABASE_DB_URL` is the primary
name for migrations — not a Supabase-CLI-only variable. The two are separate because on the VPS the
runtime URL points at `supabase-db:5432` on the Docker network while an external tool needs the
public host. Everything under `scripts/` goes through `getDb()` instead, which reads `DATABASE_URL`
and nothing else.

| What you run | Reads |
|---|---|
| `drizzle-kit` (migrate, generate, studio) | `SUPABASE_DB_URL` ?? `DATABASE_URL` |
| `scripts/**` (smoke, achievements) | `DATABASE_URL` |

**Targeting a remote database means bypassing Infisical.** The `pnpm db:*` scripts wrap
`infisical run --recursive`, which injects `dev`'s secrets **on top of** the process environment: an
inline variable that environment also defines is silently discarded, and the command reports success
against your local database.

```bash
SUPABASE_DB_URL='<remote>' pnpm exec drizzle-kit migrate     # bypasses infisical
SUPABASE_DB_URL='<remote>' pnpm db:migrate                   # may not — dev wins if it defines it
```

Which variables `dev` defines decides which of the two happens, so **never infer the target from the
command you typed** — verify it from the result.

`PGSSLMODE=disable` is only for the **Supabase CLI** (`pnpm db:dump`), which bundles its own client
and ignores `?sslmode=` in the URL (supabase/cli#4142). The node-postgres path — drizzle-kit and
every script — builds its pool with no `ssl` option, never negotiates TLS, and needs nothing.
