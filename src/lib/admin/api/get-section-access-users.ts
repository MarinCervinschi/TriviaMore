import { createServerFn } from "@tanstack/react-start";

import { sectionIdSchema } from "../schemas";
import { getSectionAccessUsers } from "../service/users";

export const getSectionAccessUsersFn = createServerFn({ method: "GET" })
	.inputValidator(sectionIdSchema)
	.handler(({ data }) => getSectionAccessUsers(data.section_id));
