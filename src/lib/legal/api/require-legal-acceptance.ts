import { createServerFn } from "@tanstack/react-start";

import { requireLegalAcceptance } from "../guards";

export const requireLegalAcceptanceFn = createServerFn({ method: "GET" }).handler(() =>
	requireLegalAcceptance()
);
