#!/usr/bin/env bash
set -euo pipefail

# Runs Terraform on infra/ with the secrets of prod → /infra, which `pnpm infra:*` injects through Infisical.
: "${R2_ENDPOINT:?run through pnpm infra:*, so Infisical injects prod → /infra}"
export AWS_ENDPOINT_URL_S3="$R2_ENDPOINT"
export TF_VAR_console_infisical_client_id="${CONSOLE_INFISICAL_CLIENT_ID:?missing in prod → /infra}"
export TF_VAR_console_infisical_client_secret="${CONSOLE_INFISICAL_CLIENT_SECRET:?missing in prod → /infra}"
export TF_VAR_infisical_project_id="${INFISICAL_PROJECT_ID:?add INFISICAL_PROJECT_ID to prod → /infra}"
export TF_VAR_infisical_site_url="${INFISICAL_SITE_URL:?add INFISICAL_SITE_URL to prod → /infra}"
bucket="${TF_STATE_BUCKET:-triviamore-tfstate}"

cd "$(dirname "$0")"
terraform init -input=false -reconfigure -backend-config="bucket=$bucket" >/dev/null
terraform "$@"
