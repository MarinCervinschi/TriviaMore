import { createMiddleware } from "@tanstack/react-start"
import { isNotFound, isRedirect } from "@tanstack/react-router"

import { AppError } from "../errors"

// An AppError carries a message written for the user and passes through as-is.
// Anything else is a bug or a database failure: it is logged with its stack and
// replaced with a generic message, because `error.message` ends up in a toast
// and a Postgres error string has no business being there.
export const errorMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    try {
      return await next()
    } catch (err) {
      // Redirects and notFound() are control flow, not failures.
      if (isRedirect(err) || isNotFound(err)) throw err
      if (err instanceof AppError) throw err

      console.error("[serverFn] unhandled error:", err)
      throw new Error("Si è verificato un errore. Riprova più tardi.")
    }
  },
)
