import type { DbOrTx } from "@/db";
import { classes, sections } from "@/db/schema";

import { primaryCourseByClass } from "./course-classes";

// The section → class → primary course → department tail shared by bookmarks,
// progress and recent attempts. It is what the `*_detail` views carried, and the
// subquery has to be built per query because it is joined, not selected from.
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
