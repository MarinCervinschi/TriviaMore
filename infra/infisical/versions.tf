terraform {
  # use_lockfile on the S3 backend needs 1.10.
  required_version = ">= 1.10"

  required_providers {
    infisical = {
      source  = "infisical/infisical"
      version = "= 0.20.3"
    }
  }

  # The bucket comes from infra/run.sh and the endpoint from R2_ENDPOINT, as for the other roots.
  backend "s3" {
    key                         = "triviamore-infisical.tfstate"
    region                      = "auto"
    use_lockfile                = true
    use_path_style              = true
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
  }
}
