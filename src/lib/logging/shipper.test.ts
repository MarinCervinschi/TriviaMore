import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LogEvent } from "./clef";

const MAX_BATCH_BYTES = 256_000;

let fetchMock: ReturnType<typeof vi.fn>;

function event(n: number, size: "big" | "small"): LogEvent {
	const properties: Record<string, unknown> = { N: n };
	if (size === "big") {
		for (let i = 0; i < 50; i += 1) properties[`P${i}`] = "x".repeat(2_000);
	}
	return {
		timestamp: "2026-11-07T10:00:00.000Z",
		level: "Information",
		template: "Event {N}",
		properties,
	};
}

function bodies(): string[] {
	return fetchMock.mock.calls.map(([, init]) => (init as RequestInit).body as string);
}

function numbers(body: string): number[] {
	return body.split("\n").map(line => (JSON.parse(line) as { N: number }).N);
}

async function loadShipper() {
	vi.resetModules();
	return import("./shipper");
}

describe("ship", () => {
	beforeEach(() => {
		vi.stubEnv("SEQ_URL", "http://seq.test");
		vi.spyOn(process, "once").mockImplementation(() => process);
		vi.spyOn(console, "warn").mockImplementation(() => {});
		fetchMock = vi.fn(async () => new Response(null, { status: 201 }));
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("never posts a body above the batch size", async () => {
		const { ship, flush } = await loadShipper();

		for (let n = 0; n < 3; n += 1) ship(event(n, "big"));
		for (let n = 3; n < 5; n += 1) ship(event(n, "small"));

		await vi.waitFor(async () => {
			await flush();
			expect(bodies().flatMap(numbers).sort()).toEqual([0, 1, 2, 3, 4]);
		});
		for (const body of bodies()) {
			expect(Buffer.byteLength(body)).toBeLessThanOrEqual(MAX_BATCH_BYTES);
		}
	});

	it("loses only the rejected batch and still sends the rest of the queue", async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 413 }));
		const { ship, flush } = await loadShipper();

		for (let n = 0; n < 3; n += 1) ship(event(n, "big"));
		for (let n = 3; n < 5; n += 1) ship(event(n, "small"));

		await vi.waitFor(async () => {
			await flush();
			expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
		});
		const delivered = bodies().slice(1).flatMap(numbers).sort();
		expect(delivered).toEqual([2, 3, 4]);
	});

	it("caps the queue by size while a flush is pending", async () => {
		let release!: () => void;
		fetchMock.mockImplementationOnce(
			() =>
				new Promise<Response>(resolve => {
					release = () => resolve(new Response(null, { status: 201 }));
				})
		);
		const { ship, flush } = await loadShipper();

		for (let n = 0; n < 200; n += 1) ship(event(n, "big"));
		release();

		await vi.waitFor(async () => {
			await flush();
			expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
		});
		await flush();
		const delivered = bodies().flatMap(numbers);
		expect(delivered.length).toBeLessThan(200);
		expect(delivered.slice(0, 3)).toEqual([0, 1, 2]);
	});
});
