locals {
  console_host = "admin.trivia-more.it"
  # The VPS's public address, where Cloudflare's proxy sends the traffic it lets through.
  server_ip   = "130.110.2.209"
  team_domain = "https://${data.cloudflare_zero_trust_organization.team.auth_domain}"
}

data "cloudflare_zone" "site" {
  filter = { name = "trivia-more.it" }
}

data "cloudflare_zero_trust_organization" "team" {
  account_id = var.cloudflare_account_id
}

resource "cloudflare_dns_record" "console" {
  zone_id = data.cloudflare_zone.site.id
  name    = local.console_host
  type    = "A"
  content = local.server_ip
  proxied = true
  ttl     = 1
  comment = "The ops console, behind Cloudflare Access; managed in infra/."
}

resource "cloudflare_zero_trust_access_policy" "console_owner" {
  account_id       = var.cloudflare_account_id
  name             = "TriviaMore console: the owner"
  decision         = "allow"
  include          = [{ email = { email = var.console_owner_email } }]
  session_duration = "24h"
}

resource "cloudflare_zero_trust_access_application" "console" {
  account_id           = var.cloudflare_account_id
  name                 = "TriviaMore console"
  type                 = "self_hosted"
  domain               = local.console_host
  session_duration     = "24h"
  app_launcher_visible = false
  policies             = [{ id = cloudflare_zero_trust_access_policy.console_owner.id, precedence = 1 }]
}

# Let's Encrypt renews the certificate over HTTP on this path, which Access would otherwise stop.
resource "cloudflare_zero_trust_access_policy" "acme_bypass" {
  account_id = var.cloudflare_account_id
  name       = "TriviaMore console: certificate renewal"
  decision   = "bypass"
  include    = [{ everyone = {} }]
}

resource "cloudflare_zero_trust_access_application" "console_acme" {
  account_id           = var.cloudflare_account_id
  name                 = "TriviaMore console: ACME challenge"
  type                 = "self_hosted"
  domain               = "${local.console_host}/.well-known/acme-challenge"
  app_launcher_visible = false
  policies             = [{ id = cloudflare_zero_trust_access_policy.acme_bypass.id, precedence = 1 }]
}
