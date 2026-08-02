import { createMiddleware } from "@tanstack/react-start"
import { isNotFound, isRedirect } from "@tanstack/react-router"

import { currentContext } from "@/lib/logging/context"
import { log } from "@/lib/logging/server"
import { AppError } from "../errors"

// An AppError carries a message written for the user and passes through as-is.
// Anything else is a bug or a database failure: it is logged with its stack and
// replaced with a generic message, because `error.message` ends up in a toast
// and a Postgres error string has no business being there.
//
// The outcome is recorded on the request context rather than logged here, so it
// lands on the canonical line instead of adding a second event per failure. The
// user gets the head of the trace id, which is what turns "non funziona" into a
// single Seq lookup.
export const errorMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    try {
      return await next()
    } catch (err) {
      // Redirects and notFound() are control flow, not failures.
      if (isRedirect(err) || isNotFound(err)) throw err

      const context = currentContext()

      // An AppError is an expected outcome — a rejected request, not a broken
      // one — so it never reaches Error level.
      if (err instanceof AppError) {
        if (context) {
          context.outcome = "rejected"
          context.errorCode = err.code
        }
        throw err
      }

      if (context) context.outcome = "failed"
      log.error("Unhandled error in {Fn}", { Fn: context?.fn ?? "unknown" }, err)

      const reference = context?.traceId.slice(0, 8)
      throw new Error(
        reference
          ? `Si è verificato un errore. Riprova più tardi. (rif. ${reference})`
          : "Si è verificato un errore. Riprova più tardi.",
      )
    }
  },
)
