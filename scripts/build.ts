import { spawn } from "node:child_process"
import { loadSecrets } from "../src/lib/secrets/server"
import { generateSitemap } from "./lib/sitemap"

await loadSecrets()
await generateSitemap()

const child = spawn("vite", ["build"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
})

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exit(code ?? 0)
})
