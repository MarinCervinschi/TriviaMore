// Names the curricula the catalogue only labels with a code or an acronym, from the hand-written course_classes.curriculum; writes only with --apply.
//
//   pnpm catalog:recover-names            cosa cambierebbe
//   pnpm catalog:recover-names --apply    applicalo
import { and, eq, isNotNull } from "drizzle-orm";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	courseClasses,
	courseCurricula,
	coursePlans,
	courses,
} from "../../src/db/schema/index.ts";
import { curriculumName } from "../../src/lib/catalog/sync/curricula.ts";

const APPLY = process.argv.includes("--apply");
const MIN_ROWS = 2;

const isWeak = (name: string, code: string) =>
	name === code || /^[A-Z]{1,5}$/.test(name);

const db = getDb();
const rows = await db
	.select({
		id: courseCurricula.id,
		courseId: courseCurricula.courseId,
		cohort: courseCurricula.cohort,
		code: courseCurricula.code,
		name: courseCurricula.name,
		courseCode: courses.code,
		courseName: courses.name,
		value: courseClasses.curriculum,
	})
	.from(courseCurricula)
	.innerJoin(courses, eq(courses.id, courseCurricula.courseId))
	.innerJoin(coursePlans, eq(coursePlans.curriculumId, courseCurricula.id))
	.innerJoin(
		courseClasses,
		and(
			eq(courseClasses.courseId, coursePlans.courseId),
			eq(courseClasses.classId, coursePlans.classId)
		)
	)
	.where(and(eq(courseCurricula.common, false), isNotNull(courseClasses.curriculum)));

const byCurriculum = new Map<
	string,
	{ row: (typeof rows)[number]; values: Map<string, number> }
>();
for (const row of rows) {
	const entry = byCurriculum.get(row.id) ?? { row, values: new Map() };
	entry.values.set(row.value!, (entry.values.get(row.value!) ?? 0) + 1);
	byCurriculum.set(row.id, entry);
}

const siblingValues = new Map<string, Map<string, Set<string>>>();
for (const { row, values } of byCurriculum.values()) {
	const k = `${row.courseId}\u0000${row.cohort}`;
	const cohort = siblingValues.get(k) ?? new Map<string, Set<string>>();
	for (const value of values.keys()) {
		cohort.set(value, (cohort.get(value) ?? new Set()).add(row.id));
	}
	siblingValues.set(k, cohort);
}

const renames: { id: string; label: string; from: string; to: string }[] = [];
for (const { row, values } of byCurriculum.values()) {
	if (!isWeak(row.name, row.code)) continue;
	const cohort = siblingValues.get(`${row.courseId}\u0000${row.cohort}`)!;
	const own = [...values].filter(([value]) => cohort.get(value)!.size === 1);
	if (own.length !== 1 || own[0]![1] < MIN_ROWS) continue;
	const name = curriculumName([own[0]![0]], row.courseName, row.code, false);
	if (name === row.code || name === row.name) continue;
	renames.push({
		id: row.id,
		label: `${row.courseCode} ${row.cohort} ${row.code}`,
		from: row.name,
		to: name,
	});
}

renames.sort((a, b) => a.label.localeCompare(b.label));
for (const rename of renames) {
	console.log(`  ${rename.label.padEnd(24)} ${rename.from.padEnd(10)} → ${rename.to}`);
}
console.log(`\n${renames.length} curriculum da rinominare.`);

if (!APPLY) {
	console.log("Niente scritto. Rilancia con --apply per applicarlo.");
} else if (renames.length > 0) {
	await db.transaction(async tx => {
		for (const rename of renames) {
			await tx
				.update(courseCurricula)
				.set({ name: rename.to })
				.where(eq(courseCurricula.id, rename.id));
		}
	});
	console.log("Applicato.");
}

await closeDb();
