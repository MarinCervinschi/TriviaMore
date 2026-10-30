# Known before any apply: read from a data source, it would be unknown at plan time and replace every identity.
variable "org_id" {
  type        = string
  description = "The Infisical organization every identity belongs to; set by vars.sh."
}

variable "owner_username" {
  type        = string
  default     = "marincervinschi3@gmail.com"
  description = "The Infisical user who administers every project; they have to have joined the organization."
}
