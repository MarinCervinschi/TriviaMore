# Reads COOLIFY_ENDPOINT and COOLIFY_TOKEN, from trivia-more-infra → /coolify.
provider "coolify" {}

# Reads CLOUDFLARE_API_TOKEN, from trivia-more-infra → /cloudflare.
provider "cloudflare" {}

# Writes what this root generates to trivia-more-staging, as TriviaMore-Terraform; set by vars.sh.
provider "infisical" {
  auth = {
    universal = {}
  }
}
