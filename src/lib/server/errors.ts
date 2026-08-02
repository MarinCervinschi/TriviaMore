// Errors that are safe to show to the user. Anything else that escapes a
// handler is replaced with a generic message by the error middleware, so a
// Postgres error never reaches the browser.

export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID"

export class AppError extends Error {
  readonly code: AppErrorCode

  constructor(code: AppErrorCode, message: string) {
    super(message)
    this.name = "AppError"
    this.code = code
  }
}

export class Unauthorized extends AppError {
  constructor(message = "Non autenticato") {
    super("UNAUTHORIZED", message)
  }
}

export class Forbidden extends AppError {
  constructor(message = "Non hai i permessi per questa operazione") {
    super("FORBIDDEN", message)
  }
}

export class NotFound extends AppError {
  constructor(message = "Risorsa non trovata") {
    super("NOT_FOUND", message)
  }
}

export class Conflict extends AppError {
  constructor(message: string) {
    super("CONFLICT", message)
  }
}

// Input that passed validation at the edge but is not usable — a stored jsonb
// payload that no longer matches its schema, for instance.
export class Invalid extends AppError {
  constructor(message: string) {
    super("INVALID", message)
  }
}
