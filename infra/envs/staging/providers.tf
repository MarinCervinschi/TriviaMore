# Reads COOLIFY_ENDPOINT and COOLIFY_TOKEN, which infra/run.sh injects from trivia-more-infra → /coolify.
provider "coolify" {}

# Reads CLOUDFLARE_API_TOKEN, from the same folder.
provider "cloudflare" {}
