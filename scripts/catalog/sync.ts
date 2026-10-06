// Adds the plan classes we lack, fills fields and mirrors every cohort's plan from the official catalogue; writes only with --apply.
//
//   pnpm catalog:sync                 cosa cambierebbe
//   pnpm catalog:sync --apply         applicalo
//   pnpm catalog:sync --anno 2025     contro un altro anno, invece di quello in corso
import { and, eq, inArray, max } from "drizzle-orm";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	classes,
	courseClasses,
	courseCurricula,
	coursePlans,
	courses,
	departments,
} from "../../src/db/schema/index.ts";
import { academicYearOf } from "../../src/lib/catalog/academic-year.ts";
import {
	type CatalogueAdditions,
	planCatalogueAdditions,
} from "../../src/lib/catalog/sync/additions.ts";
import {
	type CohortPlanChanges,
	type SourceCohort,
	planCohortPlans,
} from "../../src/lib/catalog/sync/cohort-plans.ts";
import { pairKey } from "../../src/lib/catalog/sync/diff.ts";
import { planCatalogueUpdates } from "../../src/lib/catalog/sync/plan.ts";
import type { CatalogueUpdates } from "../../src/lib/catalog/sync/plan.ts";
import {
	fetchActivityAttributes,
	fetchCourses,
	fetchDepartments,
	fetchYear,
	fetchYears,
} from "./source.ts";

function arg(name: string): string | undefined {
	const index = process.argv.indexOf(`--${name}`);
	return index === -1 ? undefined : process.argv[index + 1];
}

const CURRENT = academicYearOf(new Date());
const YEAR = arg("anno") ?? String(CURRENT);
const APPLY = process.argv.includes("--apply");
const FIRST_COHORT = 2021;

async function readLocal() {
	const db = getDb();
	const [
		departmentRows,
		courseRows,
		classRows,
		courseClassRows,
		curriculumRows,
		planRows,
	] = await Promise.all([
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
				catalogueUrl: courseClasses.catalogueUrl,
			})
			.from(courseClasses)
			.innerJoin(courses, eq(courses.id, courseClasses.courseId))
			.innerJoin(classes, eq(classes.id, courseClasses.classId)),
		db
			.select({
				id: courseCurricula.id,
				courseId: courseCurricula.courseId,
				cohort: courseCurricula.cohort,
				code: courseCurricula.code,
				name: courseCurricula.name,
				common: courseCurricula.common,
			})
			.from(courseCurricula),
		db
			.select({
				id: coursePlans.id,
				courseId: coursePlans.courseId,
				cohort: coursePlans.cohort,
				curriculum: courseCurricula.code,
				code: coursePlans.code,
				classId: coursePlans.classId,
				name: coursePlans.name,
				cfu: coursePlans.cfu,
				classYear: coursePlans.classYear,
				mandatory: coursePlans.mandatory,
				groupCode: coursePlans.groupCode,
				groupLabel: coursePlans.groupLabel,
				groupPosition: coursePlans.groupPosition,
				evaluation: coursePlans.evaluation,
				taf: coursePlans.taf,
				teachingPeriod: coursePlans.teachingPeriod,
			})
			.from(coursePlans)
			.innerJoin(courseCurricula, eq(courseCurricula.id, coursePlans.curriculumId)),
	]);
	return {
		departments: departmentRows,
		courses: courseRows,
		classes: classRows,
		courseClasses: courseClassRows,
		curricula: curriculumRows,
		plans: planRows,
	};
}

/** Our code for each year's course code, through the national code; a year's code that reaches two of our courses is dropped. */
async function localCourseCodes(
	local: { code: string; nationalCode: string | null }[]
) {
	const byNational = new Map(
		local.filter(c => c.nationalCode).map(c => [c.nationalCode!, c.code])
	);
	const seen = new Map<string, Set<string>>();
	for (let year = FIRST_COHORT; year <= CURRENT; year++) {
		for (const course of await fetchCourses(String(year))) {
			const ours = course.codicione ? byNational.get(course.codicione) : undefined;
			if (!ours) continue;
			const codes = seen.get(course.code) ?? new Set<string>();
			codes.add(ours);
			seen.set(course.code, codes);
		}
	}
	return new Map(
		[...seen]
			.filter(([, codes]) => codes.size === 1)
			.map(([code, codes]) => [code, [...codes][0]!])
	);
}

function rekey<T>(index: Map<string, T[]>, toLocal: (code: string) => string) {
	const out = new Map<string, T[]>();
	for (const [k, values] of index) {
		const [courseCode, code] = k.split("\u0000") as [string, string];
		const key = pairKey(toLocal(courseCode), code);
		out.set(key, [...(out.get(key) ?? []), ...values]);
	}
	return out;
}

