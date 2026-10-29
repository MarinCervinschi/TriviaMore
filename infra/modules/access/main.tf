terraform {
  required_providers {
    cloudflare = { source = "cloudflare/cloudflare" }
  }
}

resource "cloudflare_dns_record" "this" {
  zone_id = var.zone_id
  name    = var.host
  type    = var.record_type
  content = var.record_content
  proxied = true
  ttl     = 1
  comment = var.comment
}

resource "cloudflare_zero_trust_access_policy" "allow" {
  account_id       = var.account_id
  name             = "${var.name}: ${var.allow_label}"
  decision         = "allow"
  include          = [for email in var.allowed_emails : { email = { email = email } }]
  session_duration = "24h"
}

resource "cloudflare_zero_trust_access_application" "this" {
  account_id           = var.account_id
  name                 = var.name
  type                 = "self_hosted"
  domain               = var.host
  session_duration     = "24h"
  app_launcher_visible = false
  policies             = [{ id = cloudflare_zero_trust_access_policy.allow.id, precedence = 1 }]
}

# Let's Encrypt renews the certificate over HTTP on this path, which Access would otherwise stop.
resource "cloudflare_zero_trust_access_policy" "acme_bypass" {
  count = var.acme_bypass ? 1 : 0

  account_id = var.account_id
  name       = "${var.name}: certificate renewal"
  decision   = "bypass"
  include    = [{ everyone = {} }]
}

resource "cloudflare_zero_trust_access_application" "acme" {
  count = var.acme_bypass ? 1 : 0

  account_id           = var.account_id
  name                 = "${var.name}: ACME challenge"
  type                 = "self_hosted"
  domain               = "${var.host}/.well-known/acme-challenge"
  app_launcher_visible = false
  policies             = [{ id = cloudflare_zero_trust_access_policy.acme_bypass[0].id, precedence = 1 }]
}
