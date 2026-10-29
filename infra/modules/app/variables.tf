variable "name" {
  type = string
}

variable "description" {
  type = string
}

variable "project_uuid" {
  type = string
}

variable "server_uuid" {
  type = string
}

variable "environment_name" {
  type = string
}

variable "github_app_uuid" {
  type = string
}

variable "git_repository" {
  type    = string
  default = "MarinCervinschi/TriviaMore"
}

variable "git_branch" {
  type = string
}

variable "base_directory" {
  type    = string
  default = "/"
}

variable "dockerfile_location" {
  type = string
}

variable "dockerfile_target_build" {
  type    = string
  default = null
}

variable "ports_exposes" {
  type = string
}

variable "domain" {
  type        = string
  default     = null
  description = "The host it serves, without the scheme; null for a service with no domain."
}

variable "watch_paths" {
  type = list(string)
}

variable "env" {
  type      = map(string)
  default   = {}
  sensitive = true
}

variable "network_alias" {
  type        = string
  default     = null
  description = "A fixed name on the Docker network, for a tunnel that reaches the container directly."
}

variable "env_at_build" {
  type    = bool
  default = false
}

variable "health_check_path" {
  type        = string
  default     = null
  description = "A path that answers 200 while the server runs; null leaves the health check off."
}
