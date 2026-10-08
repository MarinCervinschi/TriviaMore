import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { careerSettingsSchema } from "../schemas";
import { updateCareerSettings } from "../service/career";

export const updateCareerSettingsFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(careerSettingsSchema)
	.handler(({ data, context }) => updateCareerSettings(context.user.id, data));
