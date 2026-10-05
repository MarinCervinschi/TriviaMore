// Fills fields on existing rows from the official catalogue; writes only with --apply.
//
//   pnpm catalog:sync                 cosa cambierebbe
//   pnpm catalog:sync --apply         applicalo
//   pnpm catalog:sync --anno 2025     contro un altro anno
import { and, eq } from "drizzle-orm";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	classes,
	courseClasses,
	courses,
	departments,
} from "../../src/db/schema/index.ts";
import { planCatalogueUpdates } from "../../src/lib/catalog/sync/plan.ts";
import type { CatalogueUpdates } from "../../src/lib/catalog/sync/plan.ts";
import {
	fetchActivityAttributes,
	fetchCourses,
	fetchDepartments,
	fetchYear,
} from "./source.ts";

function arg(name: string): string | undefined {
	const index = process.argv.indexOf(`--${name}`);
	return index === -1 ? undefined : process.argv[index + 1];
}

const YEAR = arg("anno") ?? "2025";
const APPLY = process.argv.includes("--apply");

async function readLocal() {
	const db = getDb();
	const [departmentRows, courseRows, classRows, courseClassRows] = await Promise.all([
		db
			.select({
				id: departments.id,
				name: departments.name,
				catalogueCode: departments.catalogueCode,
			})
			.from(departments),
		db
			.select({
				id: courses.id,
				code: courses.code,
				nationalCode: courses.nationalCode,
				degreeClass: courses.degreeClass,
				teachingLanguage: courses.teachingLanguage,
				restrictedAccess: courses.restrictedAccess,
				catalogueUrl: courses.catalogueUrl,
			})
			.from(courses),
		db.select({ id: classes.id, name: classes.name, ssd: classes.ssd }).from(classes),
		db
			.select({
				courseId: courseClasses.courseId,
				classId: courseClasses.classId,
				courseCode: courses.code,
				code: courseClasses.code,
				evaluation: courseClasses.evaluation,
				taf: courseClasses.taf,
				teachingPeriod: courseClasses.teachingPeriod,
			})
			.from(courseClasses)
			.innerJoin(courses, eq(courses.id, courseClasses.courseId)),
	]);
	return {
		departments: departmentRows,
		courses: courseRows,
		classes: classRows,
		courseClasses: courseClassRows,
	};
}

async function readSource() {
	const year = await fetchYear(YEAR, (done, total) => {
		if (process.stdout.isTTY) process.stdout.write(`\r  piani ${done}/${total}`);
	});
	if (process.stdout.isTTY) process.stdout.write("\r");
	const [courseRows, attributes, departmentRows] = await Promise.all([
		fetchCourses(YEAR),
		fetchActivityAttributes(),
		fetchDepartments(),
	]);
	return {
		departments: departmentRows,
		courses: courseRows,
		activities: year.activities,
		attributes,
	};
}

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

async function apply(plan: CatalogueUpdates) {
	await getDb().transaction(async tx => {
		for (const row of plan.departments) {
			await tx
				.update(departments)
				.set({ catalogueCode: row.catalogueCode })
				.where(eq(departments.id, row.id));
		}
		for (const row of plan.courses) {
			await tx.update(courses).set(row.set).where(eq(courses.id, row.id));
		}
		for (const row of plan.classes) {
			await tx.update(classes).set({ ssd: row.ssd }).where(eq(classes.id, row.id));
		}
		for (const row of plan.courseClasses) {
			await tx
				.update(courseClasses)
				.set(row.set)
				.where(
					and(
						eq(courseClasses.courseId, row.courseId),
						eq(courseClasses.classId, row.classId)
					)
				);
		}
	});
}

const total = (plan: CatalogueUpdates) =>
	plan.departments.length +
	plan.courses.length +
	plan.classes.length +
	plan.courseClasses.length;

console.log(`Catalogo ufficiale ${YEAR}…`);
const source = await readSource();
const plan = planCatalogueUpdates(await readLocal(), source);
summarise(plan);

if (!APPLY) {
	console.log("\nNiente scritto. Rilancia con --apply per applicarlo.");
} else if (total(plan) === 0) {
	console.log("\nGià allineato.");
} else {
	await apply(plan);
	// A re-plan after applying must be empty, or the apply missed something.
	const after = planCatalogueUpdates(await readLocal(), source);
	if (total(after) > 0) {
		console.error(`\nApplicato, ma ${total(after)} righe restano da aggiornare.`);
		process.exitCode = 1;
	} else {
		console.log(
			`\nApplicato: ${total(plan)} righe. Un secondo giro non trova più niente.`
		);
	}
}

await closeDb();
