// Compares our catalogue with the official one and writes a report. Read-only.
//
//   pnpm catalog:diff                        confronta contro l'anno corrente
//   pnpm catalog:diff --anno 2024            un altro anno
//   pnpm catalog:diff --anni 2023,2024,2025  più anni, per misurare la deriva
//   pnpm catalog:diff --out report.md        dove scrivere
//   pnpm catalog:diff --refresh              ignora la cache e riscarica
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { coverage, diffCatalog } from "../../src/lib/catalog/sync/diff.ts";
import { readLocalCatalog } from "./local.ts";
import { renderCoverage, renderReport, renderSummary } from "./report.ts";
import { type SourceYear, fetchYear, fetchYears } from "./source.ts";

function arg(name: string): string | undefined {
	const index = process.argv.indexOf(`--${name}`);
	return index === -1 ? undefined : process.argv[index + 1];
}

const DEFAULT_YEAR = "2025";
const DETAIL_LIMIT = Number(arg("limit") ?? 60);
const OUT = arg("out") ?? join(process.cwd(), "catalog-diff.md");

if (process.argv.includes("--refresh")) {
	await rm(join(process.cwd(), ".cache", "catalog"), { recursive: true, force: true });
}

const detailFor = arg("anno") ?? DEFAULT_YEAR;
const wanted = arg("anni")
	?.split(",")
	.map(year => year.trim()) ?? [detailFor];

console.log("Leggo il nostro catalogo…");
const local = await readLocalCatalog();
console.log(
	`  ${local.courses.length} corsi, ${local.classes.length} righe corso-insegnamento`
);

const published = await fetchYears();
const unknownYear = wanted.find(year => !published.includes(year));
if (unknownYear) {
	console.error(`L'anno ${unknownYear} non è pubblicato: ${published.join(", ")}`);
	process.exit(1);
}

const years: SourceYear[] = [];
for (const year of wanted) {
	const fetched = await fetchYear(year, (done, total) => {
		if (process.stdout.isTTY) {
			process.stdout.write(`\rScarico i piani ${year}… ${done}/${total} corsi`);
		}
	});
	years.push(fetched);
	console.log(
		`\rScarico i piani ${year}: ${fetched.courses.length} corsi, ${fetched.activities.length} attività`
	);
}

const diffs = years.map(year =>
	diffCatalog(local.classes, year.activities, year.academicYear, year.mandatory)
);

const detail = years.find(year => year.academicYear === detailFor);
const cover = coverage(
	local.classes,
	years.flatMap(year => year.activities)
);

const known = new Set(detail?.courses.map(course => course.code) ?? []);
const unknownCourses = detail
	? local.courses.filter(course => !known.has(course.code))
	: [];

await writeFile(
	OUT,
	renderReport(diffs, cover, local.classes.length, detailFor, DETAIL_LIMIT)
);

console.log();
console.log(renderCoverage(cover, local.classes.length));
console.log();
if (diffs.length > 1) {
	console.log(renderSummary(diffs));
	console.log();
}
if (unknownCourses.length > 0) {
	console.log(
		`${unknownCourses.length} dei nostri ${local.courses.length} corsi non sono nell'offerta ${detailFor}.`
	);
	console.log(
		"  Il catalogo rinumera i codici fra un anno e l'altro, quindi su un anno"
	);
	console.log("  diverso da quello corrente questo numero è atteso alto.");
}
console.log(`Dettaglio ${detailFor} scritto in ${OUT}`);
