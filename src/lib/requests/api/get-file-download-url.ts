import { createServerFn } from "@tanstack/react-start"

import { adminMiddleware } from "@/lib/server/middleware/auth"
import { errorMiddleware } from "@/lib/server/middleware/errors"

import { fileDownloadSchema } from "../schemas"
import { getFileDownloadUrl } from "../service/admin-requests"

export const getFileDownloadUrlFn = createServerFn({ method: "GET" })
  .middleware([errorMiddleware, adminMiddleware])
  .inputValidator(fileDownloadSchema)
  .handler(({ data }) => getFileDownloadUrl(data.filePath))
