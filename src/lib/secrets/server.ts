import { InfisicalSDK } from "@infisical/sdk"

let loaded = false

export async function loadSecrets() {
  // Skip if already loaded
  if (loaded) return

  const clientId = process.env.INFISICAL_CLIENT_ID
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET
  const projectId = process.env.INFISICAL_PROJECT_ID

  // No machine identity credentials — skip (dev mode uses CLI)
  if (!clientId || !clientSecret || !projectId) return

  const client = new InfisicalSDK({
    siteUrl: process.env.INFISICAL_SITE_URL ?? "https://app.infisical.com",
  })

  await client.auth().universalAuth.login({ clientId, clientSecret })

  await client.secrets().listSecrets({
    projectId,
    environment: process.env.INFISICAL_ENV ?? "prod",
    attachToProcessEnv: true,
    expandSecretReferences: true,
    includeImports: true,
  })

  loaded = true
  console.log("[infisical] Secrets loaded into process.env")
}
