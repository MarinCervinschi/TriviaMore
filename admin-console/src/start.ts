import { createStart } from "@tanstack/react-start";

import { errorMiddleware } from "@/lib/server/middleware/errors";
import {
	observabilityMiddleware,
	serverFnObservabilityMiddleware,
} from "@/lib/server/middleware/observability";

import { accessMiddleware } from "~/lib/access/middleware";

export const startInstance = createStart(() => ({
	requestMiddleware: [observabilityMiddleware, accessMiddleware],
	functionMiddleware: [serverFnObservabilityMiddleware, errorMiddleware],
}));
