# Staging never delivers mail: the app sends to Mailpit over SMTP on 1025, and its page shows what arrived.
resource "coolify_service" "mailpit" {
  name               = "trivia-more:mailpit-staging"
  description        = "Catches every email staging sends."
  project_uuid       = local.project_uuid
  server_uuid        = local.server_uuid
  environment_name   = coolify_environment.staging.name
  instant_deploy     = true
  docker_compose_raw = <<-YAML
    services:
      mailpit:
        image: axllent/mailpit:v1.31.5
        environment:
          - MP_DATABASE=/data/mailpit.db
          - MP_SMTP_AUTH_ACCEPT_ANY=1
          - MP_SMTP_AUTH_ALLOW_INSECURE=1
        volumes:
          - mailpit-data:/data
        restart: unless-stopped
        networks:
          - coolify
    volumes:
      mailpit-data:
    networks:
      coolify:
        external: true
  YAML
}
