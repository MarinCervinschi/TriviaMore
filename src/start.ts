import { createStart } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"
import {
  observabilityMiddleware,
  serverFnObservabilityMiddleware,
} from "@/lib/server/middleware/observability"

// `observabilityMiddleware` is a request middleware, so it wraps page renders
// as well as server functions — including the ones a page calls during SSR,
// which end up sharing its trace.
//
// `errorMiddleware` is applied to every server function. Registering it per
// endpoint was only necessary while unmigrated domains still threw plain Errors
// carrying a message meant for the toast — this middleware would have masked them.
export const startInstance = createStart(() => ({
  requestMiddleware: [observabilityMiddleware],
  functionMiddleware: [serverFnObservabilityMiddleware, errorMiddleware],
}))