async function readSource() {
	const year = await fetchYear(YEAR, (done, total) => {
		if (process.stdout.isTTY) process.stdout.write(`\r  piani ${done}/${total}`);
	});
	if (process.stdout.isTTY) process.stdout.write("\r");
	const [courseRows, attributes, departmentRows, codes] = await Promise.all([
		fetchCourses(YEAR),
		fetchActivityAttributes(),
		fetchDepartments(),
		localCourseCodes((await readLocal()).courses),
	]);
	// The planners match courses by our code, and a course's code in the catalogue changes between years.
	const toLocal = (code: string) => codes.get(code) ?? code;
	return {
		departments: departmentRows,
		courses: courseRows.map(c => ({ ...c, code: toLocal(c.code) })),
		activities: year.activities.map(a => ({ ...a, courseCode: toLocal(a.courseCode) })),
		mandatory: rekey(year.mandatory, toLocal),
		attributes: rekey(attributes, toLocal),
		rawAttributes: attributes,
	};
}

async function readCohorts(): Promise<SourceCohort[]> {
	const years = (await fetchYears())
		.map(Number)
		.filter(year => year >= FIRST_COHORT && year <= CURRENT);
	const cohorts: SourceCohort[] = [];
	for (const year of years) {
		const source = await fetchYear(String(year), (done, total) => {
			if (process.stdout.isTTY)
				process.stdout.write(`\r  coorte ${year} ${done}/${total}`);
		});
		cohorts.push({
			cohort: year,
			courses: source.courses,
			activities: source.activities,
			curricula: source.curricula,
		});
	}
	if (process.stdout.isTTY) process.stdout.write("\r\x1b[K");
	return cohorts;
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

function summarisePlans(plan: CohortPlanChanges, cohorts: SourceCohort[]) {
	const perCohort = new Map<number, number>();
	for (const row of plan.plans.inserts)
		perCohort.set(row.cohort, (perCohort.get(row.cohort) ?? 0) + 1);
	const split = [...perCohort].map(([c, n]) => `${c} ${n}`).join(", ") || "—";
	const unlinked = plan.plans.inserts.filter(row => !row.classId).length;
	const { curricula, plans } = plan;
	console.log(`  piani per coorte ${cohorts.map(c => c.cohort).join(", ")}`);
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

const planChanges = ({ curricula, plans }: CohortPlanChanges) =>
	[curricula, plans].reduce(
		(n, c) => n + c.inserts.length + c.updates.length + c.deletes.length,
		0
	);

async function applyPlans(plan: CohortPlanChanges) {
	const { curricula, plans } = plan;
	await getDb().transaction(async tx => {
		if (curricula.deletes.length > 0) {
			await tx
				.delete(courseCurricula)
				.where(inArray(courseCurricula.id, curricula.deletes));
		}
		for (let i = 0; i < curricula.inserts.length; i += 500) {
			await tx.insert(courseCurricula).values(curricula.inserts.slice(i, i + 500));
		}
		for (const row of curricula.updates) {
			await tx
				.update(courseCurricula)
				.set(row.set)
				.where(eq(courseCurricula.id, row.id));
		}

		const ids = new Map(
			(
				await tx
					.select({
						id: courseCurricula.id,
						courseId: courseCurricula.courseId,
						cohort: courseCurricula.cohort,
						code: courseCurricula.code,
					})
					.from(courseCurricula)
			).map(c => [`${c.courseId}\u0000${c.cohort}\u0000${c.code}`, c.id])
		);

		if (plans.deletes.length > 0) {
			await tx.delete(coursePlans).where(inArray(coursePlans.id, plans.deletes));
		}
		const rows = plans.inserts.map(({ curriculum, ...row }) => ({
			...row,
			curriculumId: ids.get(`${row.courseId}\u0000${row.cohort}\u0000${curriculum}`)!,
		}));
		for (let i = 0; i < rows.length; i += 500) {
			await tx.insert(coursePlans).values(rows.slice(i, i + 500));
		}
		for (const row of plans.updates) {
			await tx.update(coursePlans).set(row.set).where(eq(coursePlans.id, row.id));
		}
	});
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
				catalogueUrl: row.catalogueUrl,
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

console.log("Piani di studio per coorte…");
const cohorts = await readCohorts();
const cohortSource = { cohorts, attributes: source.rawAttributes };
const plans = planCohortPlans(await readLocal(), cohortSource);
summarisePlans(plans, cohorts);

if (!APPLY) {
	console.log("\nNiente scritto. Rilancia con --apply per applicarlo.");
} else if (
	additions.additions.length === 0 &&
	total(plan) === 0 &&
	planChanges(plans) === 0
) {
	console.log("\nGià allineato.");
} else {
	await applyAdditions(additions);
	const updates = planCatalogueUpdates(await readLocal(), source);
	await apply(updates);
	// The classes the additions created are only linkable once they exist.
	const planned = planCohortPlans(await readLocal(), cohortSource);
	await applyPlans(planned);
	// A re-plan after applying must be empty, or the apply missed something.
	const local = await readLocal();
	const left =
		planCatalogueAdditions(local, source).additions.length +
		total(planCatalogueUpdates(local, source)) +
		planChanges(planCohortPlans(local, cohortSource));
	if (left > 0) {
		console.error(`\nApplicato, ma ${left} righe restano da sistemare.`);
		process.exitCode = 1;
	} else {
		console.log(
			`\nApplicato: ${additions.additions.length} aggiunte, ${total(updates)} aggiornate, ${planChanges(planned)} righe di piano. Un secondo giro non trova più niente.`
		);
	}
}

await closeDb();
