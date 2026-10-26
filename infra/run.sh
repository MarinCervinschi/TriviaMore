#!/usr/bin/env bash
set -euo pipefail

# Runs Terraform on infra/envs/<root> with the secrets of the trivia-more-infra folders that root needs, injected by `infisical run`.
root_name="${1:?usage: run.sh <prod|staging> <terraform arguments>}"
shift
here="$(cd "$(dirname "$0")" && pwd)"
root="$here/envs/$root_name"
[ -d "$root" ] || { echo "no Terraform root for $root_name" >&2; exit 1; }

if [ "${TRIVIAMORE_TF_INJECTED:-}" != 1 ]; then
  project="${INFISICAL_INFRA_PROJECT_ID:-<infisical-infra-project-id>}"
  paths=(/terraform /cloudflare /coolify /r2 "/$root_name")

  cmd=(env TRIVIAMORE_TF_INJECTED=1 bash "$0" "$root_name" "$@")
  for path in "${paths[@]}"; do
    cmd=(infisical run --projectId="$project" --env=ops --path="$path" --silent -- "${cmd[@]}")
  done
  exec "${cmd[@]}"
fi

: "${R2_ENDPOINT:?add R2_ENDPOINT to trivia-more-infra → /r2}"
: "${CLOUDFLARE_API_TOKEN:?add CLOUDFLARE_API_TOKEN to trivia-more-infra → /cloudflare}"
export AWS_ENDPOINT_URL_S3="$R2_ENDPOINT"
export TF_VAR_cloudflare_account_id="${CLOUDFLARE_ACCOUNT_ID:?add CLOUDFLARE_ACCOUNT_ID to trivia-more-infra → /cloudflare}"
# shellcheck source=/dev/null
source "$root/vars.sh"
bucket="${TF_STATE_BUCKET:-triviamore-tfstate}"

cd "$root"
terraform init -input=false -reconfigure -backend-config="bucket=$bucket" >/dev/null
terraform "$@"
