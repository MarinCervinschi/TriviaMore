export type SeedLocation = {
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	campusLocation: Campus | null;
	isPrimary: boolean;
	position: number;
};

/** A department as `scripts/catalog/departments.json` holds it: what the official catalogue has no field for. */
export type SeedDepartment = {
	catalogueCode: string;
	code: string;
	name: string;
	area: string | null;
	description: string | null;
	position: number;
	locations: SeedLocation[] | null;
};

export type PopulateSourceCourse = {
	code: string;
	name: string;
	codicione: string | null;
	cfu: number | null;
	courseType: string | null;
	degreeClass: string | null;
	teachingLanguage: string | null;
	restrictedAccess: boolean | null;
	url: string;
	departmentCode: string | null;
	site: string | null;
};

type Campus = "MODENA" | "REGGIO_EMILIA" | "CARPI" | "MANTOVA";
type CourseType = "BACHELOR" | "MASTER" | "SINGLE_CYCLE";

export type NewCourseRow = {
	departmentCatalogueCode: string;
	code: string;
	name: string;
	nationalCode: string;
	courseType: CourseType;
	location: Campus | null;
	cfu: number | null;
	degreeClass: string | null;
	teachingLanguage: string | null;
	restrictedAccess: boolean | null;
	catalogueUrl: string;
	position: number;
};

export type PopulatePlan = {
	departments: SeedDepartment[];
	courses: NewCourseRow[];
	skipped: { otherType: number; otherDepartment: number; noNationalCode: number };
};

// The degree types the study catalogue holds; doctorates, masters and the filter semester stay out.
const COURSE_TYPES: Record<string, CourseType> = {
	L2: "BACHELOR",
	LM: "MASTER",
	LM5: "SINGLE_CYCLE",
	LM6: "SINGLE_CYCLE",
};

const CAMPUSES: Record<string, Campus> = {
	modena: "MODENA",
	"reggio emilia": "REGGIO_EMILIA",
	carpi: "CARPI",
	mantova: "MANTOVA",
};

/** The departments and courses to create so the catalogue holds every degree of the official one; never updates a row. */
export function planPopulate(
	local: { departmentCodes: Set<string>; courseNationalCodes: Set<string> },
	seed: SeedDepartment[],
	source: PopulateSourceCourse[]
): PopulatePlan {
	const known = new Set(seed.map(department => department.catalogueCode));
	const plan: PopulatePlan = {
		departments: seed.filter(
			department => !local.departmentCodes.has(department.catalogueCode)
		),
		courses: [],
		skipped: { otherType: 0, otherDepartment: 0, noNationalCode: 0 },
	};

	const seen = new Set(local.courseNationalCodes);
	const candidates: Omit<NewCourseRow, "position">[] = [];
	for (const course of source) {
		const courseType = course.courseType ? COURSE_TYPES[course.courseType] : undefined;
		if (!courseType) {
			plan.skipped.otherType++;
			continue;
		}
		if (!course.departmentCode || !known.has(course.departmentCode)) {
			plan.skipped.otherDepartment++;
			continue;
		}
		if (!course.codicione) {
			plan.skipped.noNationalCode++;
			continue;
		}
		if (seen.has(course.codicione)) continue;
		seen.add(course.codicione);
		candidates.push({
			departmentCatalogueCode: course.departmentCode,
			code: course.code,
			name: course.name,
			nationalCode: course.codicione,
			courseType,
			location: CAMPUSES[course.site?.toLowerCase() ?? ""] ?? null,
			cfu: course.cfu,
			degreeClass: course.degreeClass,
			teachingLanguage: course.teachingLanguage,
			restrictedAccess: course.restrictedAccess,
			catalogueUrl: course.url,
		});
	}

	candidates.sort(
		(a, b) =>
			a.departmentCatalogueCode.localeCompare(b.departmentCatalogueCode) ||
			a.name.localeCompare(b.name, "it")
	);
	const positions = new Map<string, number>();
	for (const candidate of candidates) {
		const position = positions.get(candidate.departmentCatalogueCode) ?? 0;
		positions.set(candidate.departmentCatalogueCode, position + 1);
		plan.courses.push({ ...candidate, position });
	}
	return plan;
}
