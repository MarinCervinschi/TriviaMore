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
