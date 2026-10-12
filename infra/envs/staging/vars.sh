# The Terraform variables of staging, from staging → /infra; sourced by infra/run.sh.
export TF_VAR_postgres_password="${STAGING_POSTGRES_PASSWORD:?add STAGING_POSTGRES_PASSWORD to staging → /infra}"
