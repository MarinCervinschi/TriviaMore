# Set by infra/envs/staging/vars.sh from cervinschi-infra; never written in a file.
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

variable "app_db_password" {
  type        = string
  sensitive   = true
  description = "The password of trivia_app, which db:reset-staging sets on the database."
}

variable "infisical_site_url" {
  type        = string
  description = "Where the app signs in to Infisical; a public address, which the containers on rieti resolve."
}
