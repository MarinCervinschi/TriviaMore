# What this root generates, published to the production project, whose structure is in infra/infisical.
data "infisical_projects" "prod" {
  slug = "trivia-more-1q-tw"
}

# Signs the session cookies; changing it signs every user out.
resource "random_password" "better_auth" {
  length  = 48
  special = false
}

resource "infisical_secret" "better_auth_secret" {
  workspace_id = data.infisical_projects.prod.id
  env_slug     = "prod"
  folder_path  = "/auth"
  name         = "BETTER_AUTH_SECRET"
  value        = random_password.better_auth.result
}
