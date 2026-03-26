import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server"
import type { Register } from "@tanstack/react-router"
import type { RequestHandler } from "@tanstack/react-start/server"
import { loadSecrets } from "./lib/secrets/server"

const fetch = createStartHandler(defaultStreamHandler)

// Load secrets once on first request (prod: Infisical SDK, dev: skipped)
let secretsPromise: Promise<void> | null = null

export type ServerEntry = { fetch: RequestHandler<Register> }

export function createServerEntry(entry: ServerEntry): ServerEntry {
  return {
    async fetch(...args) {
      if (!secretsPromise) {
        secretsPromise = loadSecrets()
      }
      await secretsPromise
      return await entry.fetch(...args)
    },
  }
}

export default createServerEntry({ fetch })
