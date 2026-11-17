#!/bin/sh
set -eu

: "${INFISICAL_CLIENT_ID:?not set}"
: "${INFISICAL_CLIENT_SECRET:?not set}"
: "${INFISICAL_PROJECT_ID:?not set}"
: "${INFISICAL_SITE_URL:?not set}"

# Exchanged here rather than passed in so the container never holds a
# long-lived token, and so an unreachable Infisical fails the start instead of
# leaving a listening process that serves errors.
# The credentials travel in the environment, never on a command line another process can read.
INFISICAL_TOKEN=$(
  INFISICAL_UNIVERSAL_AUTH_CLIENT_ID="$INFISICAL_CLIENT_ID" \
  INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET="$INFISICAL_CLIENT_SECRET" \
  infisical login --method=universal-auth --domain="$INFISICAL_SITE_URL" --plain --silent
)
export INFISICAL_TOKEN
unset INFISICAL_CLIENT_SECRET

exec infisical run \
  --projectId="$INFISICAL_PROJECT_ID" \
  --env="${INFISICAL_ENV:-prod}" \
  --domain="$INFISICAL_SITE_URL" \
  --recursive --silent \
  -- env -u INFISICAL_TOKEN -u INFISICAL_CLIENT_ID "$@"
