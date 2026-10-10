import { z } from "zod";

import { academicYearOf, formatAcademicYear } from "@/lib/catalog/academic-year";

import { importSyllabi } from "../../../../scripts/catalog/run-syllabi.ts";
import {
	catalogueRowCount,
	planRowCount,
	syncCatalog,
} from "../../../../scripts/catalog/run-sync.ts";
import { setCacheDir } from "../../../../scripts/catalog/source.ts";
import { syllabiChanges, syncChanges } from "./catalog-changes";
import type { JobDefinition, JobField } from "./types";

const FIRST_CATALOGUE_YEAR = 2021;

const yearParam = z.object({
	year: z
		.string()
		.regex(/^\d{4}$/)
		.optional(),
});

function yearField(): JobField {
	const current = academicYearOf(new Date());
	const years = Array.from(
		{ length: current - FIRST_CATALOGUE_YEAR + 1 },
		(_, i) => current - i
	);
	return {
		key: "year",
		label: "Anno accademico",
		description:
			"L'offerta del catalogo da confrontare. I piani si allineano comunque per ogni coorte.",
		options: [
			{ value: "", label: `In corso (${formatAcademicYear(current)})` },
			...years
				.slice(1)
				.map(year => ({ value: String(year), label: formatAcademicYear(year) })),
		],
		flag: "--anno",
	};
}

export const catalogSync: JobDefinition<typeof yearParam> = {
	name: "catalog.sync",
	label: "Catalogo e piani",
	area: "Catalogo",
	description:
		"Aggiunge gli insegnamenti che mancano, aggiorna i campi del catalogo e allinea i piani di ogni coorte con il catalogo CINECA.",
	command: "pnpm catalog:sync",
	params: yearParam,
	get fields() {
		return [yearField()];
	},
	async run({ year }, { db, dryRun, cacheDir, signal }) {
		setCacheDir(cacheDir);
		const report = await syncCatalog(db, {
			year: year ?? String(academicYearOf(new Date())),
			apply: !dryRun,
			progress: () => signal.throwIfAborted(),
		});
		if (report.left > 0) {
			throw new Error(`Applicato, ma ${report.left} righe restano da sistemare.`);
		}
		return {
			summary: {
				"Insegnamenti aggiunti": report.additions.additions.length,
				"Campi aggiornati": catalogueRowCount(report.updates),
				"Righe di piano": planRowCount(report.plans),
				Coorti: report.cohorts.join(", "),
			},
			changes: await syncChanges(db, report),
		};
	},
};

const noParams = z.object({});

export const catalogSyllabi: JobDefinition<typeof noParams> = {
	name: "catalog.syllabi",
	label: "Schede insegnamento",
	area: "Catalogo",
	description:
		"Scarica la scheda ufficiale di ogni insegnamento dal catalogo CINECA e ne ricava le descrizioni.",
	command: "pnpm catalog:syllabi",
	params: noParams,
	fields: [],
	async run(_params, { db, dryRun, cacheDir, signal }) {
		setCacheDir(cacheDir);
		const report = await importSyllabi(db, {
			apply: !dryRun,
			progress: () => signal.throwIfAborted(),
		});
		if (report.left > 0) {
			throw new Error(`Applicato, ma ${report.left} righe restano da sistemare.`);
		}
		const cleared = report.plan.descriptions.filter(d => d.description === null).length;
		return {
			summary: {
				"Con la scheda": report.found,
				"Schede nuove": report.plan.inserts.length,
				"Schede aggiornate": report.plan.updates.length,
				"Descrizioni riscritte": report.plan.descriptions.length - cleared,
				"Descrizioni svuotate": cleared,
			},
			changes: await syllabiChanges(db, report),
		};
	},
};
