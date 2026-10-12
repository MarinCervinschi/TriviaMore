data "coolify_projects" "all" {}

data "coolify_servers" "all" {}

locals {
  project_uuid = one([for project in data.coolify_projects.all.projects : project.uuid if project.name == "TriviaMore"])
  # rieti: the home server, on the tailnet and attached to Coolify.
  server_uuid = one([for server in data.coolify_servers.all.servers : server.uuid if server.name == "Rieti"])
}
