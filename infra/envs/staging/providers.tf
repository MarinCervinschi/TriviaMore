# Reads COOLIFY_ENDPOINT and COOLIFY_TOKEN, which Infisical injects from staging → /infra.
provider "coolify" {}

# Reads CLOUDFLARE_API_TOKEN, from the same folder.
provider "cloudflare" {}
