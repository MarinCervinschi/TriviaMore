import type {
	CampusLocation,
	CourseType,
	DepartmentArea,
	GraphData,
} from "@/lib/browse/types";

export interface GraphFiltersState {
	areas: Set<DepartmentArea>;
	campuses: Set<CampusLocation>;
	courseTypes: Set<CourseType>;
}

export interface GraphFilterResult {
	/** Node + edge IDs to merge into reagraph's `actives` array. */
	activeIds: string[];
	/** Number of departments matched by the filter. */
	deptCount: number;
	/** Number of courses matched by the filter. */
	courseCount: number;
	/** Whether at least one filter is active. */
	hasActiveFilter: boolean;
}

const ROOT_NODE_ID = "unimore";

export function createEmptyFiltersState(): GraphFiltersState {
	return {
		areas: new Set(),
		campuses: new Set(),
		courseTypes: new Set(),
	};
}

export function isFiltersStateEmpty(filters: GraphFiltersState): boolean {
	return (
		filters.areas.size === 0 &&
		filters.campuses.size === 0 &&
		filters.courseTypes.size === 0
	);
}

/**
 * Computes which graph nodes/edges should be highlighted ("activated") by the
 * current filter state. The filter does not hide nodes — it produces a list of
 * IDs that get merged into reagraph's `actives` so the matching subset gets the
 * same active styling used for hover/selection.
 *
 * Empty filter state → empty result (graph at rest).
 */
export function computeFilterActives(
	data: GraphData,
	filters: GraphFiltersState
): GraphFilterResult {
	if (isFiltersStateEmpty(filters)) {
		return { activeIds: [], deptCount: 0, courseCount: 0, hasActiveFilter: false };
	}

	const { areas, campuses, courseTypes } = filters;
	const hasArea = areas.size > 0;
	const hasCampus = campuses.size > 0;
	const hasType = courseTypes.size > 0;

	// 1. Departments matching area filter (or all if area filter is off).
	const deptAreaMatch = new Map<string, boolean>();
	for (const d of data.departments) {
		deptAreaMatch.set(d.id, !hasArea || (d.area != null && areas.has(d.area)));
	}

	// 2. Courses matching all active filters AND living in an area-matched dept.
	const matchingCourses = data.courses.filter(c => {
		if (!deptAreaMatch.get(c.departmentId)) return false;
		if (hasCampus && (c.location == null || !campuses.has(c.location))) return false;
		if (hasType && !courseTypes.has(c.courseType)) return false;
		return true;
	});

	// 3. Departments are active if their area matches AND (area-only filter OR
	//    they have at least one matching course).
	const courseOnlyAreaFilter = hasArea && !hasCampus && !hasType;
	const deptsWithMatchingCourses = new Set(matchingCourses.map(c => c.departmentId));
	const activeDeptIds = new Set<string>();
	for (const d of data.departments) {
		if (!deptAreaMatch.get(d.id)) continue;
		if (courseOnlyAreaFilter || deptsWithMatchingCourses.has(d.id)) {
			activeDeptIds.add(d.id);
		}
	}

	// 4. Build the active IDs list (nodes + connecting edges).
	const ids: string[] = [];

	if (activeDeptIds.size > 0) {
		ids.push(ROOT_NODE_ID);
	}

	for (const deptId of activeDeptIds) {
		ids.push(`dept-${deptId}`);
		ids.push(`root-dept-${deptId}`);
	}

	for (const c of matchingCourses) {
		if (!activeDeptIds.has(c.departmentId)) continue;
		ids.push(`course-${c.id}`);
		ids.push(`dept-course-${c.id}`);
		ids.push(`root-course-${c.id}`);
	}

	return {
		activeIds: ids,
		deptCount: activeDeptIds.size,
		courseCount: matchingCourses.filter(c => activeDeptIds.has(c.departmentId)).length,
		hasActiveFilter: true,
	};
}
