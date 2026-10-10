import { createStart } from "@tanstack/react-start";

import { accessMiddleware } from "~/lib/access/middleware";

export const startInstance = createStart(() => ({
	requestMiddleware: [accessMiddleware],
}));
