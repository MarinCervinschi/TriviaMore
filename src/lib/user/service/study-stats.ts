import { sql } from "drizzle-orm";

import { getDb } from "@/db";

import type { MasteryScope } from "../schemas";
import type { DailyStudyStat } from "../types";
import { sectionScopeSql } from "./scope";

// Rows without a mode snapshot are dropped so the split stays clean (the #159
// backfill covers every historical attempt). Optionally scoped to a section /
// class / course. Callers window these client-side.
export async function getDailyStudyStats(
	userId: string,
	scope?: MasteryScope
): Promise<DailyStudyStat[]> {
	const db = getDb();
	// Scoped by the ATTEMPT's section on both sides, the same rule `getMastery`
	// follows: an exam simulation's answers carry the section each question came
	// from, so scoping them by `aa.section_id` would drop every one of them.
	const scoped = sectionScopeSql(scope, sql`qa.section_id`);

	const result = await db.execute<{
		date: string;
		quiz_mode: "STUDY" | "EXAM_SIMULATION";
		quizzes: number;
		grade_sum: number;
		time_spent: string;
		answers_total: number;
		answers_correct: number;
	}>(sql`
		select d.date,
		       d.quiz_mode,
		       d.quizzes,
		       d.grade_sum,
		       d.time_spent,
		       coalesce(a.answers_total, 0) as answers_total,
		       coalesce(a.answers_correct, 0) as answers_correct
		  from (
		    select to_char(qa.completed_at at time zone 'utc', 'YYYY-MM-DD') as date,
		           qa.quiz_mode as quiz_mode,
		           count(*)::int as quizzes,
		           sum(qa.score)::float8 as grade_sum,
		           sum(coalesce(qa.time_spent, 0))::bigint as time_spent
		      from quiz.quiz_attempts qa
		     where qa.user_id = ${userId}
		       and qa.completed_at is not null
		       and qa.quiz_mode is not null${scoped}
		     group by date, qa.quiz_mode
		  ) d
		  left join (
		    select to_char(qa.completed_at at time zone 'utc', 'YYYY-MM-DD') as date,
		           qa.quiz_mode as quiz_mode,
		           count(*) filter (where aa.is_correct is not null)::int as answers_total,
		           count(*) filter (where aa.is_correct)::int as answers_correct
		      from quiz.answer_attempts aa
		      join quiz.quiz_attempts qa on qa.id = aa.quiz_attempt_id
		     where qa.user_id = ${userId}
		       and qa.quiz_mode is not null${scoped}
		     group by date, qa.quiz_mode
		  ) a on a.date = d.date and a.quiz_mode = d.quiz_mode
		 order by d.date
	`);

	return result.rows.map(row => ({
		date: row.date,
		quizMode: row.quiz_mode,
		quizzes: row.quizzes,
		gradeSum: Number(row.grade_sum ?? 0),
		timeSpent: Number(row.time_spent ?? 0),
		answersTotal: row.answers_total,
		answersCorrect: row.answers_correct,
	}));
}
