locals {
  server_uuid     = one([for server in data.coolify_servers.all.servers : server.uuid if server.name == "localhost"])
  github_app_uuid = one([for app in data.coolify_github_apps.all.github_apps : app.uuid if app.name == "savvy-dev-app"])

  # Shared by the server and the worker, which build from the same Dockerfile.
  console = {
    project_uuid        = local.project_uuid
    server_uuid         = local.server_uuid
    environment_name    = "production"
    github_app_uuid     = local.github_app_uuid
    git_repository      = "MarinCervinschi/TriviaMore"
    git_branch          = "preview"
    base_directory      = "/"
    dockerfile_location = "/admin-console/Dockerfile"
    watch_paths         = "admin-console/**\nsrc/**\nscripts/**\npackage.json\npnpm-lock.yaml\ndocker-entrypoint.sh"
  }

  console_env = {
    INFISICAL_CLIENT_ID     = var.console_infisical_client_id
    INFISICAL_CLIENT_SECRET = var.console_infisical_client_secret
    INFISICAL_PROJECT_ID    = var.infisical_project_id
    INFISICAL_SITE_URL      = var.infisical_site_url
    INFISICAL_ENV           = "prod"
  }

  # The server also checks the token Cloudflare Access signs; the worker serves no requests.
  console_server_env = merge(local.console_env, {
    CF_ACCESS_TEAM_DOMAIN = local.team_domain
    CF_ACCESS_AUD         = cloudflare_zero_trust_access_application.console.aud
  })
}

resource "coolify_application_github_app" "console" {
  name                = "trivia-more:console"
  description         = "The ops console, on its domain behind Cloudflare Access."
  project_uuid        = local.console.project_uuid
  server_uuid         = local.console.server_uuid
  environment_name    = local.console.environment_name
  github_app_uuid     = local.console.github_app_uuid
  git_repository      = local.console.git_repository
  git_branch          = local.console.git_branch
  base_directory      = local.console.base_directory
  build_pack          = "dockerfile"
  dockerfile_location = local.console.dockerfile_location
  ports_exposes       = "3100"
  domains             = "https://${local.console_host}"
  autogenerate_domain = false
  watch_paths         = local.console.watch_paths
  instant_deploy      = false

  # The domain goes live only once Access stands in front of it.
  depends_on = [cloudflare_zero_trust_access_application.console]
}

resource "coolify_application_github_app" "console_worker" {
  name                    = "trivia-more:console-worker"
  description             = "The console's job worker; one only, since it closes the runs of a worker that is gone."
  project_uuid            = local.console.project_uuid
  server_uuid             = local.console.server_uuid
  environment_name        = local.console.environment_name
  github_app_uuid         = local.console.github_app_uuid
  git_repository          = local.console.git_repository
  git_branch              = local.console.git_branch
  base_directory          = local.console.base_directory
  build_pack              = "dockerfile"
  dockerfile_location     = local.console.dockerfile_location
  dockerfile_target_build = "worker"
  ports_exposes           = "3100"
  domains                 = ""
  autogenerate_domain     = false
  watch_paths             = local.console.watch_paths
  instant_deploy          = false
}

resource "coolify_environment_variable" "console" {
  for_each = nonsensitive(toset(keys(local.console_server_env)))

  application_uuid = coolify_application_github_app.console.uuid
  key              = each.key
  value            = local.console_server_env[each.key]
  is_runtime       = true
  is_build         = false
  is_preview       = false
  is_literal       = true
}

resource "coolify_environment_variable" "console_worker" {
  for_each = nonsensitive(toset(keys(local.console_env)))

  application_uuid = coolify_application_github_app.console_worker.uuid
  key              = each.key
  value            = local.console_env[each.key]
  is_runtime       = true
  is_build         = false
  is_preview       = false
  is_literal       = true
}
