import type { DbOrTx } from "@/db";
import { classes, sections } from "@/db/schema";

import { primaryCourseByClass } from "./course-classes";

// Built per query, because the subquery is joined and not selected from.
export function sectionLocation(db: DbOrTx) {
	const primaryCourse = primaryCourseByClass(db);

	return {
		primaryCourse,
		columns: {
			sectionId: sections.id,
			sectionName: sections.name,
			classId: classes.id,
			className: classes.name,
			courseId: primaryCourse.courseId,
			courseName: primaryCourse.courseName,
			departmentId: primaryCourse.departmentId,
			departmentName: primaryCourse.departmentName,
		},
	};
}
