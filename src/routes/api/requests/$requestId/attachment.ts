import { createFileRoute, isRedirect } from "@tanstack/react-router";
import { z } from "zod";

import { readAttachment } from "@/lib/requests/service/admin-requests";
import { AppError, type AppErrorCode } from "@/lib/server/errors";

const STATUS: Partial<Record<AppErrorCode, number>> = {
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	INVALID: 400,
};

// A route rather than a server function, because the bytes stream from the private bucket, which the browser cannot reach.
export const Route = createFileRoute("/api/requests/$requestId/attachment")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				if (!z.uuid().safeParse(params.requestId).success) {
					return new Response("Proposta non trovata", { status: 404 });
				}
				try {
					const file = await readAttachment(params.requestId);
					return new Response(file.body, {
						headers: {
							"content-type": file.contentType,
							"content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
							"cache-control": "private, no-store",
						},
					});
				} catch (error) {
					if (isRedirect(error))
						return new Response("Non autorizzato", { status: 401 });
					if (error instanceof AppError) {
						return new Response(error.message, { status: STATUS[error.code] ?? 500 });
					}
					throw error;
				}
			},
		},
	},
});
