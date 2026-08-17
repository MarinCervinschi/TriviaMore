import { sql } from "drizzle-orm";

import { getDb } from "@/db";

import type { DailyStudyStat } from "../types";

// Per-UTC-day study aggregates: attempt counts/grades/time from quiz_attempts,
// answer verdicts from answer_attempts, merged by day. The dashboard card
// windows these client-side.
export async function getDailyStudyStats(userId: string): Promise<DailyStudyStat[]> {
	const db = getDb();
	const result = await db.execute<{
		date: string;
		quizzes: number;
		grade_sum: number;
		time_spent: string;
		answers_total: number;
		answers_correct: number;
	}>(sql`
		select d.date,
		       d.quizzes,
		       d.grade_sum,
		       d.time_spent,
		       coalesce(a.answers_total, 0) as answers_total,
		       coalesce(a.answers_correct, 0) as answers_correct
		  from (
		    select to_char(completed_at at time zone 'utc', 'YYYY-MM-DD') as date,
		           count(*)::int as quizzes,
		           sum(score)::float8 as grade_sum,
		           sum(coalesce(time_spent, 0))::bigint as time_spent
		      from quiz.quiz_attempts
		     where user_id = ${userId} and completed_at is not null
		     group by date
		  ) d
		  left join (
		    select to_char(qa.completed_at at time zone 'utc', 'YYYY-MM-DD') as date,
		           count(*) filter (where aa.is_correct is not null)::int as answers_total,
		           count(*) filter (where aa.is_correct)::int as answers_correct
		      from quiz.answer_attempts aa
		      join quiz.quiz_attempts qa on qa.id = aa.quiz_attempt_id
		     where qa.user_id = ${userId}
		     group by date
		  ) a on a.date = d.date
		 order by d.date
	`);

	return result.rows.map(row => ({
		date: row.date,
		quizzes: row.quizzes,
		gradeSum: Number(row.grade_sum ?? 0),
		timeSpent: Number(row.time_spent ?? 0),
		answersTotal: row.answers_total,
		answersCorrect: row.answers_correct,
	}));
}
