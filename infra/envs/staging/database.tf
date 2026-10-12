resource "coolify_environment" "staging" {
  project_uuid = local.project_uuid
  name         = "staging"
  description  = "Staging on rieti, with no real users, rebuilt from the migrations, the catalogue and the seed."
}

resource "coolify_database_postgresql" "staging" {
  name              = "trivia-more:db-staging"
  description       = "The staging database; db:reset-staging rebuilds it at any time."
  project_uuid      = local.project_uuid
  server_uuid       = local.server_uuid
  environment_name  = coolify_environment.staging.name
  image             = "postgres:17"
  postgres_user     = "postgres"
  postgres_db       = "postgres"
  postgres_password = var.postgres_password
  # Reachable from the tailnet for local development and the pipeline; the home router forwards no port.
  is_public      = true
  public_port    = 5432
  instant_deploy = true
}
