import { createServerFn } from "@tanstack/react-start"
import { asc } from "drizzle-orm"

import { getDb } from "@/db"
import { evaluationModes } from "@/db/schema"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { evaluationModeColumns } from "../columns"
import type { EvaluationMode } from "../types"

export const getEvaluationModesFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware])
  .handler(
    async (): Promise<EvaluationMode[]> =>
      getDb()
        .select(evaluationModeColumns)
        .from(evaluationModes)
        .orderBy(asc(evaluationModes.name)),
  )
