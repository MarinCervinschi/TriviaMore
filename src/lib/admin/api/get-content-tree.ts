import { createServerFn } from "@tanstack/react-start";

import { getContentTree } from "../service/dashboard";

export const getContentTreeFn = createServerFn({ method: "GET" }).handler(() =>
	getContentTree()
);
