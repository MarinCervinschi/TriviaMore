# What this root generates or knows, published to trivia-more-staging, whose structure is in infra/infisical.
data "infisical_projects" "staging" {
  slug = "trivia-more-staging"
}

data "infisical_identity" "app" {
  name = "TriviaMore-Staging"
}

# Made here so it goes straight to the app in Coolify, without being copied by hand.
resource "infisical_identity_universal_auth_client_secret" "app" {
  identity_id = data.infisical_identity.app.id
  description = "The staging app on rieti (infra/envs/staging)"
}

resource "random_password" "better_auth" {
  for_each = toset(["staging", "dev"])

  length  = 48
  special = false
}

resource "random_password" "seed" {
  length  = 20
  special = false
}

locals {
  # Local runs reach the database at rieti's tailnet address; the app reaches it by container name.
  database_url = {
    staging = "postgresql://trivia_app:${urlencode(var.app_db_password)}@${coolify_database_postgresql.staging.uuid}:5432/postgres"
    dev     = "postgresql://trivia_app:${urlencode(var.app_db_password)}@${var.rieti_tailnet_host}:5432/postgres"
  }

  published = {
    "staging/database/DATABASE_URL"          = local.database_url.staging
    "staging/database/STAGING_SEED_PASSWORD" = random_password.seed.result
    "staging/auth/BETTER_AUTH_SECRET"        = random_password.better_auth["staging"].result
    "staging/email/SMTP_HOST"                = "mailpit-${coolify_service.mailpit.uuid}"
    "dev/database/DATABASE_URL"              = local.database_url.dev
    "dev/auth/BETTER_AUTH_SECRET"            = random_password.better_auth["dev"].result
  }
}

resource "infisical_secret" "published" {
  for_each = nonsensitive(toset(keys(local.published)))

  workspace_id = data.infisical_projects.staging.id
  env_slug     = split("/", each.key)[0]
  folder_path  = "/${split("/", each.key)[1]}"
  name         = split("/", each.key)[2]
  value        = local.published[each.key]
}
