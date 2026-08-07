import { createServerFn } from "@tanstack/react-start";

import { getPrivateSections } from "../service/users";

export const getPrivateSectionsFn = createServerFn({ method: "GET" }).handler(() =>
	getPrivateSections()
);
