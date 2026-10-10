data "coolify_version" "current" {}

data "coolify_projects" "all" {}

data "coolify_servers" "all" {}

output "coolify_version" {
  value = data.coolify_version.current.version
}

output "projects" {
  value = [for project in data.coolify_projects.all.projects : { name = project.name, uuid = project.uuid }]
}

output "servers" {
  value = [for server in data.coolify_servers.all.servers : { name = server.name, uuid = server.uuid }]
}

locals {
  project_uuid = one([for project in data.coolify_projects.all.projects : project.uuid if project.name == "TriviaMore"])
}

data "coolify_environments" "triviamore" {
  project_uuid = local.project_uuid
}

data "coolify_applications" "all" {}

data "coolify_github_apps" "all" {}

output "environments" {
  value = [for environment in data.coolify_environments.triviamore.environments : environment.name]
}

output "applications" {
  value = [
    for app in data.coolify_applications.all.applications : {
      name   = app.name, uuid = app.uuid, build_pack = app.build_pack,
      branch = app.git_branch, domains = app.domains, status = app.status
    } if strcontains(lower(coalesce(app.git_repository, "")), "triviamore")
  ]
}

output "github_apps" {
  value = [for app in data.coolify_github_apps.all.github_apps : { name = app.name, uuid = app.uuid }]
}

data "coolify_application" "app" {
  uuid = one([for app in data.coolify_applications.all.applications : app.uuid if app.name == "trivia-more:app"])
}

output "app" {
  value = {
    server_uuid         = data.coolify_application.app.server_uuid
    environment_name    = data.coolify_application.app.environment_name
    git_repository      = data.coolify_application.app.git_repository
    dockerfile_location = data.coolify_application.app.dockerfile_location
    ports_exposes       = data.coolify_application.app.ports_exposes
  }
}
