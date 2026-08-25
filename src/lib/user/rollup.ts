import type { AttemptHistoryEntry } from "./types";

export type RollupNode = {
	id: string;
	name: string;
	quizzes: number;
	/** Mean attempt grade on the 0–33 scale. */
	avgGrade: number;
	/** Total quiz time, in ms. */
	timeSpent: number;
};

export type RollupSection = RollupNode;
export type RollupClass = RollupNode & { sections: RollupSection[] };
export type RollupCourse = RollupNode & { classes: RollupClass[] };

type Acc = {
	name: string;
	quizzes: number;
	gradeSum: number;
	timeSum: number;
};

function bump(acc: Acc, attempt: AttemptHistoryEntry) {
	acc.quizzes += 1;
	acc.gradeSum += attempt.score;
	acc.timeSum += attempt.timeSpent ?? 0;
}

function finalize(acc: Acc, id: string): RollupNode {
	return {
		id,
		name: acc.name,
		quizzes: acc.quizzes,
		avgGrade: acc.quizzes === 0 ? 0 : Number((acc.gradeSum / acc.quizzes).toFixed(1)),
		timeSpent: acc.timeSum,
	};
}

/**
 * Rolls the flat attempt list up into a course → insegnamento → sezione tree,
 * with per-node quizzes / mean grade / time. Only attempts whose whole chain is
 * live are placed (a deleted section snapshots to a null link and can't be
 * navigated to); they still count on the history and trend.
 */
export function buildProgressRollup(attempts: AttemptHistoryEntry[]): RollupCourse[] {
	type ClassAcc = Acc & { sections: Map<string, Acc> };
	type CourseAcc = Acc & { classes: Map<string, ClassAcc> };
	const courses = new Map<string, CourseAcc>();

	for (const attempt of attempts) {
		const { courseId, classId, sectionId } = attempt;
		if (!courseId || !classId || !sectionId) continue;

		let course = courses.get(courseId);
		if (!course) {
			course = {
				name: attempt.courseName ?? "—",
				quizzes: 0,
				gradeSum: 0,
				timeSum: 0,
				classes: new Map(),
			};
			courses.set(courseId, course);
		}
		bump(course, attempt);

		let klass = course.classes.get(classId);
		if (!klass) {
			klass = {
				name: attempt.className ?? "—",
				quizzes: 0,
				gradeSum: 0,
				timeSum: 0,
				sections: new Map(),
			};
			course.classes.set(classId, klass);
		}
		bump(klass, attempt);

		let section = klass.sections.get(sectionId);
		if (!section) {
			section = {
				name: attempt.sectionName ?? "—",
				quizzes: 0,
				gradeSum: 0,
				timeSum: 0,
			};
			klass.sections.set(sectionId, section);
		}
		bump(section, attempt);
	}

	const byName = (a: RollupNode, b: RollupNode) => a.name.localeCompare(b.name);

	return [...courses]
		.map(([courseId, course]) => ({
			...finalize(course, courseId),
			classes: [...course.classes]
				.map(([classId, klass]) => ({
					...finalize(klass, classId),
					sections: [...klass.sections]
						.map(([sectionId, section]) => finalize(section, sectionId))
						.sort(byName),
				}))
				.sort(byName),
		}))
		.sort(byName);
}
