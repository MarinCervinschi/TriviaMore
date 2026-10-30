#!/usr/bin/env bash
set -euo pipefail

# A full pg_dump in custom format, with the tools from the image; `pnpm db:dump:prod` reads production's admin URL from Infisical.
label="${1:-local}"
: "${SUPABASE_DB_URL:?export SUPABASE_DB_URL, the admin (postgres) URL of the database to back up}"

ts="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups
# A local database is reached from the container through the host.
url="$(node -e 'const u = new URL(process.argv[1]); if (["localhost", "127.0.0.1"].includes(u.hostname)) u.hostname = "host.docker.internal"; console.log(u.href)' "$SUPABASE_DB_URL")"

docker run --rm -v "$PWD/backups:/out" postgres:17 pg_dump "$url" -Fc -f "/out/${ts}-${label}.dump"
echo "✓ backups/${ts}-${label}.dump; restore with pg_restore --no-owner -d <url>"
