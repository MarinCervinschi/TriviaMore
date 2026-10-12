# Set by infra/envs/staging/vars.sh from staging → /infra; never written in a file.
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
