import { createStart } from "@tanstack/react-start"

import { errorMiddleware } from "@/lib/server/middleware/errors"

// Applied to every server function. Registering it per endpoint was only
// necessary while unmigrated domains still threw plain Errors carrying a message
// meant for the toast — this middleware would have masked them.
export const startInstance = createStart(() => ({
  functionMiddleware: [errorMiddleware],
}))
