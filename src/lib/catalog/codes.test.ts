import { describe, expect, it } from "vitest";

import { normaliseCatalogueCode } from "@/lib/catalog/codes";

describe("normaliseCatalogueCode", () => {
	it("removes the spaces the catalogue puts in some codes", () => {
		expect(normaliseCatalogueCode("MN1 - 1351")).toBe("MN1-1351");
		expect(normaliseCatalogueCode("SFP 52")).toBe("SFP52");
	});

	it("leaves a clean code as it is", () => {
		expect(normaliseCatalogueCode("INFMN-016R")).toBe("INFMN-016R");
	});

	it("keeps the case", () => {
		expect(normaliseCatalogueCode("Ab 1")).toBe("Ab1");
	});

	it("handles tabs and runs of whitespace", () => {
		expect(normaliseCatalogueCode(" A \t B  ")).toBe("AB");
	});
});
