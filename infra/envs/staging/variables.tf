# Set by infra/envs/staging/vars.sh from trivia-more-infra; never written in a file.
variable "cloudflare_account_id" {
  type = string
}

variable "postgres_password" {
  type      = string
  sensitive = true
}

variable "owner_email" {
  type        = string
  description = "The address Cloudflare Access lets into the staging pages."
}

variable "garage_rpc_secret" {
  type      = string
  sensitive = true
}

variable "garage_admin_token" {
  type      = string
  sensitive = true
}

variable "garage_app_access_key_id" {
  type      = string
  sensitive = true
}

variable "garage_app_secret_access_key" {
  type      = string
  sensitive = true
}

variable "app_infisical_client_id" {
  type      = string
  sensitive = true
}

variable "app_infisical_client_secret" {
  type      = string
  sensitive = true
}

variable "infisical_project_id" {
  type = string
}

variable "infisical_site_url" {
  type = string
}
