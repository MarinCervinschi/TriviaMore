import { createServerFn } from "@tanstack/react-start";

import { oauthProviderSchema } from "../schemas";
import { socialSignInUrl } from "../service";

export const oauthSignInFn = createServerFn({ method: "POST" })
	.inputValidator(oauthProviderSchema)
	.handler(({ data }) => socialSignInUrl(data.provider));
