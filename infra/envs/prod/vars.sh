# The Terraform variables of prod, from trivia-more-infra → /prod and the shared folders; sourced by infra/run.sh.
export TF_VAR_console_infisical_client_id="${CONSOLE_INFISICAL_CLIENT_ID:?add it to trivia-more-infra → /prod}"
export TF_VAR_console_infisical_client_secret="${CONSOLE_INFISICAL_CLIENT_SECRET:?add it to trivia-more-infra → /prod}"
export TF_VAR_infisical_project_id="${INFISICAL_PROJECT_ID:?add INFISICAL_PROJECT_ID to trivia-more-infra → /terraform}"
export TF_VAR_infisical_site_url="${INFISICAL_SITE_URL:?add INFISICAL_SITE_URL to trivia-more-infra → /terraform}"
export TF_VAR_console_seq_api_key="${CONSOLE_SEQ_API_KEY:?add CONSOLE_SEQ_API_KEY to trivia-more-infra → /prod}"
export TF_VAR_console_worker_seq_api_key="${CONSOLE_WORKER_SEQ_API_KEY:?add CONSOLE_WORKER_SEQ_API_KEY to trivia-more-infra → /prod}"
export TF_VAR_console_owner_email="${CONSOLE_OWNER_EMAIL:?add CONSOLE_OWNER_EMAIL to trivia-more-infra → /cloudflare}"
