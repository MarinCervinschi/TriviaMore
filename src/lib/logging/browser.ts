// The only logging entry point a component may import: it reaches nothing
// server-side. It POSTs to `/api/log`, which proxies to Seq.

type LogProperties = Record<string, string | number | boolean | null>

type ReportOptions = {
  level?: "Warning" | "Error"
  properties?: LogProperties
  traceId?: string
}

const ENDPOINT = "/api/log"
const MAX_ERROR_CHARS = 4_000
const DEDUPE_MS = 5_000
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20

let sentTimes: number[] = []
const recentSignatures = new Map<string, number>()
let reporting = false
let installed = false

function formatError(error: unknown): string | undefined {
  if (error === undefined || error === null) return undefined
  const text =
    error instanceof Error
      ? (error.stack ?? `${error.name}: ${error.message}`)
      : String(error)
  return text.length > MAX_ERROR_CHARS ? `${text.slice(0, MAX_ERROR_CHARS)}…` : text
}

function throttled(signature: string, now: number): boolean {
  const lastSeen = recentSignatures.get(signature)
  if (lastSeen !== undefined && now - lastSeen < DEDUPE_MS) return true

  sentTimes = sentTimes.filter((t) => now - t < WINDOW_MS)
  if (sentTimes.length >= MAX_PER_WINDOW) return true

  if (recentSignatures.size > 100) {
    for (const [key, t] of recentSignatures) {
      if (now - t >= WINDOW_MS) recentSignatures.delete(key)
    }
  }
  recentSignatures.set(signature, now)
  sentTimes.push(now)
  return false
}

export function reportBrowserError(
  template: string,
  error: unknown,
  options: ReportOptions = {},
): void {
  if (typeof window === "undefined" || reporting) return

  reporting = true
  try {
    const errorText = formatError(error)
    const signature = `${template}|${errorText ?? ""}`
    if (throttled(signature, Date.now())) return

    const event = {
      level: options.level ?? "Error",
      template,
      ...(options.properties ? { properties: options.properties } : {}),
      ...(errorText ? { error: errorText } : {}),
      ...(options.traceId ? { traceId: options.traceId } : {}),
    }

    // keepalive lets the POST survive the unload that an unhandled error precedes.
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: [event] }),
      keepalive: true,
      credentials: "omit",
    }).catch(() => {})
  } catch {
    // A reporter that throws would be worse than a lost log line.
  } finally {
    reporting = false
  }
}

export function installBrowserErrorHandlers(): void {
  if (installed || typeof window === "undefined") return
  installed = true

  window.addEventListener("error", (event) => {
    // Resource-load failures dispatch a plain Event with no stack worth sending.
    if (!(event instanceof ErrorEvent)) return
    if (event.message === "Script error.") return
    reportBrowserError("Unhandled browser error", event.error ?? event.message, {
      properties: { Path: window.location.pathname },
    })
  })

  window.addEventListener("unhandledrejection", (event) => {
    reportBrowserError("Unhandled promise rejection", event.reason, {
      properties: { Path: window.location.pathname },
    })
  })
}
