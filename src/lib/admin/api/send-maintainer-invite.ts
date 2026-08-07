import { createServerFn } from "@tanstack/react-start";

import { maintainerInviteSchema } from "../schemas";
import { sendMaintainerInvite } from "../service/users";

export const sendMaintainerInviteFn = createServerFn({ method: "POST" })
	.inputValidator(maintainerInviteSchema)
	.handler(({ data }) => sendMaintainerInvite(data));
