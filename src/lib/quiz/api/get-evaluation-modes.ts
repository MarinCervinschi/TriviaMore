import { createServerFn } from "@tanstack/react-start";
import { asc } from "drizzle-orm";

import { getDb } from "@/db";
import { evaluationModes } from "@/db/schema";

import { evaluationModeColumns } from "../columns";
import type { EvaluationMode } from "../types";

export const getEvaluationModesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<EvaluationMode[]> =>
		getDb()
			.select(evaluationModeColumns)
			.from(evaluationModes)
			.orderBy(asc(evaluationModes.name))
);
