import { createServerFn } from "@tanstack/react-start";

import { searchClassesSchema } from "../schemas";
import { searchClasses } from "../service/classes";

export const searchClassesFn = createServerFn({ method: "GET" })
	.inputValidator(searchClassesSchema)
	.handler(({ data }) => searchClasses(data));
