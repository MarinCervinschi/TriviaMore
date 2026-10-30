data "coolify_s3_storages" "all" {}

locals {
  # The backup Garage on rieti, which cervinschi-infra registers in Coolify (envs/hub/backup.tf).
  rieti_s3_uuid = one([for storage in data.coolify_s3_storages.all.s3_storages : storage.uuid if storage.name == "rieti"])
}

# A standalone database rather than a compose service, because Coolify's API schedules backups only for those.
resource "coolify_database_postgresql" "prod" {
  name              = "trivia-more:db"
  description       = "The production database, which replaces Supabase's Postgres. Managed in infra/."
  project_uuid      = local.project_uuid
  server_uuid       = local.server_uuid
  environment_name  = "production"
  image             = "postgres:17.11"
  postgres_user     = "postgres"
  postgres_db       = "postgres"
  postgres_password = var.postgres_password
  # Coolify's public port listens on every address of the VPS; the tailnet reaches it through postgres-tailnet.
  is_public      = false
  instant_deploy = true
}

resource "coolify_database_backup" "prod" {
  database_uuid                    = coolify_database_postgresql.prod.uuid
  databases_to_backup              = "postgres"
  frequency                        = "0 3 * * *"
  enabled                          = true
  save_s3                          = true
  s3_storage_uuid                  = local.rieti_s3_uuid
  retain_amount_locally            = 3
  retain_amount_s3                 = 30
  missing_backup_notification_days = 2
  timeout                          = 1800
}

# Migrations, dumps and Drizzle Gateway reach the database here, on savvy's Tailscale address and nowhere else.
resource "coolify_service" "postgres_tailnet" {
  name               = "trivia-more:db-tailnet"
  description        = "Forwards savvy's Tailscale address on 5432 to the production database. Managed in infra/."
  project_uuid       = local.project_uuid
  server_uuid        = local.server_uuid
  environment_name   = "production"
  instant_deploy     = true
  docker_compose_raw = <<-YAML
    services:
      postgres-tailnet:
        image: alpine/socat:1.8.1.1
        command: ["TCP-LISTEN:5432,fork,reuseaddr", "TCP:${coolify_database_postgresql.prod.uuid}:5432"]
        # Docker cannot bind it before tailscaled is up after a reboot; the restart policy retries until it is.
        ports:
          - "${var.savvy_tailnet_host}:5432:5432"
        restart: unless-stopped
        networks:
          - coolify
    networks:
      coolify:
        external: true
  YAML
}
