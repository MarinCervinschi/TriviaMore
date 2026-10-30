#!/usr/bin/env bash
set -euo pipefail

# Copies the app's data into a database rebuilt from the migrations, then checks every table's row count against the source.
: "${SOURCE_DATABASE_URL:?the admin URL of the database to copy from}"
: "${TARGET_DATABASE_URL:?the admin URL of the database to rebuild and fill}"
# Given the runtime URL instead, trivia_app keeps its password, so the switch changes only the host.
if [ -z "${TARGET_APP_DB_PASSWORD:-}" ] && [ -n "${APP_DATABASE_URL:-}" ]; then
  TARGET_APP_DB_PASSWORD="$(node -e 'const u = new URL(process.argv[1]); if (u.username !== "trivia_app") process.exit(1); console.log(decodeURIComponent(u.password))' "$APP_DATABASE_URL")" ||
    { echo "APP_DATABASE_URL does not connect as trivia_app." >&2; exit 1; }
fi
: "${TARGET_APP_DB_PASSWORD:?the password trivia_app gets on the target, or APP_DATABASE_URL to take it from}"

replace=false
[[ " $* " == *" --replace "* ]] && replace=true

here="$(cd "$(dirname "$0")" && pwd)"
schemas="'public','catalog','quiz','internal','crm','ops'"

where() { node -e 'const u = new URL(process.argv[1]); console.log(`${u.hostname}:${u.port || 5432}${u.pathname}`)' "$1"; }
# The tools run in the image, never from the host; a local database is reached from the container through the host.
in_docker() { node -e 'const u = new URL(process.argv[1]); if (["localhost", "127.0.0.1"].includes(u.hostname)) u.hostname = "host.docker.internal"; console.log(u.href)' "$1"; }
pg() { docker run --rm -i postgres:17 "$@"; }

source_url="$(in_docker "$SOURCE_DATABASE_URL")"
target_url="$(in_docker "$TARGET_DATABASE_URL")"
q() { pg psql "$1" -v ON_ERROR_STOP=1 -Atq -c "$2"; }

[ "$(where "$SOURCE_DATABASE_URL")" != "$(where "$TARGET_DATABASE_URL")" ] || { echo "Source and target are the same database." >&2; exit 1; }
echo "source: $(where "$SOURCE_DATABASE_URL")"
echo "target: $(where "$TARGET_DATABASE_URL")"

last_when="$(node -e 'const j = require(process.argv[1]); console.log(j.entries.at(-1).when)' "$here/../../drizzle/meta/_journal.json")"
source_when="$(q "$source_url" "select max(created_at) from drizzle.__drizzle_migrations")"
[ "$source_when" = "$last_when" ] || { echo "The source is not at the last migration of drizzle/: apply it there first." >&2; exit 1; }

users=0
[ -n "$(q "$target_url" "select to_regclass('public.users')")" ] && users="$(q "$target_url" "select count(*) from public.users")"
if [ "$users" != 0 ] && [ "$replace" != true ]; then
  echo "The target already holds $users users. Pass --replace to rebuild it, only while nothing runs on it." >&2
  exit 1
fi

echo "→ rebuilding the target from the migrations"
pg psql "$target_url" -v ON_ERROR_STOP=1 -q -v pw="$TARGET_APP_DB_PASSWORD" <<'SQL'
SET client_min_messages = warning;
DROP SCHEMA IF EXISTS public, catalog, quiz, internal, crm, ops, pgboss, auth, drizzle CASCADE;
CREATE SCHEMA public;
SELECT 'CREATE ROLE trivia_app LOGIN BYPASSRLS' WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'trivia_app')\gexec
ALTER ROLE trivia_app WITH LOGIN BYPASSRLS PASSWORD :'pw';
SQL
SUPABASE_DB_URL="$TARGET_DATABASE_URL" pnpm exec tsx "$here/migrations.ts" --apply

list_tables="select format('%I.%I', n.nspname, c.relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace where c.relkind in ('r', 'p') and not c.relispartition and n.nspname in ($schemas) order by 1"
list_sequences="select format('%I.%I', n.nspname, c.relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace where c.relkind = 'S' and n.nspname in ($schemas) order by 1"
# Sorted here, since the two databases may not share a collation.
target_tables="$(q "$target_url" "$list_tables" | LC_ALL=C sort)"
source_tables="$(q "$source_url" "$list_tables" | LC_ALL=C sort)"
if [ "$target_tables" != "$source_tables" ]; then
  echo "The source and the rebuilt target do not hold the same tables:" >&2
  diff <(echo "$source_tables") <(echo "$target_tables") >&2 || true
  exit 1
fi
sequences="$(q "$target_url" "$list_sequences")"

echo "→ copying $(echo "$target_tables" | wc -l | tr -d ' ') tables and $(echo "$sequences" | grep -c . || true) sequences"
args=()
while read -r name; do [ -n "$name" ] && args+=("--table=$name"); done <<< "$target_tables"$'\n'"$sequences"
# The migrations seed some tables, so the target is emptied in the same transaction that loads it.
{
  echo "TRUNCATE $(echo "$target_tables" | paste -sd, -) CASCADE;"
  pg pg_dump "$source_url" --data-only --disable-triggers --no-owner --no-privileges "${args[@]}"
} | pg psql "$target_url" -v ON_ERROR_STOP=1 -q --single-transaction > /dev/null

echo "→ checking the rows"
count_rows() { q "$1" "select string_agg(format('%s %s', t, (xpath('/row/n/text()', query_to_xml(format('select count(*) as n from %s', t), false, true, '')))[1]::text), E'\n' order by t) from unnest(string_to_array('$(echo "$target_tables" | paste -sd, -)', ',')) t"; }
source_counts="$(count_rows "$source_url" | LC_ALL=C sort)"
target_counts="$(count_rows "$target_url" | LC_ALL=C sort)"
if [ "$source_counts" != "$target_counts" ]; then
  echo "Row counts differ (source < , target >):" >&2
  diff <(echo "$source_counts") <(echo "$target_counts") >&2 || true
  exit 1
fi
echo "$target_counts" | awk '$2 > 0 { printf "  %-44s %s\n", $1, $2 }'
q "$target_url" "analyze"
echo "✓ every table matches the source"
