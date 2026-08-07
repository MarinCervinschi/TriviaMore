import { createServerFn } from "@tanstack/react-start";

import { idSchema } from "../schemas";
import { deleteQuestion } from "../service/questions";

export const deleteQuestionFn = createServerFn({ method: "POST" })
	.inputValidator(idSchema)
	.handler(({ data }) => deleteQuestion(data.id));
