import { sql } from "drizzle-orm";

import { getDb } from "@/db";
import { sectionBrowsePath } from "@/lib/catalog/service";

import type { MasteryInput } from "../schemas";
import type { MasteryBreakdown, SectionAccuracy, UserMastery } from "../types";
import { sectionScopeSql } from "./scope";

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

export async function getMastery(
	userId: string,
	input?: MasteryInput
): Promise<UserMastery> {
	const db = getDb();
	const scope = input?.scope;
	const windowed = input?.from
		? sql` and qa.completed_at >= ${input.from}::date`
		: sql``;
	const byMode = input?.mode ? sql` and qa.quiz_mode = ${input.mode}` : sql``;
	const scoped = sectionScopeSql(scope, sql`qa.section_id`);

	const ATTEMPT_TIME = sql`
		select qa.section_id,
		       round(sum(qa.time_spent) / 1000.0)::int as time_sec
		  from quiz.quiz_attempts qa
		 where qa.user_id = ${userId} and qa.time_spent is not null${windowed}${byMode}
		 group by qa.section_id
	`;

	const [difficulty, sections, timeTotal] = await Promise.all([
		db.execute<{ key: string; total: number; correct: number }>(sql`
			select aa.difficulty as key,
			       count(*) filter (where aa.is_correct is not null)::int as total,
			       count(*) filter (where aa.is_correct)::int as correct
			  from quiz.answer_attempts aa
			  join quiz.quiz_attempts qa on qa.id = aa.quiz_attempt_id
			 where qa.user_id = ${userId} and aa.difficulty is not null${scoped}${windowed}${byMode}
			 group by aa.difficulty
			having count(*) filter (where aa.is_correct is not null) > 0
		`),

		db.execute<{
			section_id: string;
			section_name: string | null;
			section_slug: string | null;
			class_name: string | null;
			class_code: string | null;
			course_code: string | null;
			dept_code: string | null;
			total: number;
			correct: number;
			time_sec: number | null;
		}>(sql`
			with pc as (${PRIMARY_COURSE}), at as (${ATTEMPT_TIME})
			select qa.section_id,
			       s.name as section_name, s.slug as section_slug,
			       k.name as class_name,
			       pc.class_code, pc.course_code, pc.dept_code,
			       count(*) filter (where aa.is_correct is not null)::int as total,
			       count(*) filter (where aa.is_correct)::int as correct,
			       at.time_sec
			  from quiz.answer_attempts aa
			  join quiz.quiz_attempts qa on qa.id = aa.quiz_attempt_id
			  join catalog.sections s on s.id = qa.section_id
			  left join catalog.classes k on k.id = s.class_id
			  left join pc on pc.class_id = s.class_id
			  left join at on at.section_id = qa.section_id
			 where qa.user_id = ${userId} and qa.section_id is not null${scoped}${windowed}${byMode}
			 group by qa.section_id, s.name, s.slug, k.name,
			          pc.class_code, pc.course_code, pc.dept_code, at.time_sec
			having count(*) filter (where aa.is_correct is not null) >= ${MIN_ANSWERS}
		`),
		db.execute<{ time_sec: number | null }>(sql`
			select round(sum(qa.time_spent) / 1000.0)::int as time_sec
			  from quiz.quiz_attempts qa
			 where qa.user_id = ${userId} and qa.time_spent is not null${scoped}${windowed}${byMode}
		`),
	]);

	const byDifficulty: MasteryBreakdown[] = [...difficulty.rows].sort(
		(a, b) => DIFFICULTY_ORDER.indexOf(a.key) - DIFFICULTY_ORDER.indexOf(b.key)
	);

	const ranked = sections.rows.map(row => ({
		section: {
			sectionId: row.section_id,
			sectionName: row.section_name,
			courseCode: row.course_code,
			className: row.class_name,
			path: sectionBrowsePath({
				departmentCode: row.dept_code,
				courseCode: row.course_code,
				classCode: row.class_code,
				sectionSlug: row.section_slug,
			}),
			total: row.total,
			correct: row.correct,
			avgSeconds:
				row.time_sec != null && row.total > 0
					? Math.round(row.time_sec / row.total)
					: null,
		} satisfies SectionAccuracy,
		accuracy: row.total === 0 ? 0 : row.correct / row.total,
	}));

	// Ties on accuracy (e.g. a wall of 0%) are broken by the sample size — more
	// answers is a firmer signal — then by name, so the order is deterministic.
	const byName = (a: (typeof ranked)[number], b: (typeof ranked)[number]) =>
		(a.section.sectionName ?? "").localeCompare(b.section.sectionName ?? "");

	const weakSections = ranked
		.filter(row => row.accuracy < WEAK_ACCURACY)
		.sort(
			(a, b) =>
				a.accuracy - b.accuracy || b.section.total - a.section.total || byName(a, b)
		)
		.slice(0, SECTION_LIMIT)
		.map(row => row.section);

	const strongSections = ranked
		.filter(row => row.accuracy >= STRONG_ACCURACY)
		.sort(
			(a, b) =>
				b.accuracy - a.accuracy || b.section.total - a.section.total || byName(a, b)
		)
		.slice(0, SECTION_LIMIT)
		.map(row => row.section);

	const totalAnswers = byDifficulty.reduce((sum, row) => sum + row.total, 0);
	const timeSec = timeTotal.rows[0]?.time_sec ?? 0;
	const avgSecondsPerQuestion =
		totalAnswers > 0 && timeSec > 0 ? Math.round(timeSec / totalAnswers) : null;

	return {
		totalAnswers,
		avgSecondsPerQuestion,
		byDifficulty,
		sections: [...ranked].sort(byName).map(row => row.section),
		weakSections,
		strongSections,
	};
}
