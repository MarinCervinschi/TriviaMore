import type { Career, CareerChoiceGroup, CareerExam } from "@/lib/crm/types";

const STAMP = "2026-09-01T10:00:00.000Z";

type Line = Pick<CareerExam, "name" | "cfu" | "classYear"> &
	Partial<Omit<CareerExam, "name" | "cfu" | "classYear">>;

let next = 0;
function exam(line: Line): CareerExam {
	next += 1;
	return {
		id: `exam-${next}`,
		enrollmentId: "enrollment-aie",
		classId: null,
		planCode: null,
		groupCode: null,
		graded: true,
		external: false,
		status: "PLANNED",
		grade: null,
		honours: false,
		examDate: null,
		position: next,
		createdAt: STAMP,
		updatedAt: STAMP,
		...line,
	};
}

const FIRST_B = "F:4";
const FIRST_C = "F:7";
const FIRST_D = "F:10";
const SECOND_B = "F:5";
const SECOND_C = "F:8";
const SECOND_D = "F:11";

const group = (
	code: string,
	label: string,
	classYear: number,
	options: [string, string, number][]
): CareerChoiceGroup => ({
	code,
	label,
	classYear,
	options: options.map(([planCode, name, cfu]) => ({
		planCode,
		name,
		cfu,
		graded: true,
	})),
	chosen: [],
});

const GROUPS: CareerChoiceGroup[] = [
	group(FIRST_B, "I anno scelta taf B APP APPR (fra 1 e 99 CFU)", 1, [
		["AIE-001R", "Big Data and Text Analysis", 9],
		["AIE-012R", "Graph Analytics", 9],
		["AIE-011R", "Multimedia Data Processing", 9],
		["AIE-004R", "Progettazione del Software", 9],
		["AIE-005R", "Progettazione di Sistemi Operativi", 9],
		["AIE-014R", "Real-Time Embedded Systems", 9],
		["AIE-013R", "Sicurezza Informatica", 9],
	]),
	group(FIRST_C, "I anno scelta taf C APP APPR (fra 1 e 99 CFU)", 1, [
		["AIE-006R", "Applications of Ai/Ml in Operation and Supply Chain Management", 6],
		["AIE-007R", "Digitalizzazione e Diritto", 6],
		["AIE-015R", "Matematica Discreta", 6],
		["AIE-008R", "Metodi Matematici per il Machine Learning", 6],
		["AIE-009R", "Neuroscience", 6],
		["AIE-016R", "Tecnologie di Infrastrutture di Reti", 6],
	]),
	group(FIRST_D, "I anno scelta taf D APP APPR (fra 1 e 99 CFU)", 1, [
		["AIE-017R", "Informatica Industriale", 6],
	]),
	group(SECOND_B, "II anno scelta taf B APP APPR (fra 1 e 99 CFU)", 2, [
		["AIE-020R", "Big Data Management", 9],
		["AIE-025R", "Business Intelligence", 9],
		["AIE-019R", "Distributed Artificial Intelligence", 9],
		["AIE-028R", "Distributed Edge Programming", 9],
		["AIE-027R", "Scalable ai", 9],
		["AIE-021R", "Sistemi e Applicazioni Cloud", 9],
	]),
	group(SECOND_C, "II anno scelta taf C APP APPR (fra 1 e 99 CFU)", 2, [
		["AIE-022R", "Automotive Connectivity", 6],
		["AIE-029R", "Hmi for Digital Application", 6],
	]),
	group(SECOND_D, "II anno scelta taf D APP APPR (fra 1 e 99 CFU)", 2, [
		["AIE-024R", "Automotive Cyber Security", 6],
	]),
];

const MANDATORY: Line[] = [
	{
		name: "Computer Vision and Cognitive Systems",
		cfu: 9,
		classYear: 1,
		planCode: "AIE-010R",
	},
	{
		name: "Iot and 3d Intelligent Systems",
		cfu: 9,
		classYear: 1,
		planCode: "AIE-003R",
	},
	{
		name: "Machine Learning and Deep Learning",
		cfu: 9,
		classYear: 1,
		planCode: "AIE-002R",
	},
	{ name: "Ai for Bioinformatics", cfu: 9, classYear: 2, planCode: "AIE-018R" },
	{
		name: "Final Examination",
		cfu: 18,
		classYear: 2,
		planCode: "AIE-031R",
		graded: false,
	},
	{ name: "Smart Robotics", cfu: 9, classYear: 2, planCode: "AIE-026R" },
	{
		name: "Traineeship/Design Activity",
		cfu: 9,
		classYear: 2,
		planCode: "AIE-030R",
		graded: false,
	},
];

const passed = (grade: number, examDate: string, honours = false) =>
	({ status: "PASSED", grade, honours, examDate }) as const;

