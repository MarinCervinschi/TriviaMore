import { createServerFn } from "@tanstack/react-start";

import { idSchema } from "../schemas";
import { deleteSection } from "../service/sections";

export const deleteSectionFn = createServerFn({ method: "POST" })
	.inputValidator(idSchema)
	.handler(({ data }) => deleteSection(data.id));
