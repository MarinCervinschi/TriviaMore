import { describe, expect, it } from "vitest";

import { siteUrl } from "./json-ld";
import { seoHead } from "./seo";

describe("siteUrl", () => {
	it("drops the trailing slash of an index route", () => {
		expect(siteUrl("/browse/dief/20-312/")).toMatch(/\/browse\/dief\/20-312$/);
	});

	it("keeps the root", () => {
		expect(siteUrl("/")).toMatch(/[^/]\/$/);
	});
});

describe("seoHead", () => {
	it("points the canonical at the URL that answers 200", () => {
		const { links } = seoHead({ title: "X", path: "/browse/demb/" });
		expect(links[0].href).toMatch(/\/browse\/demb$/);
	});
});
