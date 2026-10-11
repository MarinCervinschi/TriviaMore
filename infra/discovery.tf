data "coolify_projects" "all" {}

data "coolify_servers" "all" {}

data "coolify_github_apps" "all" {}

output "projects" {
  value = [for project in data.coolify_projects.all.projects : { name = project.name, uuid = project.uuid }]
}

output "servers" {
  value = [for server in data.coolify_servers.all.servers : { name = server.name, uuid = server.uuid }]
}

output "github_apps" {
  value = [for app in data.coolify_github_apps.all.github_apps : { name = app.name, uuid = app.uuid }]
}

locals {
  project_uuid = one([for project in data.coolify_projects.all.projects : project.uuid if project.name == "TriviaMore"])
}
