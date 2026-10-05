import { isNotFound, isRedirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";

import { currentContext } from "@/lib/logging/context";
import { log } from "@/lib/logging/server";

import { AppError } from "../errors";

// An AppError passes through; anything else is logged and replaced, because its message ends up in a toast.
export const errorMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		try {
			return await next();
		} catch (err) {
			if (isRedirect(err) || isNotFound(err)) throw err;

			const context = currentContext();

			// An AppError is an expected outcome, so it never reaches Error level.
			if (err instanceof AppError) {
				if (context) {
					context.outcome = "rejected";
					context.errorCode = err.code;
				}
				throw err;
			}

			if (context) context.outcome = "failed";
			log.error("Unhandled error in {Fn}", { Fn: context?.fn ?? "unknown" }, err);

			const reference = context?.traceId.slice(0, 8);
			throw new Error(
				reference
					? `Si è verificato un errore. Riprova più tardi. (rif. ${reference})`
					: "Si è verificato un errore. Riprova più tardi."
			);
		}
	}
);
