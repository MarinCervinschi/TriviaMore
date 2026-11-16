#!/usr/bin/env bash
set -euo pipefail

# Rebuilds a database from nothing: the migrations, the catalogue from CINECA, then made-up content and accounts.
: "${ADMIN_DATABASE_URL:?export ADMIN_DATABASE_URL, the admin (postgres) URL of the database to rebuild}"
: "${APP_DB_PASSWORD:?export APP_DB_PASSWORD, the password the runtime role trivia_app gets}"
: "${RESET_ALLOWED_HOST:?export RESET_ALLOWED_HOST, the one host whose database this may drop}"
: "${STAGING_SEED_PASSWORD:?export STAGING_SEED_PASSWORD, the password of the made-up accounts}"

host="$(node -e 'console.log(new URL(process.argv[1]).hostname)' "$ADMIN_DATABASE_URL")"
if [ "$host" != "$RESET_ALLOWED_HOST" ]; then
  echo "Refusing to reset $host: RESET_ALLOWED_HOST is $RESET_ALLOWED_HOST." >&2
  exit 1
fi

# psql and pg_dump from the image, never from the host.
pg() { docker run --rm -i paradedb/paradedb:0.26.6-pg17 "$@"; }

echo "→ dropping every schema on $host"
pg psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
DROP SCHEMA IF EXISTS public, catalog, quiz, internal, crm, ops, pgboss, auth, api, drizzle CASCADE;
CREATE SCHEMA public;
SQL

echo "→ the runtime role"
pg psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -q -v pw="$APP_DB_PASSWORD" <<'SQL'
SELECT 'CREATE ROLE trivia_app LOGIN BYPASSRLS' WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'trivia_app')\gexec
ALTER ROLE trivia_app WITH LOGIN BYPASSRLS PASSWORD :'pw';
SQL

echo "→ the migrations"
pnpm exec tsx scripts/db/migrations.ts --apply

echo "→ the departments of scripts/catalog/departments.json, and their courses from CINECA"
DATABASE_URL="$ADMIN_DATABASE_URL" pnpm exec tsx scripts/catalog/populate.ts --apply

echo "→ the classes and plans from CINECA"
DATABASE_URL="$ADMIN_DATABASE_URL" pnpm exec tsx scripts/catalog/sync.ts --apply
if [[ " $* " == *" --syllabi "* ]]; then
  DATABASE_URL="$ADMIN_DATABASE_URL" pnpm exec tsx scripts/catalog/syllabi.ts --apply
fi

echo "→ made-up sections and questions"
DATABASE_URL="$ADMIN_DATABASE_URL" pnpm exec tsx scripts/db/seed-content.ts

echo "→ one made-up account per role"
DATABASE_URL="$ADMIN_DATABASE_URL" pnpm exec tsx scripts/db/seed-users.ts

echo "→ rows"
for table in public.users catalog.departments catalog.courses catalog.classes catalog.course_plans catalog.sections catalog.questions; do
  printf '  %-24s %s\n' "$table" "$(pg psql "$ADMIN_DATABASE_URL" -Atc "SELECT count(*) FROM $table")"
done
