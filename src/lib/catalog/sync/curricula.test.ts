import { describe, expect, it } from "vitest";

import { curriculumName } from "@/lib/catalog/sync/curricula";

const name = (label: string, course = "ARTIFICIAL INTELLIGENCE ENGINEERING") =>
	curriculumName([label], course, "20-373-1", false);

describe("curriculumName", () => {
	it("keeps the part after the course prefix", () => {
		expect(name("Piano LM Artificial Intelligence Engineering - Applications")).toBe(
			"Applications"
		);
		expect(name("Piano Automaticamente Approvato - LM AIE curr Applications")).toBe(
			"Applications"
		);
		expect(
			name(
				"Piano Automaticamente Approvato - LM Ingegneria dei Materiali curr Materiali Ceramici"
			)
		).toBe("Materiali Ceramici");
	});

	it("drops approval states and schema boilerplate", () => {
		expect(name("Curriculum metodologico APPROVATO")).toBe("Metodologico");
		expect(name("Percorso Medicina personalizzata - piano approvato")).toBe(
			"Medicina personalizzata"
		);
		expect(name("Piano del Curriculum Neurotecnologie")).toBe("Neurotecnologie");
	});

	it("keeps hyphenated words whole", () => {
		expect(name("EDSS - Educatore digitale nei contesti socio-sanitari")).toBe(
			"Educatore digitale nei contesti socio-sanitari"
		);
		expect(name("Politico-Organizzativo")).toBe("Politico-Organizzativo");
		expect(name("LMG percorso: Esercito-Commissariato")).toBe("Esercito-Commissariato");
	});

	it("drops a leading plan code", () => {
		expect(name("1-311-1 Factory of the Future")).toBe("Factory of the Future");
		expect(name("1-360-4 ICT - Data Management")).toBe("Data Management");
	});

	it("prefers the label most schemas agree on", () => {
		expect(
			curriculumName(
				[
					"Percorso AMBIENTE - Piano automaticamente approvato",
					"Percorso AMBIENTE - Piano da approvare",
				],
				"BIOLOGIA",
				"17-254-1",
				false
			)
		).toBe("AMBIENTE");
	});

	it("names a label that is only the course name the general curriculum", () => {
		expect(name("Piano LT Ingegneria Elettronica ", "INGEGNERIA ELETTRONICA")).toBe(
			"Generale"
		);
	});

	it("falls back to the code, and names the common trunk", () => {
		expect(
			curriculumName(
				["Schema Automatico per il PDS : 20-210-20"],
				"X",
				"20-210-20",
				false
			)
		).toBe("20-210-20");
		expect(curriculumName(["schema di piano comune"], "X", "PDS0-2026", true)).toBe(
			"Percorso comune"
		);
	});
});
