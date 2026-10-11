import { createServerFn } from "@tanstack/react-start";

import { getAdminRequests } from "../service/admin-requests";

// The service applies the admin guard, because it also computes the maintainer scope.
export const getAdminRequestsFn = createServerFn({ method: "GET" }).handler(() =>
	getAdminRequests()
);
