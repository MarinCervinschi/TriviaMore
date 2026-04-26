import { loadSecrets } from "../src/lib/secrets/server"
import { generateSitemap } from "./lib/sitemap"

await loadSecrets()

await generateSitemap().catch((err) => {
  console.error("Failed to generate sitemap:", err)
  process.exit(1)
})
