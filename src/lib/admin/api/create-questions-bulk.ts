import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { questionSchema } from "../schemas";
import { createQuestionsBulk } from "../service/questions";

export const createQuestionsBulkFn = createServerFn({ method: "POST" })
	.inputValidator(z.array(questionSchema))
	.handler(({ data }) => createQuestionsBulk(data));
