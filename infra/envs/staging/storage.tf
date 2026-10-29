# Staging's files are on the backup Garage on rieti, run by cervinschi-infra (envs/hub/backup.tf), which writes the S3 secrets to /storage.
locals {
  media_host = "media-pr.trivia-more.it"
}

# The public bucket, served by that Garage's web endpoint on the tailnet. No Access: an <img> cannot pass its login.
resource "cloudflare_dns_record" "media" {
  zone_id = data.cloudflare_zone.site.id
  name    = local.media_host
  type    = "CNAME"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.staging.id}.cfargotunnel.com"
  proxied = true
  ttl     = 1
  comment = "Staging's public files, from Garage on rieti, through the staging tunnel; managed in infra/."
}
