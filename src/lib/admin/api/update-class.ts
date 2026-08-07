import { createServerFn } from "@tanstack/react-start";

import { idSchema, updateClassSchema } from "../schemas";
import { updateClass } from "../service/classes";

export const updateClassFn = createServerFn({ method: "POST" })
	.inputValidator(idSchema.merge(updateClassSchema))
	.handler(({ data: { id, ...updates } }) => updateClass(id, updates));
