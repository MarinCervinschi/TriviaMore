import { describe, expect, it } from "vitest";

import { type LogEvent, toClef } from "./clef";

function base(): LogEvent {
	return {
		timestamp: "2026-08-26T10:00:00.000Z",
		level: "Information",
		template: "{Method} {Path} → {Status} in {Elapsed:0.0}ms",
		properties: { Method: "GET", Path: "/browse", Status: 200 },
	};
}

function parse(event: LogEvent): Record<string, unknown> {
	return JSON.parse(toClef(event)) as Record<string, unknown>;
}

describe("toClef", () => {
	it("carries the span fields Seq builds its trace tree from", () => {
		const payload = parse({
			...base(),
			traceId: "0123456789abcdef0123456789abcdef",
			spanId: "0123456789abcdef",
			parentSpanId: "fedcba9876543210",
			startTimestamp: "2026-08-26T09:59:59.660Z",
			spanKind: "Server",
		});

		expect(payload["@tr"]).toBe("0123456789abcdef0123456789abcdef");
		expect(payload["@sp"]).toBe("0123456789abcdef");
		expect(payload["@ps"]).toBe("fedcba9876543210");
		expect(payload["@st"]).toBe("2026-08-26T09:59:59.660Z");
		expect(payload["@sk"]).toBe("Server");
	});

	it("omits every span field it was not given", () => {
		const payload = parse(base());

		for (const key of ["@sp", "@ps", "@st", "@sk", "@tr"]) {
			expect(payload).not.toHaveProperty(key);
		}
	});

	// A log line attached to a span carries `@sp` but no `@st`: it is an event
	// inside the span, not a span of its own.
	it("distinguishes an attached log line from a span", () => {
		const payload = parse({ ...base(), spanId: "0123456789abcdef" });

		expect(payload["@sp"]).toBe("0123456789abcdef");
		expect(payload).not.toHaveProperty("@st");
	});

	it("still redacts by property name", () => {
		const payload = parse({
			...base(),
			properties: { UserEmail: "someone@unimore.it", Count: 3 },
		});

		expect(payload.UserEmail).toBe("[redacted]");
		expect(payload.Count).toBe(3);
	});

	it("escapes a property whose own name starts with @", () => {
		const payload = parse({ ...base(), properties: { "@weird": "value" } });

		expect(payload["@@weird"]).toBe("value");
	});
});
