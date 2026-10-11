import { createServerFn } from "@tanstack/react-start";

import { getConsoleAccount } from "../service";

export const getSessionFn = createServerFn({ method: "GET" }).handler(() =>
	getConsoleAccount()
);
