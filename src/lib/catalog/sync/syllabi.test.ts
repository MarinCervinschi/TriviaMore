import { describe, expect, it } from "vitest";

import {
	type Syllabus,
	htmlToText,
	planSyllabi,
	readSyllabus,
	summarise,
} from "@/lib/catalog/sync/syllabi";

function syllabus(over: Partial<Syllabus> = {}): Syllabus {
	return {
		academicYear: 2026,
		catalogueUrl: "https://x/af/2026",
		objectives:
			"Fornire le basi del calcolo differenziale. Il corso tratta limiti e derivate.",
		contents: "Limiti. Derivate.",
		prerequisites: null,
		assessment: null,
		readings: null,
		teachingMethods: null,
		outcomes: null,
		...over,
	};
}

describe("htmlToText", () => {
	it("keeps paragraphs and list items as lines", () => {
		expect(
			htmlToText("<p>Primo</p><p>Secondo<br/>riga</p><ul><li>uno</li><li>due</li></ul>")
		).toBe("Primo\nSecondo\nriga\n\n• uno\n• due");
	});

	it("decodes entities and drops other tags", () => {
		expect(htmlToText("L&rsquo;analisi &amp; la <b>sintesi</b>&nbsp;&#232;")).toBe(
			"L’analisi & la sintesi è"
		);
	});

	it("spells out typographic ligatures", () => {
		expect(htmlToText("processi ﬁsiologici e ﬂussi")).toBe(
			"processi fisiologici e flussi"
		);
	});

	it("is null for an empty or blank text", () => {
		expect(htmlToText("")).toBeNull();
		expect(htmlToText("<p> </p>")).toBeNull();
		expect(htmlToText(null)).toBeNull();
	});
});

describe("readSyllabus", () => {
	it("reads the block of the whole activity, in Italian with English as fallback", () => {
		const read = readSyllabus(
			[
				{ chiave_udCod: "U1", obiettivi_formativi_it: "Modulo" },
				{
					chiave_udCod: null,
					obiettivi_formativi_it: "Intero",
					contenuti_en: "Contents",
				},
			],
			2025,
			null
		);
		expect(read).toMatchObject({
			academicYear: 2025,
			objectives: "Intero",
			contents: "Contents",
		});
	});

	it("falls back to a unit when the whole activity has no text", () => {
		const read = readSyllabus(
			[
				{ chiave_udCod: null, obiettivi_formativi_it: "" },
				{ chiave_udCod: "U1", obiettivi_formativi_it: "Del modulo" },
			],
			2025,
			null
		);
		expect(read?.objectives).toBe("Del modulo");
	});

	it("is null when neither objectives nor contents were published", () => {
		expect(
			readSyllabus([{ chiave_udCod: null, testi_it: "Libro" }], 2026, null)
		).toBeNull();
		expect(readSyllabus([], 2026, null)).toBeNull();
	});
});

describe("summarise", () => {
	it("takes the first sentence", () => {
		expect(
			summarise("Fornire le basi del calcolo differenziale. Il corso tratta limiti.")
		).toBe("Fornire le basi del calcolo differenziale.");
	});

	it("cuts a long opening at a word", () => {
		const long = "parola ".repeat(80).trim();
		const summary = summarise(long)!;
		expect(summary.length).toBeLessThanOrEqual(281);
		expect(summary.endsWith("parola…")).toBe(true);
	});

	it("joins the lines of a list", () => {
		expect(summarise("• Conoscere i limiti\n• Calcolare derivate")).toBe(
			"Conoscere i limiti • Calcolare derivate"
		);
	});
});

describe("planSyllabi", () => {
	it("inserts a new syllabus and sets the description from it", () => {
		const changes = planSyllabi(
			{ classes: [{ id: "k1", description: "Sintesi nostra" }], syllabi: [] },
			new Map([["k1", syllabus()]])
		);
		expect(changes.inserts).toHaveLength(1);
		expect(changes.descriptions).toEqual([
			{ classId: "k1", description: "Fornire le basi del calcolo differenziale." },
		]);
	});

	it("updates only the fields that changed", () => {
		const changes = planSyllabi(
			{
				classes: [
					{ id: "k1", description: "Fornire le basi del calcolo differenziale." },
				],
				syllabi: [{ classId: "k1", ...syllabus({ contents: "Vecchi" }) }],
			},
			new Map([["k1", syllabus()]])
		);
		expect(changes.updates).toEqual([
			{ classId: "k1", set: { contents: "Limiti. Derivate." } },
		]);
		expect(changes.descriptions).toEqual([]);
	});

	it("keeps a stored syllabus the source no longer has, and its description", () => {
		const changes = planSyllabi(
			{
				classes: [
					{ id: "k1", description: "Fornire le basi del calcolo differenziale." },
				],
				syllabi: [{ classId: "k1", ...syllabus() }],
			},
			new Map()
		);
		expect(changes).toEqual({ inserts: [], updates: [], descriptions: [] });
	});

	it("clears the description of a class with no syllabus", () => {
		const changes = planSyllabi(
			{ classes: [{ id: "k2", description: "Sintesi nostra" }], syllabi: [] },
			new Map()
		);
		expect(changes.descriptions).toEqual([{ classId: "k2", description: null }]);
	});
});
