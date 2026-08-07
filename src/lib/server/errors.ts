// Errors that are safe to show to the user. Anything else that escapes a
// handler is replaced with a generic message by the error middleware, so a
// Postgres error never reaches the browser.

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

// Input that passed validation at the edge but is not usable — a stored jsonb
// payload that no longer matches its schema, for instance.
export class Invalid extends AppError {
	constructor(message: string) {
		super("INVALID", message);
	}
}

// A dependency outside the database refused the operation — a mail server, the
// auth API. The user can retry, so the message says so rather than being masked.
export class Unavailable extends AppError {
	constructor(message: string) {
		super("UNAVAILABLE", message);
	}
}

// Unique-constraint violations are the one Postgres error the admin catalog can
// explain to the user: a code is already taken. Everything else is re-thrown
// untouched, so the error middleware masks it.
export function rethrowUniqueViolation(error: unknown, message: string): never {
	const code =
		typeof error === "object" && error !== null
			? (error as { code?: unknown }).code
			: undefined;
	if (code === "23505") throw new Conflict(message);
	throw error;
}
