import { createMiddleware } from "@tanstack/react-start"

import { createContext, currentContext, runWithContext } from "@/lib/logging/context"
import { log } from "@/lib/logging/server"

// One canonical event per request, carrying everything needed to answer "what
// happened and how long did it take" — instead of a handful of scattered lines
// that have to be stitched back together in Seq. Server functions arrive as
// requests too, so this covers both them and page renders, and the trace it
// opens is what every nested log call and every database query attaches to.

const ASSET_PATTERN = /\.(js|mjs|css|map|ico|png|jpe?g|gif|svg|webp|avif|woff2?)$/i

const SERVER_FN_BASE = process.env.TSS_SERVER_FN_BASE ?? "/_serverFn/"

function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_build/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/@") ||
    ASSET_PATTERN.test(pathname)
  )
}

function levelFor(status: number): "info" | "warn" | "error" {
  if (status >= 500) return "error"
  if (status >= 400) return "warn"
  return "info"
}

export const observabilityMiddleware = createMiddleware({ type: "request" }).server(
  async ({ pathname, request, next }) => {
    if (isAsset(pathname)) return next()

    const context = createContext({
      source: pathname.startsWith(SERVER_FN_BASE) ? "fn" : "ssr",
      path: pathname,
    })

    return runWithContext(context, async () => {
      const startedAt = performance.now()
      let status = 500

      try {
        const result = await next()
        status = result.response.status
        // Lets a browser-side report name the exact request it came from.
        // Some responses carry immutable headers, and a log line is never
        // worth failing a request over.
        try {
          result.response.headers.set("x-request-id", context.traceId)
        } catch {
          /* empty */
        }
        return result
      } finally {
        const elapsed = performance.now() - startedAt
        const properties = {
          Method: request.method,
          Path: pathname,
          Status: status,
          Elapsed: elapsed,
          Outcome: context.outcome ?? (status < 400 ? "ok" : "error"),
          ...(context.fn ? { Fn: context.fn } : {}),
          ...(context.errorCode ? { ErrorCode: context.errorCode } : {}),
          DbQueries: context.dbQueries,
          DbMs: context.dbMs,
          AuthChecks: context.authChecks,
          AuthMs: context.authMs,
          AppMs: Math.max(0, elapsed - context.dbMs - context.authMs),
        }

        // Two templates rather than one, so Seq groups server function calls
        // and page renders as distinct event types.
        log[levelFor(status)](
          context.fn
            ? "{Fn} → {Outcome} in {Elapsed:0.0}ms"
            : "{Method} {Path} → {Status} in {Elapsed:0.0}ms",
          properties,
        )
      }
    })
  },
)

export const serverFnObservabilityMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next, serverFnMeta }) => {
    const context = currentContext()

    if (context?.source === "fn") {
      if (!context.fn && serverFnMeta.name) context.fn = serverFnMeta.name
      return next()
    }

    const startedAt = performance.now()
    try {
      return await next()
    } finally {
      log.debug("{Fn} ran in {Elapsed:0.0}ms during the render", {
        Fn: serverFnMeta.name || serverFnMeta.id,
        Elapsed: performance.now() - startedAt,
      })
    }
  },
)
