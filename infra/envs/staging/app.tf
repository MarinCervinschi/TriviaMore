locals {
  app_host  = "pr.trivia-more.it"
  app_alias = "trivia-more-app-staging"
}

module "app" {
  source = "../../modules/app"

  name                = "trivia-more:app-staging"
  description         = "The app of staging, on pr.trivia-more.it through the tunnel and behind Access."
  project_uuid        = local.project_uuid
  server_uuid         = local.server_uuid
  environment_name    = coolify_environment.staging.name
  github_app_uuid     = local.github_app_uuid
  git_branch          = "staging"
  dockerfile_location = "/Dockerfile"
  ports_exposes       = "3000"
  network_alias       = local.app_alias
  watch_paths         = ["src/**", "public/**", "drizzle/**", "package.json", "pnpm-lock.yaml", "Dockerfile", "docker-entrypoint.sh", "vite.config.ts"]
  env_at_build        = true

  env = {
    INFISICAL_CLIENT_ID     = var.app_infisical_client_id
    INFISICAL_CLIENT_SECRET = var.app_infisical_client_secret
    INFISICAL_PROJECT_ID    = var.infisical_project_id
    INFISICAL_SITE_URL      = var.infisical_site_url
    INFISICAL_ENV           = "staging"
  }
}
