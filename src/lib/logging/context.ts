import { AsyncLocalStorage } from "node:async_hooks"

// Ambient per-request state, so a log call anywhere in the stack inherits the
// trace without a logger being threaded through service and db functions —
// which would force a logger argument onto `db/` functions whose whole contract
// is `(db: DbOrTx, …)`.

export type LogSource = "ssr" | "fn" | "job" | "browser"

export type RequestContext = {
  traceId: string
  source: LogSource
  path: string
  fn?: string
  userId?: string
  // Accumulated by the pool wrapper in src/db/index.ts and read once by the
  // canonical line, which is why these are mutable rather than returned.
  dbQueries: number
  dbMs: number
  outcome?: string
  errorCode?: string
}

const storage = new AsyncLocalStorage<RequestContext>()

// W3C trace-id shape (32 lowercase hex), so the same value maps onto OTLP
// unchanged if the shipper is ever swapped for an OTel exporter.
export function newTraceId(): string {
  return crypto.randomUUID().replaceAll("-", "")
}

export function createContext(init: Pick<RequestContext, "source" | "path"> & Partial<RequestContext>): RequestContext {
  return { traceId: newTraceId(), dbQueries: 0, dbMs: 0, ...init }
}

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn)
}

export function currentContext(): RequestContext | undefined {
  return storage.getStore()
}

export function attachUser(userId: string): void {
  const context = storage.getStore()
  if (context) context.userId = userId
}
