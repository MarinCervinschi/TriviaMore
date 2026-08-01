#!/bin/sh
set -eu

: "${INFISICAL_CLIENT_ID:?not set}"
: "${INFISICAL_CLIENT_SECRET:?not set}"
: "${INFISICAL_PROJECT_ID:?not set}"
: "${INFISICAL_SITE_URL:?not set}"

# Exchanged here rather than passed in so the container never holds a
# long-lived token, and so an unreachable Infisical fails the start instead of
# leaving a listening process that serves errors.
token=$(infisical login \
  --method=universal-auth \
  --client-id="$INFISICAL_CLIENT_ID" \
  --client-secret="$INFISICAL_CLIENT_SECRET" \
  --domain="$INFISICAL_SITE_URL" \
  --plain --silent)

exec infisical run \
  --token="$token" \
  --projectId="$INFISICAL_PROJECT_ID" \
  --env="${INFISICAL_ENV:-prod}" \
  --domain="$INFISICAL_SITE_URL" \
  --recursive --silent \
  -- "$@"