const RECORD: CareerExam[] = [
	exam({ ...MANDATORY[0]!, ...passed(28, "2026-01-22") }),
	exam({ ...MANDATORY[1]!, ...passed(30, "2026-02-10", true) }),
	exam({ ...MANDATORY[2]!, ...passed(27, "2026-06-18") }),
	exam({
		name: "Big Data and Text Analysis",
		cfu: 9,
		classYear: 1,
		planCode: "AIE-001R",
		groupCode: FIRST_B,
		...passed(26, "2026-07-03"),
	}),
	exam({
		name: "Metodi Matematici per il Machine Learning",
		cfu: 6,
		classYear: 1,
		planCode: "AIE-008R",
		groupCode: FIRST_C,
		status: "REJECTED",
		grade: 21,
		examDate: "2026-07-15",
	}),
	exam({
		name: "Informatica Industriale",
		cfu: 6,
		classYear: 1,
		planCode: "AIE-017R",
		groupCode: FIRST_D,
		...passed(24, "2026-02-24"),
	}),
	exam({ ...MANDATORY[3]! }),
	exam({ ...MANDATORY[4]! }),
	exam({ ...MANDATORY[5]! }),
	exam({ ...MANDATORY[6]! }),
	exam({
		name: "Inglese B2",
		cfu: 3,
		classYear: null,
		graded: false,
		status: "PASSED",
		examDate: "2025-12-05",
	}),
];

const withChoices = (exams: CareerExam[]) =>
	GROUPS.map(g => ({
		...g,
		chosen: exams.filter(e => e.groupCode === g.code).map(e => e.id),
	}));

const BASE: Omit<Career, "exams" | "choiceGroups" | "missingMandatory" | "planGap"> = {
	settingsSaved: false,
	course: {
		id: "course-aie",
		code: "20-262",
		name: "Artificial Intelligence Engineering",
		cfu: 120,
		courseType: "MASTER",
		location: "MODENA",
		degreeClass: "LM-32",
		teachingLanguage: "eng",
		catalogueUrl: "https://unimore.coursecatalogue.cineca.it/corsi/2026/10968",
		department: {
			id: "dept-dief",
			name: 'Dipartimento di Ingegneria "Enzo Ferrari"',
			code: "DIEF",
		},
	},
	cohort: 2025,
	curriculumName: "Applications",
	settings: {
		honoursGrade: 30,
		honoursBonus: 0,
		honoursBonusCap: 0,
		thesis: 0,
		inCorso: 0,
		erasmus: 0,
		other: 0,
	},
};

/** A second-year student a few exams in: one honours, one rejected grade, the choice groups half filled. */
export const CAREER: Career = {
	...BASE,
	planGap: null,
	missingMandatory: 0,
	exams: RECORD,
	choiceGroups: withChoices(RECORD),
	settings: { ...BASE.settings, thesis: 7, inCorso: 2 },
	settingsSaved: true,
};

/** The same record before the student has saved any grading rule. */
export const CAREER_NO_RULES: Career = {
	...CAREER,
	settings: BASE.settings,
	settingsSaved: false,
};

/** The enrolment is linked and the plan is known, but the record is still empty. */
export const CAREER_EMPTY: Career = {
	...BASE,
	planGap: null,
	missingMandatory: MANDATORY.length,
	exams: [],
	choiceGroups: withChoices([]),
};

/** The cohort has several curricula and the student has not picked one, so nothing can be prefilled. */
export const CAREER_NO_CURRICULUM: Career = {
	...BASE,
	curriculumName: null,
	planGap: "no-curriculum",
	missingMandatory: 0,
	exams: [],
	choiceGroups: [],
};

export const CURRICULUM_OPTIONS = [
	{ id: "cur-app", code: "APP", name: "Applications" },
	{ id: "cur-mod", code: "MOD", name: "Models and Methods" },
];

const searchRow = (
	id: string,
	name: string,
	cfu: number,
	classYear: number,
	course: { id: string; name: string; code: string }
) => ({
	id,
	name,
	description: null,
	cfu,
	code: id,
	classYear,
	mandatory: false,
	course: {
		...course,
		department: { code: "DIEF", name: BASE.course.department.name },
	},
	sectionCount: 0,
});

const AIE = {
	id: "course-aie",
	name: "Artificial Intelligence Engineering",
	code: "20-373",
};

/** What `browseQueries.searchClasses` returns for the student's own course, with no query. */
export const CLASS_SEARCH = {
	data: [
		searchRow("class-1", "Computer Vision and Cognitive Systems", 9, 1, AIE),
		searchRow("class-2", "Graph Analytics", 9, 1, AIE),
		searchRow("class-3", "Neuroscience", 6, 1, AIE),
		searchRow("class-4", "Scalable ai", 9, 2, AIE),
		searchRow("class-5", "Automotive Connectivity", 6, 2, AIE),
	],
	total: 5,
};
