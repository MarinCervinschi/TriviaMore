# The Terraform variables of staging, from cervinschi-infra → /trivia-more/staging and the shared folders; sourced by infra/run.sh.
export TF_VAR_postgres_password="${STAGING_POSTGRES_PASSWORD:?add STAGING_POSTGRES_PASSWORD to cervinschi-infra → /trivia-more/staging}"
export TF_VAR_owner_email="${CONSOLE_OWNER_EMAIL:?add CONSOLE_OWNER_EMAIL to cervinschi-infra → /cloudflare}"
export TF_VAR_infisical_site_url="${INFISICAL_SITE_URL:?add INFISICAL_SITE_URL to cervinschi-infra → /trivia-more/terraform}"
export TF_VAR_app_db_password="${STAGING_APP_DB_PASSWORD:?add STAGING_APP_DB_PASSWORD to cervinschi-infra → /trivia-more/staging}"
export INFISICAL_HOST="${TF_INFISICAL_HOST:?add TF_INFISICAL_HOST to cervinschi-infra → /trivia-more/terraform}"
export INFISICAL_UNIVERSAL_AUTH_CLIENT_ID="${TF_INFISICAL_CLIENT_ID:?add TF_INFISICAL_CLIENT_ID to cervinschi-infra → /trivia-more/terraform}"
export INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET="${TF_INFISICAL_CLIENT_SECRET:?add TF_INFISICAL_CLIENT_SECRET to cervinschi-infra → /trivia-more/terraform}"
