locals {
  mail_host = "mail-pr.trivia-more.it"
}

data "cloudflare_zone" "site" {
  filter = { name = "trivia-more.it" }
}

# rieti sits behind a home connection, so it reaches Cloudflare through this tunnel and opens no port.
resource "cloudflare_zero_trust_tunnel_cloudflared" "staging" {
  account_id = var.cloudflare_account_id
  name       = "triviamore-staging"
  config_src = "cloudflare"
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "staging" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.staging.id
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "staging" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.staging.id
  config = {
    ingress = [
      { hostname = local.mail_host, service = "http://mailpit-${coolify_service.mailpit.uuid}:8025" },
      { hostname = local.app_host, service = "http://${local.app_alias}:3000" },
      { service = "http_status:404" },
    ]
  }
}

resource "coolify_service" "tunnel" {
  name               = "trivia-more:tunnel-staging"
  description        = "cloudflared for the staging tunnel."
  project_uuid       = local.project_uuid
  server_uuid        = local.server_uuid
  environment_name   = coolify_environment.staging.name
  instant_deploy     = true
  docker_compose_raw = <<-YAML
    services:
      cloudflared:
        image: cloudflare/cloudflared:2026.10.3
        command: tunnel --no-autoupdate run
        environment:
          - TUNNEL_TOKEN=$${TUNNEL_TOKEN}
        restart: unless-stopped
        networks:
          - coolify
    # The Coolify network, which every service on rieti joins, so the tunnel reaches them by container name.
    networks:
      coolify:
        external: true
  YAML
}

# Bulk, because Coolify already created TUNNEL_TOKEN, empty, from the compose file; this overwrites it.
resource "coolify_envs_bulk" "tunnel" {
  resource_type = "service"
  resource_uuid = coolify_service.tunnel.uuid
  variables = {
    TUNNEL_TOKEN = data.cloudflare_zero_trust_tunnel_cloudflared_token.staging.token
  }
}

module "mail_access" {
  source = "../../modules/access"

  account_id     = var.cloudflare_account_id
  zone_id        = data.cloudflare_zone.site.id
  name           = "TriviaMore staging mail"
  host           = local.mail_host
  record_type    = "CNAME"
  record_content = "${cloudflare_zero_trust_tunnel_cloudflared.staging.id}.cfargotunnel.com"
  comment        = "Mailpit on rieti, through the staging tunnel; managed in infra/."
  allowed_emails = [var.owner_email]
  acme_bypass    = false
}

module "app_access" {
  source = "../../modules/access"

  account_id     = var.cloudflare_account_id
  zone_id        = data.cloudflare_zone.site.id
  name           = "TriviaMore staging"
  host           = local.app_host
  record_type    = "CNAME"
  record_content = "${cloudflare_zero_trust_tunnel_cloudflared.staging.id}.cfargotunnel.com"
  comment        = "The staging app on rieti, through the staging tunnel; managed in infra/."
  allowed_emails = [var.owner_email]
  acme_bypass    = false
}
