import { createServerFn } from "@tanstack/react-start";

import { getConsoleSession } from "../service";

export const getSessionFn = createServerFn({ method: "GET" }).handler(() =>
	getConsoleSession()
);
