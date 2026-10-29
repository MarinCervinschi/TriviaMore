locals {
  console_host = "admin.trivia-more.it"
  team_domain  = "https://${data.cloudflare_zero_trust_organization.team.auth_domain}"
}

data "cloudflare_zone" "site" {
  filter = { name = "trivia-more.it" }
}

data "cloudflare_zero_trust_organization" "team" {
  account_id = var.cloudflare_account_id
}

module "console_access" {
  source = "../../modules/access"

  account_id     = var.cloudflare_account_id
  zone_id        = data.cloudflare_zone.site.id
  name           = "TriviaMore console"
  host           = local.console_host
  record_content = var.server_ip
  comment        = "The ops console, behind Cloudflare Access; managed in infra/."
  allowed_emails = [var.console_owner_email]
}
