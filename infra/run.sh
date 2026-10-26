#!/usr/bin/env bash
set -euo pipefail

# Runs Terraform on a root with the secrets of the trivia-more-infra folders it needs, injected by `infisical run`.
root_name="${1:?usage: run.sh <infisical|prod|staging> <terraform arguments>}"
shift
here="$(cd "$(dirname "$0")" && pwd)"
case "$root_name" in
  infisical) root="$here/infisical"; paths=(/terraform /r2) ;;
  *) root="$here/envs/$root_name"; paths=(/terraform /cloudflare /coolify /r2 "/$root_name") ;;
esac
[ -d "$root" ] || { echo "no Terraform root for $root_name" >&2; exit 1; }

if [ "${TRIVIAMORE_TF_INJECTED:-}" != 1 ]; then
  project="${INFISICAL_INFRA_PROJECT_ID:-<infisical-infra-project-id>}"

  cmd=(env TRIVIAMORE_TF_INJECTED=1 bash "$0" "$root_name" "$@")
  for path in "${paths[@]}"; do
    cmd=(infisical run --projectId="$project" --env=ops --path="$path" --silent -- "${cmd[@]}")
  done
  exec "${cmd[@]}"
fi

: "${R2_ENDPOINT:?add R2_ENDPOINT to trivia-more-infra → /r2}"
export AWS_ENDPOINT_URL_S3="$R2_ENDPOINT"
if [ "$root_name" != infisical ]; then
  : "${CLOUDFLARE_API_TOKEN:?add CLOUDFLARE_API_TOKEN to trivia-more-infra → /cloudflare}"
  export TF_VAR_cloudflare_account_id="${CLOUDFLARE_ACCOUNT_ID:?add CLOUDFLARE_ACCOUNT_ID to trivia-more-infra → /cloudflare}"
fi
# shellcheck source=/dev/null
source "$root/vars.sh"
bucket="${TF_STATE_BUCKET:-triviamore-tfstate}"

cd "$root"
terraform init -input=false -reconfigure -backend-config="bucket=$bucket" >/dev/null
terraform "$@"
