/** A built console is the deployed one, and the deployed one works on production; the worker runs outside Vite. */
export const IS_PRODUCTION =
	import.meta.env?.PROD ?? process.env.NODE_ENV === "production";

export const ENVIRONMENT_LABEL = IS_PRODUCTION ? "Produzione" : "Locale";

/** Where a job's writes land, for the copy: "Scrive le modifiche …". */
export const ENVIRONMENT_TARGET = IS_PRODUCTION
	? "in produzione"
	: "nel database locale";
