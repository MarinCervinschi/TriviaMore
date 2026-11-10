import { beforeEach, describe, expect, it, vi } from "vitest";

import { currentContext } from "@/lib/logging/context";

import { observabilityMiddleware } from "./observability";

const { logSpan } = vi.hoisted(() => ({ logSpan: vi.fn() }));

vi.mock("@/lib/logging/server", () => ({
	log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
	logSpan,
}));

const SEGMENT = "DummyLink0000000000000A";

async function run(pathname: string, status = 302) {
	let contextPath: string | undefined;
	await observabilityMiddleware.options.server!({
		pathname,
		request: new Request(`http://localhost${pathname}`),
		context: {},
		next: async () => {
			contextPath = currentContext()?.path;
			return { response: new Response(null, { status }) };
		},
	} as never);
	return { contextPath };
}

function spanProperties(): Record<string, unknown> {
	expect(logSpan).toHaveBeenCalledTimes(1);
	return logSpan.mock.calls[0]![0].properties as Record<string, unknown>;
}

describe("observabilityMiddleware", () => {
	beforeEach(() => {
		logSpan.mockClear();
	});

	it.each([
		`/api/auth/reset-password/${SEGMENT}`,
		`/api/auth/reset-password/${SEGMENT}/`,
		`/API/AUTH/Reset-Password/${SEGMENT}`,
		`//api/auth/reset-password/${SEGMENT}`,
	])("never logs the reset link's segment in %s", async pathname => {
		const { contextPath } = await run(pathname);

		expect(JSON.stringify(logSpan.mock.calls)).not.toContain(SEGMENT);
		expect(contextPath).not.toContain(SEGMENT);
	});

	it("logs the reset callback under a fixed path", async () => {
		const { contextPath } = await run(`/api/auth/reset-password/${SEGMENT}`);

		expect(spanProperties().Path).toBe("/api/auth/reset-password/:token");
		expect(contextPath).toBe("/api/auth/reset-password/:token");
	});

	it("logs every other path as it is", async () => {
		await run("/browse/ingegneria/informatica", 200);

		expect(spanProperties().Path).toBe("/browse/ingegneria/informatica");
	});
});
