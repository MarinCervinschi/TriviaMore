/** Errors whose message is safe to show the user. */

export type AppErrorCode =
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "CONFLICT"
	| "INVALID"
	| "UNAVAILABLE";

export class AppError extends Error {
	readonly code: AppErrorCode;

	constructor(code: AppErrorCode, message: string) {
		super(message);
		this.name = "AppError";
		this.code = code;
	}
}

export class Unauthorized extends AppError {
	constructor(message = "Non autenticato") {
		super("UNAUTHORIZED", message);
	}
}

export class Forbidden extends AppError {
	constructor(message = "Non hai i permessi per questa operazione") {
		super("FORBIDDEN", message);
	}
}

export class NotFound extends AppError {
	constructor(message = "Risorsa non trovata") {
		super("NOT_FOUND", message);
	}
}

export class Conflict extends AppError {
	constructor(message: string) {
		super("CONFLICT", message);
	}
}

export class Invalid extends AppError {
	constructor(message: string) {
		super("INVALID", message);
	}
}

export class Unavailable extends AppError {
	constructor(message: string) {
		super("UNAVAILABLE", message);
	}
}

export function rethrowUniqueViolation(error: unknown, message: string): never {
	const code =
		typeof error === "object" && error !== null
			? (error as { code?: unknown }).code
			: undefined;
	if (code === "23505") throw new Conflict(message);
	throw error;
}
