# Values that are not secrets live here; secrets typed by hand are created empty and their value is left alone.
locals {
  staging_settings = {
    "auth/BETTER_AUTH_URL"           = "https://pr.trivia-more.it"
    "auth/AUTH_ALLOWED_EMAIL_DOMAIN" = "trivia-more.it"
    "app/LOG_LEVEL"                  = "debug"
    "app/MAINTENANCE_MODE"           = "false"
    "app/VITE_SITE_URL"              = "https://pr.trivia-more.it"
    "email/MAIL_FROM_NAME"           = "TriviaMore Staging"
    # Mailpit accepts any login on 1025 and delivers nothing.
    "email/SMTP_PORT" = "1025"
    "email/SMTP_USER" = "noreply@trivia-more.it"
    "email/SMTP_PASS" = "mailpit"
  }

  # Local runs share the staging accounts and OAuth clients, on their own origin.
  dev_settings = {
    "auth/BETTER_AUTH_URL"           = "http://localhost:3000"
    "auth/AUTH_ALLOWED_EMAIL_DOMAIN" = "$${staging.auth.AUTH_ALLOWED_EMAIL_DOMAIN}"
    "auth/GOOGLE_CLIENT_ID"          = "$${staging.auth.GOOGLE_CLIENT_ID}"
    "auth/GOOGLE_CLIENT_SECRET"      = "$${staging.auth.GOOGLE_CLIENT_SECRET}"
    "auth/GITHUB_CLIENT_ID"          = "$${staging.auth.GITHUB_CLIENT_ID}"
    "auth/GITHUB_CLIENT_SECRET"      = "$${staging.auth.GITHUB_CLIENT_SECRET}"
    "app/LOG_LEVEL"                  = "debug"
    "app/MAINTENANCE_MODE"           = "false"
    "app/VITE_SITE_URL"              = "http://localhost:3000"
  }

  staging_by_hand = [
    "auth/GOOGLE_CLIENT_ID",
    "auth/GOOGLE_CLIENT_SECRET",
    "auth/GITHUB_CLIENT_ID",
    "auth/GITHUB_CLIENT_SECRET",
    "email/CONTACT_RECIPIENT",
  ]

  settings = merge(
    { for key, value in local.staging_settings : "staging/${key}" => value },
    { for key, value in local.dev_settings : "dev/${key}" => value },
  )
}

resource "infisical_secret" "setting" {
  for_each = local.settings

  workspace_id = infisical_project.staging.id
  env_slug     = split("/", each.key)[0]
  folder_path  = infisical_secret_folder.staging[join("/", slice(split("/", each.key), 0, 2))].path
  name         = split("/", each.key)[2]
  value        = each.value

  # Infisical checks that a reference points at a secret that exists.
  depends_on = [infisical_secret.by_hand]
}

resource "infisical_secret" "by_hand" {
  for_each = toset(local.staging_by_hand)

  workspace_id = infisical_project.staging.id
  env_slug     = infisical_project_environment.staging.slug
  folder_path  = infisical_secret_folder.staging["staging/${split("/", each.key)[0]}"].path
  name         = split("/", each.key)[1]
  value        = ""

  lifecycle {
    ignore_changes = [value]
  }
}
