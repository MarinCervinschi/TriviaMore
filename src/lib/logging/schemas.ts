import { z } from "zod";

const browserLevel = z.enum(["Warning", "Error"]);

const propertyValue = z.union([
	z.string().max(1_000),
	z.number(),
	z.boolean(),
	z.null(),
]);

const browserEvent = z.object({
	level: browserLevel,
	template: z.string().min(1).max(300),
	properties: z
		.record(z.string().max(40), propertyValue)
		.refine(props => Object.keys(props).length <= 20, "too many properties")
		.optional(),
	error: z.string().max(4_000).optional(),
	traceId: z
		.string()
		.regex(/^[0-9a-f]{32}$/)
		.optional(),
});

export const browserLogBatch = z.object({
	events: z.array(browserEvent).min(1).max(10),
});

export type BrowserLogEvent = z.infer<typeof browserEvent>;
