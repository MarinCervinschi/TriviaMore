import { createServerFn } from "@tanstack/react-start";

import { sectionSchema } from "../schemas";
import { createSection } from "../service/sections";

export const createSectionFn = createServerFn({ method: "POST" })
	.inputValidator(sectionSchema)
	.handler(({ data }) => createSection(data));
