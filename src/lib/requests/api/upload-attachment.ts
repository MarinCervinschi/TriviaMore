import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/lib/server/middleware/auth";

import { attachmentFileSchema } from "../schemas";
import { uploadAttachment } from "../service/user-requests";

export const uploadAttachmentFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(attachmentFileSchema)
	.handler(({ data, context }) => uploadAttachment(context.user.id, data.file));
