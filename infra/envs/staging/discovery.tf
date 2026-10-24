data "coolify_projects" "all" {}

data "coolify_servers" "all" {}

data "coolify_github_apps" "all" {}

locals {
  project_uuid = one([for project in data.coolify_projects.all.projects : project.uuid if project.name == "TriviaMore"])
  # rieti: the home server, on the tailnet and attached to Coolify.
  server_uuid     = one([for server in data.coolify_servers.all.servers : server.uuid if server.name == "Rieti"])
  github_app_uuid = one([for app in data.coolify_github_apps.all.github_apps : app.uuid if app.name == "savvy-dev-app"])
}
