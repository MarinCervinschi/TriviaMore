# Set by infra/envs/prod/vars.sh from cervinschi-infra; never written in a file.
variable "console_infisical_client_id" {
  type      = string
  sensitive = true
}

variable "console_infisical_client_secret" {
  type      = string
  sensitive = true
}

variable "infisical_project_id" {
  type = string
}

variable "infisical_site_url" {
  type = string
}

variable "cloudflare_account_id" {
  type = string
}

variable "console_owner_email" {
  type        = string
  description = "The one address Cloudflare Access lets into the console."
}

variable "console_seq_api_key" {
  type      = string
  sensitive = true
}

variable "console_worker_seq_api_key" {
  type      = string
  sensitive = true
}
