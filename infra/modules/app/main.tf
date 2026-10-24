terraform {
  required_providers {
    coolify = { source = "coolify-terraform/coolify" }
  }
}

resource "coolify_application_github_app" "this" {
  name                    = var.name
  description             = var.description
  project_uuid            = var.project_uuid
  server_uuid             = var.server_uuid
  environment_name        = var.environment_name
  github_app_uuid         = var.github_app_uuid
  git_repository          = var.git_repository
  git_branch              = var.git_branch
  base_directory          = var.base_directory
  build_pack              = "dockerfile"
  dockerfile_location     = var.dockerfile_location
  dockerfile_target_build = var.dockerfile_target_build
  ports_exposes           = var.ports_exposes
  domains                 = var.domain == null ? "" : "https://${var.domain}"
  autogenerate_domain     = false
  watch_paths             = join("\n", var.watch_paths)
  custom_network_aliases  = var.network_alias
  instant_deploy          = false
}

# Runtime, and at build too when `env_at_build`: the app's Dockerfile reads its secrets from Infisical during `pnpm build`.
resource "coolify_environment_variable" "this" {
  for_each = nonsensitive(toset(keys(var.env)))

  application_uuid = coolify_application_github_app.this.uuid
  key              = each.key
  value            = var.env[each.key]
  is_runtime       = true
  is_build         = var.env_at_build
  is_preview       = false
  is_literal       = true
}
