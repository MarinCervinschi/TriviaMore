# The Terraform variables of staging, from staging → /infra; sourced by infra/run.sh.
export TF_VAR_postgres_password="${STAGING_POSTGRES_PASSWORD:?add STAGING_POSTGRES_PASSWORD to staging → /infra}"
export TF_VAR_owner_email="${CONSOLE_OWNER_EMAIL:?add CONSOLE_OWNER_EMAIL to staging → /infra}"
export TF_VAR_garage_rpc_secret="${GARAGE_RPC_SECRET:?add GARAGE_RPC_SECRET to staging → /infra}"
export TF_VAR_garage_admin_token="${GARAGE_ADMIN_TOKEN:?add GARAGE_ADMIN_TOKEN to staging → /infra}"
export TF_VAR_garage_app_access_key_id="${GARAGE_APP_ACCESS_KEY_ID:?add GARAGE_APP_ACCESS_KEY_ID to staging → /infra}"
export TF_VAR_garage_app_secret_access_key="${GARAGE_APP_SECRET_ACCESS_KEY:?add GARAGE_APP_SECRET_ACCESS_KEY to staging → /infra}"
