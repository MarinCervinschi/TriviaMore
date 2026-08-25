import { type SQL, sql } from "drizzle-orm";

import type { MasteryScope } from "../schemas";

/**
 * Narrows a snapshot `section_id` column to a content scope, via the snapshot →
 * live chain (a section never moves class/course, so this stays stable). A
 * course means the sections whose class's *primary* course is that course.
 */
export function sectionScopeSql(scope: MasteryScope | undefined, col: SQL): SQL {
	if (!scope) return sql``;
	if (scope.level === "section") return sql` and ${col} = ${scope.id}`;
	if (scope.level === "class") {
		return sql` and ${col} in (
			select id from catalog.sections where class_id = ${scope.id}
		)`;
	}
	return sql` and ${col} in (
		select s.id from catalog.sections s
		 where s.class_id in (
			select pc.class_id from (
				select distinct on (cc.class_id) cc.class_id, cc.course_id
				  from catalog.course_classes cc
				 order by cc.class_id, cc.position
			) pc
			where pc.course_id = ${scope.id}
		)
	)`;
}
