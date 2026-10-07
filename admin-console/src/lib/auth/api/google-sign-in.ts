import { createServerFn } from "@tanstack/react-start";

import { googleSignInUrl } from "../service";

export const googleSignInFn = createServerFn({ method: "POST" }).handler(() =>
	googleSignInUrl()
);
