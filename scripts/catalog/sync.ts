// Adds the plan classes we lack and fills fields from the official catalogue; writes only with --apply.
//
//   pnpm catalog:sync                 cosa cambierebbe
//   pnpm catalog:sync --apply         applicalo
//   pnpm catalog:sync --anno 2025     contro un altro anno
import { and, eq, max } from "drizzle-orm";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	classes,
	courseClasses,
	courses,
	departments,
} from "../../src/db/schema/index.ts";
import {
	type CatalogueAdditions,
	planCatalogueAdditions,
} from "../../src/lib/catalog/sync/additions.ts";
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
				name: classes.name,
				evaluation: courseClasses.evaluation,
				taf: courseClasses.taf,
				teachingPeriod: courseClasses.teachingPeriod,
				isTeaching: courseClasses.isTeaching,
			})
			.from(courseClasses)
			.innerJoin(courses, eq(courses.id, courseClasses.courseId))
			.innerJoin(classes, eq(classes.id, courseClasses.classId)),
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
		mandatory: year.mandatory,
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

async function applyAdditions(plan: CatalogueAdditions) {
	await getDb().transaction(async tx => {
		const created = new Map<string, string>();
		for (const row of plan.additions) {
			if (row.classId || created.has(row.code)) continue;
			const [inserted] = await tx
				.insert(classes)
				.values({ name: row.name, cfu: row.cfu, ssd: row.ssd })
				.returning({ id: classes.id });
			created.set(row.code, inserted!.id);
		}

		const next = new Map<string, number>();
		for (const row of plan.additions) {
			if (!next.has(row.courseId)) {
				const [top] = await tx
					.select({ value: max(courseClasses.position) })
					.from(courseClasses)
					.where(eq(courseClasses.courseId, row.courseId));
				next.set(row.courseId, (top?.value ?? -1) + 1);
			}
			const position = next.get(row.courseId)!;
			next.set(row.courseId, position + 1);

			await tx.insert(courseClasses).values({
				courseId: row.courseId,
				classId: row.classId ?? created.get(row.code)!,
				code: row.code,
				classYear: row.classYear,
				mandatory: row.mandatory,
				evaluation: row.evaluation,
				taf: row.taf,
				teachingPeriod: row.teachingPeriod,
				isTeaching: row.isTeaching,
				position,
			});
		}
	});
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
const additions = planCatalogueAdditions(await readLocal(), source);
summariseAdditions(additions);
const plan = planCatalogueUpdates(await readLocal(), source);
summarise(plan);

if (!APPLY) {
	console.log("\nNiente scritto. Rilancia con --apply per applicarlo.");
} else if (additions.additions.length === 0 && total(plan) === 0) {
	console.log("\nGià allineato.");
} else {
	await applyAdditions(additions);
	const updates = planCatalogueUpdates(await readLocal(), source);
	await apply(updates);
	// A re-plan after applying must be empty, or the apply missed something.
	const local = await readLocal();
	const left =
		planCatalogueAdditions(local, source).additions.length +
		total(planCatalogueUpdates(local, source));
	if (left > 0) {
		console.error(`\nApplicato, ma ${left} righe restano da sistemare.`);
		process.exitCode = 1;
	} else {
		console.log(
			`\nApplicato: ${additions.additions.length} aggiunte, ${total(updates)} aggiornate. Un secondo giro non trova più niente.`
		);
	}
}

await closeDb();
