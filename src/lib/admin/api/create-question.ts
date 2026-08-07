import { createServerFn } from "@tanstack/react-start";

import { questionSchema } from "../schemas";
import { createQuestion } from "../service/questions";

export const createQuestionFn = createServerFn({ method: "POST" })
	.inputValidator(questionSchema)
	.handler(({ data }) => createQuestion(data));
