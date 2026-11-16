#!/usr/bin/env bash
set -euo pipefail

# A full pg_dump in custom format of the database at ADMIN_DATABASE_URL, with the tools from the image.
label="${1:-local}"
: "${ADMIN_DATABASE_URL:?export ADMIN_DATABASE_URL, the admin (postgres) URL of the database to back up}"

ts="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups
# A local database is reached from the container through the host.
url="$(node -e 'const u = new URL(process.argv[1]); if (["localhost", "127.0.0.1"].includes(u.hostname)) u.hostname = "host.docker.internal"; console.log(u.href)' "$ADMIN_DATABASE_URL")"

docker run --rm -v "$PWD/backups:/out" paradedb/paradedb:0.26.6-pg17 pg_dump "$url" -Fc -f "/out/${ts}-${label}.dump"
echo "✓ backups/${ts}-${label}.dump; restore with pg_restore --no-owner -d <url>"
