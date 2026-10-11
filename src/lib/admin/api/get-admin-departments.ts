import { createServerFn } from "@tanstack/react-start";

import { getAdminDepartments } from "../service/departments";

// The service applies the role guard, because it redirects instead of failing.
export const getAdminDepartmentsFn = createServerFn({ method: "GET" }).handler(() =>
	getAdminDepartments()
);
