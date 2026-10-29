# The provider settings and variables of this root, from cervinschi-infra → /trivia-more/terraform; sourced by infra/run.sh.
export TF_VAR_org_id="${INFISICAL_ORG_ID:?add INFISICAL_ORG_ID to cervinschi-infra → /trivia-more/terraform}"
export INFISICAL_HOST="${TF_INFISICAL_HOST:?add TF_INFISICAL_HOST to cervinschi-infra → /trivia-more/terraform}"
export INFISICAL_UNIVERSAL_AUTH_CLIENT_ID="${TF_INFISICAL_CLIENT_ID:?add TF_INFISICAL_CLIENT_ID to cervinschi-infra → /trivia-more/terraform}"
export INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET="${TF_INFISICAL_CLIENT_SECRET:?add TF_INFISICAL_CLIENT_SECRET to cervinschi-infra → /trivia-more/terraform}"
