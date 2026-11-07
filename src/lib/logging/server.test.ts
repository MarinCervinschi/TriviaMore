import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { LogEvent } from "./clef";
import { browserLogBatch } from "./schemas";

const { ship } = vi.hoisted(() => ({ ship: vi.fn() }));

vi.mock("./shipper", () => ({ ship }));

let shipBrowserEvent: typeof import("./server").shipBrowserEvent;

function shipped(): LogEvent {
	expect(ship).toHaveBeenCalledTimes(1);
	return ship.mock.calls[0]![0] as LogEvent;
}

function batchWith(properties: Record<string, string | number>) {
	return { events: [{ level: "Warning", template: "Mutation failed", properties }] };
}

describe("shipBrowserEvent", () => {
	beforeAll(async () => {
		vi.stubEnv("APP_VERSION", "release-sha");
		vi.stubEnv("LOG_LEVEL", "info");
		({ shipBrowserEvent } = await import("./server"));
	});

	beforeEach(() => {
		ship.mockClear();
	});

	it("stamps Source and Version over the client's own", () => {
		shipBrowserEvent({
			level: "Warning",
			template: "{Fn} → {Outcome}",
			properties: { Source: "fn", Version: "forged", Path: "/quiz" },
		});

		const { properties } = shipped();
		expect(properties.Source).toBe("browser");
		expect(properties.Version).toBe("release-sha");
		expect(properties.Path).toBe("/quiz");
	});
});

describe("browserLogBatch", () => {
	it("accepts the properties the client sends", () => {
		const parsed = browserLogBatch.safeParse(
			batchWith({ Path: "/quiz", Mutation: '["quiz","start"]' })
		);

		expect(parsed.success).toBe(true);
	});

	it.each([
		"Source",
		"Version",
		"UserId",
		"Fn",
		"Outcome",
		"Status",
		"ErrorCode",
		"Environment",
		"Application",
		"source",
		"USERID",
	])("rejects the reserved property %s", name => {
		const parsed = browserLogBatch.safeParse(batchWith({ Path: "/quiz", [name]: "x" }));

		expect(parsed.success).toBe(false);
	});
});
