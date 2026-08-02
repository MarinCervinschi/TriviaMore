import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { superadminMiddleware } from "@/lib/server/middleware/auth"

import { getAcceptanceHistory } from "../service"

export const getAcceptanceHistoryFn = createServerFn({ method: "GET" })
  .middleware([superadminMiddleware])
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(({ data }) => getAcceptanceHistory(data.userId))
