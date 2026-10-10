// Adds the plan classes we lack, fills fields and mirrors every cohort's plan from the official catalogue; writes only with --apply.
//
//   pnpm catalog:sync                 cosa cambierebbe
//   pnpm catalog:sync --apply         applicalo
//   pnpm catalog:sync --anno 2025     contro un altro anno, invece di quello in corso
import { closeDb, getDb } from "../../src/db/index.ts";
import { academicYearOf } from "../../src/lib/catalog/academic-year.ts";
import type { CatalogueAdditions } from "../../src/lib/catalog/sync/additions.ts";
import type { CohortPlanChanges } from "../../src/lib/catalog/sync/cohort-plans.ts";
import type { CatalogueUpdates } from "../../src/lib/catalog/sync/plan.ts";
import { catalogueRowCount, planRowCount, syncCatalog } from "./run-sync.ts";

function arg(name: string): string | undefined {
	const index = process.argv.indexOf(`--${name}`);
	return index === -1 ? undefined : process.argv[index + 1];
}

const YEAR = arg("anno") ?? String(academicYearOf(new Date()));
const APPLY = process.argv.includes("--apply");

function summarise(plan: CatalogueUpdates) {
	const fields = (rows: { set: object }[]) => {
		const counts = new Map<string, number>();
		for (const row of rows) {
			for (const field of Object.keys(row.set)) {
				counts.set(field, (counts.get(field) ?? 0) + 1);
			}
		}
		return [...counts].map(([field, n]) => `${field} ${n}`).join(", ") || "—";
	};
	const contested = plan.classes.filter(c => c.contested).length;

	console.log(`  dipartimenti     ${plan.departments.length} da aggiornare`);
	console.log(`  corsi            ${plan.courses.length}  (${fields(plan.courses)})`);
	console.log(
		`  insegnamenti     ${plan.classes.length} con l'SSD${contested ? `, ${contested} su cui i corsi non concordano` : ""}`
	);
	console.log(
		`  corso-insegnam.  ${plan.courseClasses.length}  (${fields(plan.courseClasses)})`
	);
	const { unmatched } = plan;
	console.log(
		`  senza riscontro  ${unmatched.departments} dipartimenti, ${unmatched.courses} corsi, ${unmatched.courseClasses} corso-insegnamento`
	);
}

function summariseAdditions(plan: CatalogueAdditions) {
	const byEvaluation = new Map<string, number>();
	for (const row of plan.additions) {
		byEvaluation.set(row.evaluation, (byEvaluation.get(row.evaluation) ?? 0) + 1);
	}
	const linked = plan.additions.filter(row => row.classId).length;
	const split = [...byEvaluation].map(([k, n]) => `${k} ${n}`).join(", ") || "—";
	console.log(
		`  da aggiungere    ${plan.additions.length}  (${split}; ${linked} su classi esistenti)`
	);
	const { skipped } = plan;
	console.log(
		`  non aggiunte     ${skipped.unknownEvaluation} senza valutazione, ${skipped.noClassYear} senza anno, ${skipped.alreadyLinked} già legate con un altro codice`
	);
}

function summarisePlans(plan: CohortPlanChanges, cohorts: number[]) {
	const perCohort = new Map<number, number>();
	for (const row of plan.plans.inserts)
		perCohort.set(row.cohort, (perCohort.get(row.cohort) ?? 0) + 1);
	const split = [...perCohort].map(([c, n]) => `${c} ${n}`).join(", ") || "—";
	const unlinked = plan.plans.inserts.filter(row => !row.classId).length;
	const { curricula, plans } = plan;
	console.log(`  piani per coorte ${cohorts.join(", ")}`);
	console.log(
		`  curriculum       ${curricula.inserts.length} nuovi, ${curricula.updates.length} da aggiornare, ${curricula.deletes.length} da eliminare`
	);
	console.log(
		`  righe di piano   ${plans.inserts.length} nuove  (${split}; ${unlinked} senza insegnamento nostro)`
	);
	console.log(
		`                   ${plans.updates.length} da aggiornare, ${plans.deletes.length} da eliminare`
	);
	console.log(`  corsi non nostri ${plan.unmatchedCourses} corso-coorte`);
}

const report = await syncCatalog(getDb(), {
	year: YEAR,
	apply: APPLY,
	progress: message => {
		if (process.stdout.isTTY) process.stdout.write(`\r\x1b[K  ${message}`);
	},
});
if (process.stdout.isTTY) process.stdout.write("\r\x1b[K");
summariseAdditions(report.additions);
summarise(report.updates);
summarisePlans(report.plans, report.cohorts);

if (!APPLY) {
	console.log("\nNiente scritto. Rilancia con --apply per applicarlo.");
} else if (!report.applied) {
	console.log("\nGià allineato.");
} else if (report.left > 0) {
	console.error(`\nApplicato, ma ${report.left} righe restano da sistemare.`);
	process.exitCode = 1;
} else {
	console.log(
		`\nApplicato: ${report.additions.additions.length} aggiunte, ${catalogueRowCount(report.updates)} aggiornate, ${planRowCount(report.plans)} righe di piano. Un secondo giro non trova più niente.`
	);
}

await closeDb();
