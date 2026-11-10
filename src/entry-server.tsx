import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

import { verifyRateLimits } from "@/lib/server/rate-limits";

void verifyRateLimits();

export default { fetch: createStartHandler(defaultStreamHandler) };
