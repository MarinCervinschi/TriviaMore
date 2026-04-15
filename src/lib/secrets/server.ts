import { InfisicalSDK } from "@infisical/sdk";

let loaded = false;

export async function loadSecrets() {
  if (loaded) return;

  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
  const projectId = process.env.INFISICAL_PROJECT_ID;
  const siteUrl = process.env.INFISICAL_SITE_URL;

  if (!clientId || !clientSecret || !projectId || !siteUrl) {
    console.warn("[infisical] Missing credentials, skipping secrets load.");
    return;
  }

  try {
    const client = new InfisicalSDK({
      siteUrl: process.env.INFISICAL_SITE_URL,
    });

    await client.auth().universalAuth.login({ clientId, clientSecret });

    await client.secrets().listSecrets({
      projectId,
      environment: process.env.INFISICAL_ENV ?? "prod",
      attachToProcessEnv: true,
      expandSecretReferences: true,
      includeImports: true,
    });

    loaded = true;
    console.log("[infisical] Secrets loaded into process.env");
  } catch (err) {
    console.error("[infisical] Failed to load secrets:", err);
    throw err;
  }
}
