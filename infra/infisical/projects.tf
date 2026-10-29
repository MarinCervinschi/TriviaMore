# A project per environment, because without custom roles a project is the only boundary Infisical draws.

# Production, named TriviaMore; its dev and staging environments go once nothing reads them.
resource "infisical_project" "prod" {
  name                  = "TriviaMore"
  slug                  = "trivia-more-1q-tw"
  has_delete_protection = true

  lifecycle {
    prevent_destroy = true
  }
}

resource "infisical_project_environment" "prod" {
  project_id = infisical_project.prod.id
  name       = "Production"
  slug       = "prod"
}

resource "infisical_project" "staging" {
  name                       = "trivia-more-staging"
  slug                       = "trivia-more-staging"
  description                = "The staging app on rieti, and local development, which works on the staging database."
  should_create_default_envs = false
  has_delete_protection      = true

  lifecycle {
    prevent_destroy = true
  }
}

resource "infisical_project_environment" "staging" {
  project_id = infisical_project.staging.id
  name       = "Staging"
  slug       = "staging"
  position   = 1
}

# Local runs: `pnpm dev` reads it, with the staging database and the staging OAuth clients.
resource "infisical_project_environment" "dev" {
  project_id = infisical_project.staging.id
  name       = "Development"
  slug       = "dev"
  position   = 2
}

locals {
  # A concern per folder, as docs/PLATFORM.md lays them out; `infisical run --recursive` reads them all.
  app_folders = ["app", "auth", "database", "email", "storage"]

  staging_folders = merge([
    for env in [infisical_project_environment.staging.slug, infisical_project_environment.dev.slug] : {
      for name in local.app_folders : "${env}/${name}" => { env = env, name = name }
    }
  ]...)
}

resource "infisical_secret_folder" "staging" {
  for_each = local.staging_folders

  project_id       = infisical_project.staging.id
  environment_slug = each.value.env
  folder_path      = "/"
  name             = each.value.name
}

resource "infisical_project_user" "owner" {
  project_id = infisical_project.staging.id
  username   = var.owner_username
  roles = [
    {
      role_slug = "admin"
    },
  ]
}

# The S3 keys of production, written by cervinschi-infra, which runs Garage on savvy.
resource "infisical_secret_folder" "prod_storage" {
  project_id       = infisical_project.prod.id
  environment_slug = infisical_project_environment.prod.slug
  folder_path      = "/"
  name             = "storage"
}
