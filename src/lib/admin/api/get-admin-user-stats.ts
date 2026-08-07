import { createServerFn } from "@tanstack/react-start";

import { getAdminUserStats } from "../service/users";

export const getAdminUserStatsFn = createServerFn({ method: "GET" }).handler(() =>
	getAdminUserStats()
);
