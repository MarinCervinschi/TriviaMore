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

**By hand, always.** Never in a container start command, an entrypoint or an automatic deploy hook,
in any environment. Consequences to plan for:

- Migration first, code second.
- Destructive changes (renames, drops) need expand/contract across two deploys, or the running
  version breaks in the window between them.
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

```bash
D=supabase_db_TriviaMore
docker exec $D psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS drizzle_verify" \
                                             -c "CREATE DATABASE drizzle_verify"

# stubs for the Supabase-owned objects our migrations reference
docker exec $D psql -U postgres -d drizzle_verify -c "
  CREATE SCHEMA auth;
  CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb);
  CREATE SCHEMA storage;
  CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean, file_size_limit bigint);
  CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT NULL::uuid';
  CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql IMMUTABLE AS 'SELECT string_to_array(\$1, ''/'')';"

DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/drizzle_verify' pnpm exec drizzle-kit migrate
```

Then diff the rebuilt database against the working one. Run each query against both and compare:

```sql
-- indexes
select schemaname||'.'||indexname||' :: '||regexp_replace(indexdef,'^CREATE (UNIQUE )?INDEX [^ ]+ ON ','')
from pg_indexes where schemaname in ('public','catalog','quiz') order by 1;

-- constraints
select conrelid::regclass||' '||conname||' '||pg_get_constraintdef(oid)
from pg_constraint where connamespace::regnamespace::text in ('public','catalog','quiz') order by 1;

-- columns, defaults, nullability, generation expressions
select table_schema||'.'||table_name||'.'||column_name||' '||data_type||' '||
       coalesce(column_default,'-')||' '||is_nullable||' '||coalesce(generation_expression,'-')
from information_schema.columns where table_schema in ('public','catalog','quiz') order by 1;

-- triggers
select event_object_schema||'.'||event_object_table||' '||trigger_name||' '||action_timing||' '||event_manipulation
from information_schema.triggers where trigger_schema in ('public','catalog','quiz','auth') order by 1;
```

Drop `drizzle_verify` when done.

Note that until the refactor in #87 completes, the live database still carries RLS policies the
Drizzle schema does not describe. Policy differences in that diff are expected; column, index,
constraint and trigger differences are not.

## Baselining an existing database

`drizzle-kit@0.31` has **no `pull --init` and no `migrate --fake`** — the `--init` flag in the docs
belongs to another dialect. To mark migrations as already applied on a database that already has the
schema, insert the row into `drizzle.__drizzle_migrations` by hand (hash = SHA-256 of the migration
file), and only after confirming a `pull` of that database diffs clean against the TypeScript
schema. One mismatched default and every later `db:migrate` tries to "fix" it.

On a local database, always prefer dropping and rebuilding over faking.

## Connection

`DATABASE_URL` must be set. The `pnpm db:*` scripts wrap `infisical run`, which supplies it; running
`drizzle-kit` directly needs it in the environment. It is deliberately separate from
`SUPABASE_DB_URL`, which belongs to the Supabase CLI: on the VPS the runtime URL points at
`supabase-db:5432` on the Docker network while the CLI needs the public host.

The self-hosted Postgres has no TLS on its exposed port, so tooling run from a dev machine may need
`PGSSLMODE=disable`.
