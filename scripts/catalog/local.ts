// Reads our catalogue inside a READ ONLY transaction, so this script cannot write.
import { Pool } from "pg";

import type { LocalClass } from "../../src/lib/catalog/sync/diff.ts";

export type LocalCourse = {
	code: string;
	name: string;
	cfu: number | null;
	courseType: string;
	departmentCode: string;
};

const CLASSES = `
	select co.code as course_code, co.name as course_name, cc.code, cl.name,
	       cl.cfu, cc.class_year, cc.mandatory, cc.curriculum
	from catalog.course_classes cc
	join catalog.courses co on co.id = cc.course_id
	join catalog.classes cl on cl.id = cc.class_id
`;

const COURSES = `
	select co.code, co.name, co.cfu, co.course_type, d.code as department_code
	from catalog.courses co
	join catalog.departments d on d.id = co.department_id
`;

export async function readLocalCatalog(): Promise<{
	classes: LocalClass[];
	courses: LocalCourse[];
}> {
	const url = process.env.DATABASE_URL;
	if (!url)
		throw new Error("DATABASE_URL non impostata — lancia con pnpm catalog:diff");

	const pool = new Pool({ connectionString: url, max: 1 });
	const client = await pool.connect();
	try {
		await client.query("begin transaction read only");
		const classes = await client.query(CLASSES);
		const courses = await client.query(COURSES);
		await client.query("commit");

		return {
			classes: classes.rows.map(row => ({
				courseCode: row.course_code,
				courseName: row.course_name,
				code: row.code,
				name: row.name,
				cfu: row.cfu,
				classYear: row.class_year,
				mandatory: row.mandatory,
				curriculum: row.curriculum,
			})),
			courses: courses.rows.map(row => ({
				code: row.code,
				name: row.name,
				cfu: row.cfu,
				courseType: row.course_type,
				departmentCode: row.department_code,
			})),
		};
	} finally {
		client.release();
		await pool.end();
	}
}
