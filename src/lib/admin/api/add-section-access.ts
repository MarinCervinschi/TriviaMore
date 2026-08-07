import { createServerFn } from "@tanstack/react-start";

import { sectionAccessSchema } from "../schemas";
import { addSectionAccess } from "../service/users";

export const addSectionAccessFn = createServerFn({ method: "POST" })
	.inputValidator(sectionAccessSchema)
	.handler(({ data }) => addSectionAccess(data));
