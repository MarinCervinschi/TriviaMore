locals {
  server_uuid     = one([for server in data.coolify_servers.all.servers : server.uuid if server.name == "localhost"])
  github_app_uuid = one([for app in data.coolify_github_apps.all.github_apps : app.uuid if app.name == "savvy-dev-app"])

  # The server and the worker build from the same Dockerfile and redeploy on the same paths.
  console_watch_paths = ["admin-console/**", "src/**", "scripts/**", "package.json", "pnpm-lock.yaml", "docker-entrypoint.sh"]

  console_env = {
    INFISICAL_CLIENT_ID     = var.console_infisical_client_id
    INFISICAL_CLIENT_SECRET = var.console_infisical_client_secret
    INFISICAL_PROJECT_ID    = var.infisical_project_id
    INFISICAL_SITE_URL      = var.infisical_site_url
    INFISICAL_ENV           = "prod"
  }
}

module "console" {
  source = "../../modules/app"

  name                = "trivia-more:console"
  description         = "The ops console, on its domain behind Cloudflare Access."
  project_uuid        = local.project_uuid
  server_uuid         = local.server_uuid
  environment_name    = "production"
  github_app_uuid     = local.github_app_uuid
  git_branch          = "staging"
  dockerfile_location = "/admin-console/Dockerfile"
  ports_exposes       = "3100"
  domain              = local.console_host
  watch_paths         = local.console_watch_paths

  # The server also checks the token Cloudflare Access signs; each service has its own Seq key.
  env = merge(local.console_env, {
    CF_ACCESS_TEAM_DOMAIN = local.team_domain
    CF_ACCESS_AUD         = module.console_access.aud
    SEQ_SERVICE_API_KEY   = var.console_seq_api_key
  })

  # The domain goes live only once Access stands in front of it.
  depends_on = [module.console_access]
}

module "console_worker" {
  source = "../../modules/app"

  name                    = "trivia-more:console-worker"
  description             = "The console's job worker; one only, since it closes the runs of a worker that is gone."
  project_uuid            = local.project_uuid
  server_uuid             = local.server_uuid
  environment_name        = "production"
  github_app_uuid         = local.github_app_uuid
  git_branch              = "staging"
  dockerfile_location     = "/admin-console/Dockerfile"
  dockerfile_target_build = "worker"
  ports_exposes           = "3100"
  watch_paths             = local.console_watch_paths

  env = merge(local.console_env, {
    SEQ_SERVICE_API_KEY = var.console_worker_seq_api_key
  })
}
