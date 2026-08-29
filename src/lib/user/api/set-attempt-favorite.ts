import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { attemptFavoriteSchema } from "../schemas";
import { setAttemptFavorite } from "../service/attempt-history";

export const setAttemptFavoriteFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(attemptFavoriteSchema)
	.handler(({ data, context }) =>
		setAttemptFavorite(context.user.id, data.attemptId, data.isFavorite)
	);
