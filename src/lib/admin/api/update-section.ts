import { createServerFn } from "@tanstack/react-start";

import { idSchema, updateSectionSchema } from "../schemas";
import { updateSection } from "../service/sections";

export const updateSectionFn = createServerFn({ method: "POST" })
	.inputValidator(idSchema.merge(updateSectionSchema))
	.handler(({ data: { id, ...updates } }) => updateSection(id, updates));
