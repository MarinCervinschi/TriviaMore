locals {
  # Known before any apply: read from a data source, it would be unknown at plan time and replace every identity.
  org_id = "f84e1941-40d9-49b1-bb8a-1a58dbd61d5b"
}

# Created during the bootstrap; its client secret is rotated by hand, since an apply cannot replace its own.
resource "infisical_identity" "terraform" {
  name                  = "TriviaMore-Terraform"
  org_id                = local.org_id
  role                  = "admin"
  has_delete_protection = true
  metadata              = []

  lifecycle {
    prevent_destroy = true
  }
}

import {
  to = infisical_identity.terraform
  id = "f9b23753-ac42-41a2-b7be-fc816b43f547"
}

# The production app and the console, still on the custom project role until they move to viewer.
resource "infisical_identity" "app_prod" {
  name                  = "TriviaMore"
  org_id                = local.org_id
  role                  = "member"
  has_delete_protection = true
  metadata              = []
}

import {
  to = infisical_identity.app_prod
  id = "188dba78-3a78-4c37-8bb3-901473d2e751"
}

resource "infisical_identity" "console" {
  name     = "TriviaMore-Console"
  org_id   = local.org_id
  role     = "no-access"
  metadata = []
}

import {
  to = infisical_identity.console
  id = "c969b0d3-e1cf-4a55-a3c2-50c5a577efac"
}

# Read by the staging app on rieti. Its client secret is made by infra/envs/staging, which hands it to Coolify.
resource "infisical_identity" "app_staging" {
  name     = "TriviaMore-Staging"
  org_id   = local.org_id
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
