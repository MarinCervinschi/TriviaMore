#!/usr/bin/env bash
set -euo pipefail

# Backup via the Supabase CLI, which bundles its own pg_dump — no local install.
# Local by default; `pnpm db:dump prod` needs SUPABASE_DB_URL (admin/postgres)
# exported, see README "Self-hosted production database". Writes a schema and a
# data file; restore with psql in that order.

label="${1:-local}"
ts="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups

if [ "$label" = "prod" ]; then
  : "${SUPABASE_DB_URL:?export SUPABASE_DB_URL (admin/postgres) — see README}"
  PGSSLMODE=disable supabase db dump --db-url "$SUPABASE_DB_URL" -f "backups/${ts}-prod-schema.sql"
  PGSSLMODE=disable supabase db dump --db-url "$SUPABASE_DB_URL" --data-only -f "backups/${ts}-prod-data.sql"
else
  supabase db dump --local -f "backups/${ts}-local-schema.sql"
  supabase db dump --local --data-only -f "backups/${ts}-local-data.sql"
fi

echo "✓ backups/${ts}-${label}-{schema,data}.sql"
