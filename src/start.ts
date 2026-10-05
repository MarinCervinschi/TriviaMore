import { createStart } from "@tanstack/react-start";

import { errorMiddleware } from "@/lib/server/middleware/errors";
import {
	observabilityMiddleware,
	serverFnObservabilityMiddleware,
} from "@/lib/server/middleware/observability";

export const startInstance = createStart(() => ({
	requestMiddleware: [observabilityMiddleware],
	functionMiddleware: [serverFnObservabilityMiddleware, errorMiddleware],
}));
