// Imports the official syllabus of every class from the catalogue and derives the descriptions from it; writes only with --apply.
//
//   pnpm catalog:syllabi            cosa cambierebbe
//   pnpm catalog:syllabi --apply    applicalo
import { closeDb, getDb } from "../../src/db/index.ts";
import type { SyllabusChanges } from "../../src/lib/catalog/sync/syllabi.ts";
import { importSyllabi, syllabusRowCount } from "./run-syllabi.ts";

const APPLY = process.argv.includes("--apply");

function summarise(plan: SyllabusChanges, classCount: number, found: number) {
	const cleared = plan.descriptions.filter(d => d.description === null).length;
	console.log(`  insegnamenti     ${classCount}, con un syllabus ufficiale ${found}`);
	console.log(
		`  syllabi          ${plan.inserts.length} nuovi, ${plan.updates.length} da aggiornare`
	);
	console.log(
		`  descrizioni      ${plan.descriptions.length - cleared} da riscrivere, ${cleared} da svuotare`
	);
}

const report = await importSyllabi(getDb(), {
	apply: APPLY,
	progress: message => {
		if (process.stdout.isTTY) process.stdout.write(`\r\x1b[K  ${message}`);
	},
});
if (process.stdout.isTTY) process.stdout.write("\r\x1b[K");
summarise(report.plan, report.classCount, report.found);

if (!APPLY) {
	console.log("\nNiente scritto. Rilancia con --apply per applicarlo.");
} else if (!report.applied) {
	console.log("\nGià allineato.");
} else if (report.left > 0) {
	console.error(`\nApplicato, ma ${report.left} righe restano da sistemare.`);
	process.exitCode = 1;
} else {
	console.log(
		`\nApplicato: ${syllabusRowCount(report.plan)} righe. Un secondo giro non trova più niente.`
	);
}

await closeDb();
