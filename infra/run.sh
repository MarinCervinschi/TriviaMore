#!/usr/bin/env bash
set -euo pipefail

# Runs Terraform on infra/envs/<env> with the secrets of that environment's /infra folder, which `pnpm infra:*` injects through Infisical.
env="${1:?usage: run.sh <prod|staging> <terraform arguments>}"
shift
root="$(dirname "$0")/envs/$env"
[ -d "$root" ] || { echo "no Terraform root for $env" >&2; exit 1; }

: "${R2_ENDPOINT:?run through pnpm infra:*, so Infisical injects $env → /infra}"
: "${CLOUDFLARE_API_TOKEN:?add CLOUDFLARE_API_TOKEN to $env → /infra}"
export AWS_ENDPOINT_URL_S3="$R2_ENDPOINT"
export TF_VAR_cloudflare_account_id="${CLOUDFLARE_ACCOUNT_ID:?add CLOUDFLARE_ACCOUNT_ID to $env → /infra}"
# shellcheck source=/dev/null
source "$root/vars.sh"
bucket="${TF_STATE_BUCKET:-triviamore-tfstate}"

cd "$root"
terraform init -input=false -reconfigure -backend-config="bucket=$bucket" >/dev/null
terraform "$@"
