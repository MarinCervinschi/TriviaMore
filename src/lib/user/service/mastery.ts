import { sql } from "drizzle-orm";

import { getDb } from "@/db";
import { sectionBrowsePath } from "@/lib/catalog/service";

import type { MasteryBreakdown, SectionAccuracy, UserMastery } from "../types";

// Don't rank a section on a handful of answers; weak/strong are the tails.
const MIN_ANSWERS = 5;
const WEAK_ACCURACY = 0.6;
const STRONG_ACCURACY = 0.75;
const SECTION_LIMIT = 6;

const DIFFICULTY_ORDER = ["EASY", "MEDIUM", "HARD"];

// The class's canonical course, same rule as `primaryCourseByClass`: lowest
// `position` wins. Inlined as a CTE so the aggregate can join it directly.
const PRIMARY_COURSE = sql`
	select distinct on (cc.class_id)
	       cc.class_id,
	       cc.code as class_code,
	       c.code as course_code,
	       c.name as course_name,
	       d.code as dept_code
	  from catalog.course_classes cc
	  join catalog.courses c on c.id = cc.course_id
	  join catalog.departments d on d.id = c.department_id
	 order by cc.class_id, cc.position
`;

export async function getMastery(userId: string): Promise<UserMastery> {
	const db = getDb();

	const [difficulty, sections] = await Promise.all([
		db.execute<{ key: string; total: number; correct: number }>(sql`
			select aa.difficulty as key,
			       count(*) filter (where aa.is_correct is not null)::int as total,
			       count(*) filter (where aa.is_correct)::int as correct
			  from quiz.answer_attempts aa
			  join quiz.quiz_attempts qa on qa.id = aa.quiz_attempt_id
			 where qa.user_id = ${userId} and aa.difficulty is not null
			 group by aa.difficulty
		`),
		// Every section the user has answered in, with enough answers to rank; the
		// weak/strong tails are split from this in TS.
		db.execute<{
			section_id: string;
			section_name: string | null;
			section_slug: string | null;
			course_name: string | null;
			class_code: string | null;
			course_code: string | null;
			dept_code: string | null;
			total: number;
			correct: number;
		}>(sql`
			with pc as (${PRIMARY_COURSE})
			select aa.section_id,
			       s.name as section_name, s.slug as section_slug,
			       pc.course_name, pc.class_code, pc.course_code, pc.dept_code,
			       count(*) filter (where aa.is_correct is not null)::int as total,
			       count(*) filter (where aa.is_correct)::int as correct
			  from quiz.answer_attempts aa
			  join quiz.quiz_attempts qa on qa.id = aa.quiz_attempt_id
			  join catalog.sections s on s.id = aa.section_id
			  left join pc on pc.class_id = s.class_id
			 where qa.user_id = ${userId} and aa.section_id is not null
			 group by aa.section_id, s.name, s.slug,
			          pc.course_name, pc.class_code, pc.course_code, pc.dept_code
			having count(*) filter (where aa.is_correct is not null) >= ${MIN_ANSWERS}
		`),
	]);

	const byDifficulty: MasteryBreakdown[] = [...difficulty.rows].sort(
		(a, b) => DIFFICULTY_ORDER.indexOf(a.key) - DIFFICULTY_ORDER.indexOf(b.key)
	);

	const ranked = sections.rows.map(row => ({
		section: {
			sectionId: row.section_id,
			sectionName: row.section_name,
			courseName: row.course_name,
			path: sectionBrowsePath({
				departmentCode: row.dept_code,
				courseCode: row.course_code,
				classCode: row.class_code,
				sectionSlug: row.section_slug,
			}),
			total: row.total,
			correct: row.correct,
		} satisfies SectionAccuracy,
		accuracy: row.total === 0 ? 0 : row.correct / row.total,
	}));

	const weakSections = ranked
		.filter(row => row.accuracy < WEAK_ACCURACY)
		.sort((a, b) => a.accuracy - b.accuracy)
		.slice(0, SECTION_LIMIT)
		.map(row => row.section);

	const strongSections = ranked
		.filter(row => row.accuracy >= STRONG_ACCURACY)
		.sort((a, b) => b.accuracy - a.accuracy)
		.slice(0, SECTION_LIMIT)
		.map(row => row.section);

	const totalAnswers = byDifficulty.reduce((sum, row) => sum + row.total, 0);

	return { totalAnswers, byDifficulty, weakSections, strongSections };
}
