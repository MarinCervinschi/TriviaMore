import { createServerFn } from "@tanstack/react-start";

import { idSchema } from "../schemas";
import { getAdminQuestionDetail } from "../service/questions";

export const getAdminQuestionDetailFn = createServerFn({ method: "GET" })
	.inputValidator(idSchema)
	.handler(({ data }) => getAdminQuestionDetail(data.id));
