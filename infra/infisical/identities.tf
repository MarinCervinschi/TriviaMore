# Created during the bootstrap; its client secret is rotated by hand, since an apply cannot replace its own.
resource "infisical_identity" "terraform" {
  name                  = "TriviaMore-Terraform"
  org_id                = var.org_id
  role                  = "admin"
  has_delete_protection = true
  metadata              = []

  lifecycle {
    prevent_destroy = true
  }
}

# The production app and the console; viewer on the production project, which holds nothing else.
resource "infisical_identity" "app_prod" {
  name                  = "TriviaMore"
  org_id                = var.org_id
  role                  = "member"
  has_delete_protection = true
  metadata              = []
}

resource "infisical_identity" "console" {
  name     = "TriviaMore-Console"
  org_id   = var.org_id
  role     = "no-access"
  metadata = []
}

# Read by the staging app on rieti. Its client secret is made by infra/envs/staging, which hands it to Coolify.
resource "infisical_project_identity" "app_prod" {
  project_id     = infisical_project.prod.id
  identity_id    = infisical_identity.app_prod.id
  adopt_existing = true
  roles = [
    {
      role_slug = "viewer"
    },
  ]
}

resource "infisical_project_identity" "console" {
  project_id     = infisical_project.prod.id
  identity_id    = infisical_identity.console.id
  adopt_existing = true
  roles = [
    {
      role_slug = "viewer"
    },
  ]
}

resource "infisical_identity" "app_staging" {
  name     = "TriviaMore-Staging"
  org_id   = var.org_id
  role     = "no-access"
  metadata = []
}

resource "infisical_identity_universal_auth" "app_staging" {
  identity_id = infisical_identity.app_staging.id
}

resource "infisical_project_identity" "app_staging" {
  project_id  = infisical_project.staging.id
  identity_id = infisical_identity.app_staging.id
  roles = [
    {
      role_slug = "viewer"
    },
  ]
}

# Infisical makes the identity that creates a project its admin; this keeps that membership in the plan.
resource "infisical_project_identity" "terraform_staging" {
  project_id     = infisical_project.staging.id
  identity_id    = infisical_identity.terraform.id
  adopt_existing = true
  roles = [
    {
      role_slug = "admin"
    },
  ]
}

# Added by hand during the bootstrap, since an organization admin is not a member of a project it did not create.
resource "infisical_project_identity" "terraform_prod" {
  project_id     = infisical_project.prod.id
  identity_id    = infisical_identity.terraform.id
  adopt_existing = true
  roles = [
    {
      role_slug = "admin"
    },
  ]
}
