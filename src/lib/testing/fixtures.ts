import { eq, sql } from "drizzle-orm";

import {
	classes,
	courseClasses,
	courseMaintainers,
	courses,
	departments,
	evaluationModes,
	profiles,
	sectionAccess,
	sections,
} from "@/db/schema";
import type { AuthUser } from "@/lib/auth/types";
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants";

import type { TestTx } from "./db";

function shortId() {
	return crypto.randomUUID().slice(0, 8);
}

// profiles.id references auth.users.id, so a profile needs a backing auth user.
// GoTrue's auth.users defaults every column but the id, and an on-insert trigger
// then creates the matching profile with the default STUDENT role. The role is
// reset by delete + insert rather than update: a BEFORE UPDATE trigger on
// profiles guards role changes and is off-limits to a plain fixture.
export async function createUser(
	tx: TestTx,
	role: AuthUser["role"] = "MAINTAINER"
): Promise<string> {
	const id = crypto.randomUUID();
	await tx.execute(sql`insert into auth.users (id) values (${id})`);
	await tx.delete(profiles).where(eq(profiles.id, id));
	await tx.insert(profiles).values({ id, role });
	return id;
}

export async function createDepartment(tx: TestTx): Promise<string> {
	const [row] = await tx
		.insert(departments)
		.values({ name: "Dip. Test", code: `D-${shortId()}` })
		.returning({ id: departments.id });
	return row.id;
}

export async function createCourse(tx: TestTx, departmentId: string): Promise<string> {
	const [row] = await tx
		.insert(courses)
		.values({ name: "Corso Test", code: `C-${shortId()}`, departmentId })
		.returning({ id: courses.id });
	return row.id;
}

async function createClass(tx: TestTx): Promise<string> {
	const [row] = await tx
		.insert(classes)
		.values({ name: "Insegnamento Test" })
		.returning({ id: classes.id });
	return row.id;
}

async function linkClassToCourse(
	tx: TestTx,
	courseId: string,
	classId: string
): Promise<void> {
	await tx
		.insert(courseClasses)
		.values({ courseId, classId, code: `CC-${shortId()}`, classYear: 1 });
}

async function createSection(
	tx: TestTx,
	classId: string,
	isPublic: boolean,
	// slug is generated from the name and is unique per class, so the name must
	// differ between sibling sections.
	name = `Sezione ${shortId()}`
): Promise<string> {
	const [row] = await tx
		.insert(sections)
		.values({ name, classId, isPublic })
		.returning({ id: sections.id });
	return row.id;
}

export type MaintainerScope = {
	maintainer: string;
	maintainedCourse: string;
	otherCourse: string;
	classInScope: string;
	classOutOfScope: string;
	publicSection: string;
	privateSection: string;
	sectionOutOfScope: string;
};

// A minimal catalog graph exercising the MAINTAINER scoping rules: one course
// the user maintains and one they do not, each with its own class and sections.
export async function seedMaintainerScope(tx: TestTx): Promise<MaintainerScope> {
	const maintainer = await createUser(tx, "MAINTAINER");
	const departmentId = await createDepartment(tx);
	const maintainedCourse = await createCourse(tx, departmentId);
	const otherCourse = await createCourse(tx, departmentId);

	const classInScope = await createClass(tx);
	const classOutOfScope = await createClass(tx);
	await linkClassToCourse(tx, maintainedCourse, classInScope);
	await linkClassToCourse(tx, otherCourse, classOutOfScope);

	await tx
		.insert(courseMaintainers)
		.values({ userId: maintainer, courseId: maintainedCourse });

	return {
		maintainer,
		maintainedCourse,
		otherCourse,
		classInScope,
		classOutOfScope,
		publicSection: await createSection(tx, classInScope, true),
		privateSection: await createSection(tx, classInScope, false),
		sectionOutOfScope: await createSection(tx, classOutOfScope, true),
	};
}

export type SectionAccessScope = {
	student: string;
	maintainer: string;
	admin: string;
	superadmin: string;
	publicSection: string;
	privateGranted: string;
	privateDenied: string;
};

// A student with one explicit grant, plus a public section and a private
// section they cannot reach: the three cases the section-access gate turns on.
// The other roles come along because the gate reads the role too.
export async function seedSectionAccessScope(tx: TestTx): Promise<SectionAccessScope> {
	const student = await createUser(tx, "STUDENT");
	const maintainer = await createUser(tx, "MAINTAINER");
	const admin = await createUser(tx, "ADMIN");
	const superadmin = await createUser(tx, "SUPERADMIN");
	const classId = await createClass(tx);

	const publicSection = await createSection(tx, classId, true);
	const privateGranted = await createSection(tx, classId, false);
	const privateDenied = await createSection(tx, classId, false);

	await tx.insert(sectionAccess).values({ userId: student, sectionId: privateGranted });

	return {
		student,
		maintainer,
		admin,
		superadmin,
		publicSection,
		privateGranted,
		privateDenied,
	};
}

export type SectionCountScope = {
	student: string;
	admin: string;
	courseId: string;
	classId: string;
	publicSections: string[];
	privateSection: string;
	sentinel: string;
};

// One class carrying every kind of section at once: the shape that made the
// catalogue count disagree with the list beside it.
export async function seedSectionCountScope(tx: TestTx): Promise<SectionCountScope> {
	const student = await createUser(tx, "STUDENT");
	const admin = await createUser(tx, "ADMIN");
	const departmentId = await createDepartment(tx);
	const courseId = await createCourse(tx, departmentId);
	const classId = await createClass(tx);
	await linkClassToCourse(tx, courseId, classId);

	return {
		student,
		admin,
		courseId,
		classId,
		publicSections: [
			await createSection(tx, classId, true),
			await createSection(tx, classId, true),
		],
		privateSection: await createSection(tx, classId, false),
		sentinel: await createSection(tx, classId, true, EXAM_SIMULATION_SECTION),
	};
}

export type QuizScope = {
	owner: string;
	stranger: string;
	sectionId: string;
	evaluationModeId: string;
};

export async function seedQuizScope(tx: TestTx): Promise<QuizScope> {
	const classId = await createClass(tx);
	const [mode] = await tx
		.insert(evaluationModes)
		.values({ name: `Modalità ${shortId()}` })
		.returning({ id: evaluationModes.id });

	return {
		owner: await createUser(tx, "STUDENT"),
		stranger: await createUser(tx, "STUDENT"),
		sectionId: await createSection(tx, classId, true),
		evaluationModeId: mode.id,
	};
}
