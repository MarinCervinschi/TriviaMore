import { createStart } from "@tanstack/react-start";

import { cacheControlMiddleware } from "@/lib/server/middleware/cache-control";
import { errorMiddleware } from "@/lib/server/middleware/errors";
import {
	observabilityMiddleware,
	serverFnObservabilityMiddleware,
} from "@/lib/server/middleware/observability";

export const startInstance = createStart(() => ({
	requestMiddleware: [cacheControlMiddleware, observabilityMiddleware],
	functionMiddleware: [serverFnObservabilityMiddleware, errorMiddleware],
}));
