# The S3 store of staging (docs/PLATFORM.md). One node, so Garage lays out its own cluster; garage-init creates the app's key and buckets on every start, and skips what exists.
resource "coolify_service" "garage" {
  name               = "trivia-more:garage-staging"
  description        = "Garage, the S3 store of staging."
  project_uuid       = local.project_uuid
  server_uuid        = local.server_uuid
  environment_name   = coolify_environment.staging.name
  instant_deploy     = false
  docker_compose_raw = <<-YAML
    services:
      garage:
        image: dxflrs/garage:v2.4.1
        command: ["/garage", "server", "--single-node"]
        environment:
          - GARAGE_RPC_SECRET=$${GARAGE_RPC_SECRET}
          - GARAGE_ADMIN_TOKEN=$${GARAGE_ADMIN_TOKEN}
        volumes:
          - garage-meta:/var/lib/garage/meta
          - garage-data:/var/lib/garage/data
          - type: bind
            source: ./garage.toml
            target: /etc/garage.toml
            content: |
              metadata_dir = "/var/lib/garage/meta"
              data_dir = "/var/lib/garage/data"
              db_engine = "sqlite"
              replication_factor = 1
              rpc_bind_addr = "[::]:3901"
              rpc_public_addr = "127.0.0.1:3901"

              [s3_api]
              s3_region = "garage"
              api_bind_addr = "[::]:3900"
              root_domain = ".s3.garage"

              [s3_web]
              bind_addr = "[::]:3902"
              root_domain = ".web.garage"
              index = "index.html"

              [admin]
              api_bind_addr = "[::]:3903"
        restart: unless-stopped
        networks:
          - coolify
      garage-init:
        image: curlimages/curl:8.22.0
        depends_on:
          - garage
        environment:
          - GARAGE_ADMIN_TOKEN=$${GARAGE_ADMIN_TOKEN}
          - APP_KEY_ID=$${GARAGE_APP_ACCESS_KEY_ID}
          - APP_KEY_SECRET=$${GARAGE_APP_SECRET_ACCESS_KEY}
        entrypoint: ["/bin/sh", "-c"]
        command:
          - |
            set -eu
            api() { curl -fsS -H "Authorization: Bearer $$GARAGE_ADMIN_TOKEN" -H "Content-Type: application/json" "$$@"; }
            until api -o /dev/null http://garage:3903/v2/GetClusterHealth; do sleep 2; done
            api -X POST http://garage:3903/v2/ImportKey -d "{\"accessKeyId\":\"$$APP_KEY_ID\",\"secretAccessKey\":\"$$APP_KEY_SECRET\",\"name\":\"app\"}" > /dev/null 2>&1 || true
            for bucket in public contributions; do
              id=$$(api "http://garage:3903/v2/GetBucketInfo?globalAlias=$$bucket" 2>/dev/null | grep -o '"id": *"[0-9a-f]*"' | head -1 | cut -d'"' -f4 || true)
              if [ -z "$$id" ]; then
                id=$$(api -X POST http://garage:3903/v2/CreateBucket -d "{\"globalAlias\":\"$$bucket\"}" | grep -o '"id": *"[0-9a-f]*"' | head -1 | cut -d'"' -f4)
              fi
              api -X POST http://garage:3903/v2/AllowBucketKey -d "{\"bucketId\":\"$$id\",\"accessKeyId\":\"$$APP_KEY_ID\",\"permissions\":{\"read\":true,\"write\":true,\"owner\":true}}" > /dev/null
              if [ "$$bucket" = public ]; then
                api -X POST "http://garage:3903/v2/UpdateBucket?id=$$id" -d '{"websiteAccess":{"enabled":true,"indexDocument":"index.html"}}' > /dev/null
              fi
              echo "bucket $$bucket ready"
            done
        restart: "no"
        networks:
          - coolify
    volumes:
      garage-meta:
      garage-data:
    networks:
      coolify:
        external: true
  YAML
}

resource "coolify_envs_bulk" "garage" {
  resource_type = "service"
  resource_uuid = coolify_service.garage.uuid
  variables = {
    GARAGE_RPC_SECRET            = var.garage_rpc_secret
    GARAGE_ADMIN_TOKEN           = var.garage_admin_token
    GARAGE_APP_ACCESS_KEY_ID     = var.garage_app_access_key_id
    GARAGE_APP_SECRET_ACCESS_KEY = var.garage_app_secret_access_key
  }
}
