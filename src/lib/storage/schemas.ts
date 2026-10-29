import { z } from "zod";

/** The `file` field of a FormData, the only way bytes reach a server function. */
export function formFileSchema(maxBytes: number, tooLarge: string) {
	return z.instanceof(FormData).transform((form, ctx) => {
		const file = form.get("file");
		if (!(file instanceof File) || file.size === 0) {
			ctx.addIssue({ code: "custom", message: "Nessun file ricevuto." });
			return z.NEVER;
		}
		if (file.size > maxBytes) {
			ctx.addIssue({ code: "custom", message: tooLarge });
			return z.NEVER;
		}
		return { file };
	});
}
