import { describe, expect, it } from "vitest";

import { FACET_NOT, facetFilterFn, readFacet, writeFacet } from "./facet-filter";

describe("readFacet", () => {
	it("reads an empty value as an include with no values", () => {
		expect(readFacet(undefined)).toEqual({ exclude: false, values: [] });
		expect(readFacet([])).toEqual({ exclude: false, values: [] });
	});

	it("reads a bare list as include", () => {
		expect(readFacet(["a", "b"])).toEqual({ exclude: false, values: ["a", "b"] });
	});

	it("reads the glued marker on the first token as exclude", () => {
		expect(readFacet([`${FACET_NOT}a`, "b"])).toEqual({
			exclude: true,
			values: ["a", "b"],
		});
	});
});

describe("writeFacet", () => {
	it("returns undefined when nothing is selected", () => {
		expect(writeFacet(false, [])).toBeUndefined();
		expect(writeFacet(true, [])).toBeUndefined();
	});

	it("writes a bare list for include", () => {
		expect(writeFacet(false, ["a", "b"])).toEqual(["a", "b"]);
	});

	it("glues the marker onto the first token for exclude", () => {
		expect(writeFacet(true, ["a", "b"])).toEqual([`${FACET_NOT}a`, "b"]);
	});

	it("round-trips through the comma-string URL encoding", () => {
		for (const [exclude, values] of [
			[false, ["a", "b"]],
			[true, ["a"]],
			[true, ["a", "b", "c"]],
		] as const) {
			const written = writeFacet(exclude, [...values])!;
			const urlRoundTripped = written.join(",").split(",");
			expect(readFacet(urlRoundTripped)).toEqual({ exclude, values: [...values] });
		}
	});
});

describe("facetFilterFn", () => {
	const run = (dataValue: string, filterValue: unknown) =>
		facetFilterFn({ getValue: () => dataValue } as never, "col", filterValue);

	it("keeps everything when no values are selected", () => {
		expect(run("x", [])).toBe(true);
	});

	it("include keeps only rows in the set", () => {
		expect(run("a", ["a", "b"])).toBe(true);
		expect(run("c", ["a", "b"])).toBe(false);
	});

	it("exclude drops rows in the set and keeps the rest", () => {
		const value = writeFacet(true, ["a", "b"]);
		expect(run("a", value)).toBe(false);
		expect(run("c", value)).toBe(true);
	});
});
