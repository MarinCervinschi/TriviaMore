import { createServerFn } from "@tanstack/react-start";

import { classYearsSchema } from "../schemas";
import { getAvailableClassYears } from "../service/classes";

export const getAvailableClassYearsFn = createServerFn({ method: "GET" })
	.inputValidator(classYearsSchema)
	.handler(({ data }) => getAvailableClassYears(data));
