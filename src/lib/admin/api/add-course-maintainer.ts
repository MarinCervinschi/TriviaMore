import { createServerFn } from "@tanstack/react-start";

import { courseMaintainerSchema } from "../schemas";
import { addCourseMaintainer } from "../service/users";

export const addCourseMaintainerFn = createServerFn({ method: "POST" })
	.inputValidator(courseMaintainerSchema)
	.handler(({ data }) => addCourseMaintainer(data));
