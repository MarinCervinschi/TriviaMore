# Reads COOLIFY_ENDPOINT and COOLIFY_TOKEN, from cervinschi-infra → /coolify.
provider "coolify" {}

# Reads CLOUDFLARE_API_TOKEN, from cervinschi-infra → /cloudflare.
provider "cloudflare" {}

# Writes what this root generates to the production project, as TriviaMore-Terraform; set by vars.sh.
provider "infisical" {
  auth = {
    universal = {}
  }
}
