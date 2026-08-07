import { createServerFn } from "@tanstack/react-start";

import { getAdminPermissions } from "../service/dashboard";

export const getAdminPermissionsFn = createServerFn({ method: "GET" }).handler(() =>
	getAdminPermissions()
);
