#!/usr/bin/env bash
set -euo pipefail

# Rebuilds the staging database from nothing: the migrations, the catalogue from CINECA, then made-up content and accounts.
: "${STAGING_DATABASE_URL:?run through pnpm db:reset-staging, so Infisical injects trivia-more-infra → /staging}"
: "${STAGING_APP_DB_PASSWORD:?add STAGING_APP_DB_PASSWORD to trivia-more-infra → /staging}"
: "${STAGING_SEED_PASSWORD:?run through pnpm db:reset-staging, so Infisical injects trivia-more-staging → staging → /database}"

host="$(node -e 'console.log(new URL(process.argv[1]).hostname)' "$STAGING_DATABASE_URL")"
case "$host" in
  rieti | <rieti-tailnet-ip>) ;;
  *) echo "Refusing to reset $host: only the staging database on rieti can be rebuilt." >&2; exit 1 ;;
esac

# psql and pg_dump from the image, never from the host.
pg() { docker run --rm -i postgres:17 "$@"; }

echo "→ dropping every schema on $host"
pg psql "$STAGING_DATABASE_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
DROP SCHEMA IF EXISTS public, catalog, quiz, internal, crm, ops, pgboss, auth, api, drizzle CASCADE;
CREATE SCHEMA public;
SQL

echo "→ the runtime role"
pg psql "$STAGING_DATABASE_URL" -v ON_ERROR_STOP=1 -q -v pw="$STAGING_APP_DB_PASSWORD" <<'SQL'
SELECT 'CREATE ROLE trivia_app LOGIN BYPASSRLS' WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'trivia_app')\gexec
ALTER ROLE trivia_app WITH LOGIN BYPASSRLS PASSWORD :'pw';
SQL

echo "→ the migrations"
SUPABASE_DB_URL="$STAGING_DATABASE_URL" pnpm exec tsx scripts/db/migrations.ts --apply

echo "→ the departments of scripts/catalog/departments.json, and their courses from CINECA"
DATABASE_URL="$STAGING_DATABASE_URL" pnpm exec tsx scripts/catalog/populate.ts --apply

echo "→ the classes and plans from CINECA"
DATABASE_URL="$STAGING_DATABASE_URL" pnpm exec tsx scripts/catalog/sync.ts --apply
if [[ " $* " == *" --syllabi "* ]]; then
  DATABASE_URL="$STAGING_DATABASE_URL" pnpm exec tsx scripts/catalog/syllabi.ts --apply
fi

echo "→ made-up sections and questions"
DATABASE_URL="$STAGING_DATABASE_URL" pnpm exec tsx scripts/db/seed-content.ts

echo "→ one made-up account per role"
DATABASE_URL="$STAGING_DATABASE_URL" pnpm exec tsx scripts/db/seed-users.ts

echo "→ rows"
for table in public.users catalog.departments catalog.courses catalog.classes catalog.course_plans catalog.sections catalog.questions; do
  printf '  %-24s %s\n' "$table" "$(pg psql "$STAGING_DATABASE_URL" -Atc "SELECT count(*) FROM $table")"
done
