import { asc } from "drizzle-orm";

import { getDb } from "@/db";
import { courses, departments } from "@/db/schema";

import type { GraphData } from "../types";

export async function getGraphData(): Promise<GraphData> {
	const db = getDb();

	const [departmentNodes, courseNodes] = await Promise.all([
		db
			.select({
				id: departments.id,
				code: departments.code,
				name: departments.name,
				area: departments.area,
			})
			.from(departments)
			.orderBy(asc(departments.position)),
		db
			.select({
				id: courses.id,
				code: courses.code,
				name: courses.name,
				departmentId: courses.departmentId,
				courseType: courses.courseType,
				location: courses.location,
			})
			.from(courses)
			.orderBy(asc(courses.position)),
	]);

	return { departments: departmentNodes, courses: courseNodes };
}
