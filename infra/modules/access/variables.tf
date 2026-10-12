variable "account_id" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "name" {
  type        = string
  description = "The Access application's name, which also prefixes its policies."
}

variable "host" {
  type = string
}

variable "record_type" {
  type    = string
  default = "A"
}

variable "record_content" {
  type        = string
  description = "The origin: a server address for an A record, a tunnel host for a CNAME."
}

variable "comment" {
  type = string
}

variable "allowed_emails" {
  type = list(string)
}

variable "allow_label" {
  type        = string
  default     = "the owner"
  description = "Who the allow policy admits, as its name reads in the dashboard."
}

variable "acme_bypass" {
  type        = bool
  default     = true
  description = "False behind a tunnel, where Cloudflare holds the certificate."
}
