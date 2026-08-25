import { describe, expect, it } from "vitest";

import { buildProgressRollup } from "./rollup";
import type { AttemptHistoryEntry } from "./types";

function entry(over: Partial<AttemptHistoryEntry>): AttemptHistoryEntry {
	return {
		id: "a",
		quizId: "q1",
		score: 24,
		timeSpent: 60_000,
		completedAt: "2026-08-01T10:00:00Z",
		quizMode: "STUDY",
		sectionId: "sec1",
		sectionName: "Sezione 1",
		classId: "cls1",
		className: "Insegnamento 1",
		classCode: "INS1",
		courseId: "crs1",
		courseName: "Corso 1",
		courseCode: "CRS1",
		departmentId: "dep1",
		departmentName: "Dipartimento 1",
		departmentCode: "DEP1",
		...over,
	};
}

describe("buildProgressRollup", () => {
	it("is empty for no attempts", () => {
		expect(buildProgressRollup([])).toEqual([]);
	});

	it("skips attempts with a broken chain", () => {
		expect(buildProgressRollup([entry({ sectionId: null })])).toEqual([]);
		expect(buildProgressRollup([entry({ courseId: null })])).toEqual([]);
	});

	it("nests course → class → section and aggregates", () => {
		const tree = buildProgressRollup([
			entry({ id: "1", score: 20, timeSpent: 1000 }),
			entry({ id: "2", score: 30, timeSpent: 2000 }),
		]);
		expect(tree).toHaveLength(1);
		const course = tree[0]!;
		expect(course).toMatchObject({
			id: "crs1",
			quizzes: 2,
			avgGrade: 25,
			timeSpent: 3000,
		});
		expect(course.classes).toHaveLength(1);
		expect(course.classes[0]).toMatchObject({ id: "cls1", quizzes: 2, avgGrade: 25 });
		expect(course.classes[0]!.sections).toHaveLength(1);
		expect(course.classes[0]!.sections[0]).toMatchObject({
			id: "sec1",
			quizzes: 2,
			avgGrade: 25,
			timeSpent: 3000,
		});
	});

	it("separates sibling sections and sorts by name", () => {
		const tree = buildProgressRollup([
			entry({ id: "1", sectionId: "b", sectionName: "Beta" }),
			entry({ id: "2", sectionId: "a", sectionName: "Alfa" }),
		]);
		const sections = tree[0]!.classes[0]!.sections;
		expect(sections.map(s => s.name)).toEqual(["Alfa", "Beta"]);
	});

	it("treats a missing time as zero", () => {
		const tree = buildProgressRollup([entry({ timeSpent: null })]);
		expect(tree[0]!.timeSpent).toBe(0);
	});
});
