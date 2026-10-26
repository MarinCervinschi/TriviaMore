# Reads INFISICAL_HOST and the universal auth of TriviaMore-Terraform, which vars.sh sets.
provider "infisical" {
  auth = {
    universal = {}
  }
}
