# The public files, served by the shared Garage on savvy (cervinschi-infra), which holds the bucket.
resource "cloudflare_dns_record" "media" {
  zone_id = data.cloudflare_zone.site.id
  name    = "media.trivia-more.it"
  type    = "A"
  content = local.server_ip
  proxied = true
  ttl     = 1
  comment = "Public files, from Garage on savvy; managed in infra/."
}
