import { describe, expect, it } from "vitest";

import {
	type LocalClass,
	type SourceActivity,
	coverage,
	diffCatalog,
	pairKey,
} from "@/lib/catalog/sync/diff";

const AA = "2025";

function local(over: Partial<LocalClass> = {}): LocalClass {
	return {
		courseCode: "16-315",
		courseName: "Informatica",
		code: "I215-002",
		name: "Fisica",
		cfu: 6,
		classYear: 1,
		mandatory: true,
		curriculum: null,
		...over,
	};
}

function source(over: Partial<SourceActivity> = {}): SourceActivity {
	return {
		academicYear: AA,
		courseCode: "16-315",
		courseName: "INFORMATICA",
		codicione: "0360106203100001",
		code: "I215-002",
		name: "FISICA",
		cfu: 6,
		classYear: 1,
		taf: "Base",
		teachingPeriod: "Primo Ciclo Semestrale",
		ssd: "FIS/01",
		evaluation: "Voto Finale",
		curriculum: "16-315-2",
		group: "OO",
		...over,
	};
}

const kinds = (d: ReturnType<typeof diffCatalog>) => d.findings.map(f => f.kind);

describe("diffCatalog", () => {
	it("reports nothing when the two agree", () => {
		const diff = diffCatalog([local()], [source()], AA);
		expect(diff.findings).toEqual([]);
		expect(diff.summary.matched).toBe(1);
	});

	it("ignores case, accents and punctuation in the name", () => {
		const diff = diffCatalog(
			[local({ name: "Analisi Matematica I" })],
			[source({ name: "ANALISI MATEMATICA  I." })],
			AA
		);
		expect(diff.findings).toEqual([]);
	});

	it("reports a real rename", () => {
		const diff = diffCatalog(
			[local({ name: "Fisica" })],
			[source({ name: "Fisica Generale" })],
			AA
		);
		expect(kinds(diff)).toEqual(["renamed"]);
		expect(diff.findings[0]).toMatchObject({
			ours: "Fisica",
			theirs: "Fisica Generale",
		});
	});

	it("reports a class the catalogue no longer carries", () => {
		const diff = diffCatalog([local()], [], AA);
		expect(kinds(diff)).toEqual(["removed"]);
		expect(diff.summary.removed).toBe(1);
	});

	it("reports a class we never took", () => {
		const diff = diffCatalog([], [source({ code: "TIROC-1", name: "Tirocinio" })], AA);
		expect(kinds(diff)).toEqual(["added"]);
		expect(diff.summary.added).toBe(1);
	});

	it("matches on the pair, so the same code in another course is a different row", () => {
		const diff = diffCatalog(
			[local()],
			[source({ courseCode: "20-312", courseName: "INGEGNERIA INFORMATICA" })],
			AA
		);
		expect(kinds(diff).sort()).toEqual(["added", "removed"]);
	});

	it("reports the fields that drifted", () => {
		const diff = diffCatalog(
			[local({ cfu: 6, classYear: 1 })],
			[source({ cfu: 9, classYear: 2 })],
			AA
		);
		expect(kinds(diff).sort()).toEqual(["cfu", "classYear"]);
	});

	it("says nothing about the compulsory flag without the plan", () => {
		const diff = diffCatalog([local({ mandatory: false })], [source()], AA);
		expect(diff.findings).toEqual([]);
	});

	it("compares the compulsory flag against the plan when it has one", () => {
		const index = new Map([[pairKey("16-315", "I215-002"), [true]]]);
		const diff = diffCatalog([local({ mandatory: false })], [source()], AA, index);
		expect(kinds(diff)).toEqual(["mandatory"]);
		expect(diff.findings[0]).toMatchObject({ ours: false, theirs: "true" });
	});

	it("accepts our flag when one curriculum files it that way", () => {
		const index = new Map([[pairKey("16-315", "I215-002"), [true, false]]]);
		const diff = diffCatalog([local({ mandatory: false })], [source()], AA, index);
		expect(diff.findings).toEqual([]);
	});

	it("stays quiet on a pair the plan does not mention", () => {
		const index = new Map([[pairKey("other", "other"), [true]]]);
		const diff = diffCatalog([local({ mandatory: false })], [source()], AA, index);
		expect(diff.findings).toEqual([]);
	});

	it("accepts a value the catalogue carries in one of its curricula", () => {
		const diff = diffCatalog(
			[local({ cfu: 3 })],
			[source({ cfu: 9, curriculum: "A" }), source({ cfu: 3, curriculum: "B" })],
			AA
		);
		expect(diff.findings).toEqual([]);
	});

	it("reports a value none of the curricula carry", () => {
		const diff = diffCatalog(
			[local({ cfu: 6 })],
			[source({ cfu: 9, curriculum: "A" }), source({ cfu: 3, curriculum: "B" })],
			AA
		);
		expect(kinds(diff)).toEqual(["cfu"]);
		expect(diff.findings[0]!.theirs).toBe("9 | 3");
	});

	it("counts a pair once however many curricula carry it", () => {
		const diff = diffCatalog(
			[local()],
			[source({ curriculum: "A" }), source({ curriculum: "B" })],
			AA
		);
		expect(diff.summary.sourceRows).toBe(2);
		expect(diff.summary.sourcePairs).toBe(1);
		expect(diff.summary.matched).toBe(1);
	});

	it("says nothing about a field the catalogue leaves empty", () => {
		const diff = diffCatalog([local({ cfu: 6 })], [source({ cfu: null })], AA);
		expect(kinds(diff)).toEqual(["cfu"]);
	});

	it("counts a row known to any year as known, not as missing from each", () => {
		const ours = [local(), local({ code: "ONLY-27", name: "Tesi" })];
		const theirs = [
			source({ academicYear: "2025" }),
			source({ academicYear: "2027", code: "ONLY-27", name: "Tesi" }),
		];

		const c = coverage(ours, theirs);
		expect(c.known).toBe(2);
		expect(c.unknown).toEqual([]);
		expect(c.byYear).toEqual([
			{ academicYear: "2025", matched: 1 },
			{ academicYear: "2027", matched: 1 },
		]);
	});

	it("names the rows no published year carries", () => {
		const orphan = local({ code: "GONE", name: "Sparita" });
		const c = coverage([local(), orphan], [source()]);
		expect(c.known).toBe(1);
		expect(c.unknown).toEqual([orphan]);
	});

	it("separates the changed count from added and removed", () => {
		const diff = diffCatalog(
			[local(), local({ code: "GONE", name: "Sparita" })],
			[source({ cfu: 9 }), source({ code: "NEW", name: "Nuova" })],
			AA
		);
		expect(diff.summary).toMatchObject({
			added: 1,
			removed: 1,
			changed: 1,
			matched: 1,
		});
	});
});
