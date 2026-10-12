// Creates the departments of departments.json and every degree course of the official catalogue they lack; writes only with --apply.
import { isNotNull } from "drizzle-orm";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	courses,
	departmentLocations,
	departments,
} from "../../src/db/schema/index.ts";
import { academicYearOf } from "../../src/lib/catalog/academic-year.ts";
import {
	type PopulatePlan,
	type SeedDepartment,
	planPopulate,
} from "../../src/lib/catalog/sync/populate.ts";
import { fetchCourses, setCacheDir } from "./source.ts";

// A fresh cache per run, so a plan never reads a response from an earlier one.
const cacheDir = await mkdtemp(join(tmpdir(), "triviamore-catalog-"));
setCacheDir(cacheDir);

const APPLY = process.argv.includes("--apply");
const YEAR = String(academicYearOf(new Date()));
const seed = JSON.parse(
	await readFile(join(import.meta.dirname, "departments.json"), "utf8")
) as SeedDepartment[];

const db = getDb();
const source = await fetchCourses(YEAR);

async function plan(): Promise<PopulatePlan> {
	const [departmentRows, courseRows] = await Promise.all([
		db
			.select({ code: departments.catalogueCode })
			.from(departments)
			.where(isNotNull(departments.catalogueCode)),
		db
			.select({ code: courses.nationalCode })
			.from(courses)
			.where(isNotNull(courses.nationalCode)),
	]);
	return planPopulate(
		{
			departmentCodes: new Set(departmentRows.map(row => row.code!)),
			courseNationalCodes: new Set(courseRows.map(row => row.code!)),
		},
		seed,
		source
	);
}

const first = await plan();
console.log(`  anno             ${YEAR}`);
console.log(`  dipartimenti     ${first.departments.length} da creare`);
console.log(`  corsi            ${first.courses.length} da creare`);
console.log(
	`  esclusi          ${first.skipped.otherType} di altro tipo, ${first.skipped.otherDepartment} di altri dipartimenti, ${first.skipped.noNationalCode} senza codice nazionale`
);

if (!APPLY) {
	console.log("\nNiente scritto. Rilancia con --apply per applicarlo.");
} else {
	await db.transaction(async tx => {
		for (const department of first.departments) {
			const [row] = await tx
				.insert(departments)
				.values({
					catalogueCode: department.catalogueCode,
					code: department.code,
					name: department.name,
					area: department.area as (typeof departments.$inferInsert)["area"],
					description: department.description,
					position: department.position,
				})
				.returning({ id: departments.id });
			if (department.locations?.length) {
				await tx.insert(departmentLocations).values(
					department.locations.map(location => ({
						...location,
						departmentId: row!.id,
						latitude: String(location.latitude),
						longitude: String(location.longitude),
					}))
				);
			}
		}
		const ids = new Map(
			(
				await tx
					.select({ id: departments.id, code: departments.catalogueCode })
					.from(departments)
			).map(row => [row.code, row.id])
		);
		if (first.courses.length > 0) {
			await tx.insert(courses).values(
				first.courses.map(({ departmentCatalogueCode, ...course }) => ({
					...course,
					departmentId: ids.get(departmentCatalogueCode)!,
				}))
			);
		}
	});
	const left = await plan();
	const remaining = left.departments.length + left.courses.length;
	console.log(
		remaining === 0
			? "\nApplicato."
			: `\nApplicato, ma ${remaining} righe restano da creare.`
	);
	if (remaining > 0) process.exitCode = 1;
}

await rm(cacheDir, { recursive: true, force: true });
await closeDb();
