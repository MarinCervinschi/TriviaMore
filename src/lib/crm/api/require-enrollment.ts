import { createServerFn } from "@tanstack/react-start";

import { requireEnrollment } from "../guards";

export const requireEnrollmentFn = createServerFn({ method: "GET" }).handler(() =>
	requireEnrollment()
);
