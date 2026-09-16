import { sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants";

import type { UserMetrics } from "../types";

/**
 * The one query the engine runs: every metric, one row per user — scoped for a
 * live unlock, unscoped for a replay. Adding a badge never adds a query.
 *
 * A day is Europe/Rome throughout, while the analytics page groups in UTC and the
 * rhythm card in the viewer's zone; a streak here can differ from one shown there.
 * And RLS filters nothing on this connection: `target` is what keeps one user's
 * attempts out of another's totals.
 */
export async function readMetricSnapshots(
	db: DbOrTx,
	userId?: string
): Promise<UserMetrics[]> {
	const scoped = userId ? sql` where p.id = ${userId}` : sql``;

	const result = await db.execute<Record<string, string | number | null>>(sql`
		with target as (
			select p.id as user_id from public.profiles p${scoped}
		),
		signup as (
			select p.id as user_id,
			       rank() over (order by p.created_at, p.id)::int as signup_rank
			  from public.profiles p
		),
		att as (
			select qa.id, qa.user_id, qa.section_id, qa.score, qa.quiz_mode,
			       qa.completed_at, coalesce(qa.time_spent, 0)::bigint as time_spent
			  from quiz.quiz_attempts qa
			  join target t on t.user_id = qa.user_id
			 where qa.completed_at is not null
		),
		ans as (
			select aa.quiz_attempt_id, count(*)::int as n
			  from quiz.answer_attempts aa
			  join att a on a.id = aa.quiz_attempt_id
			 group by aa.quiz_attempt_id
		),
		attempt as (
			select att.*, coalesce(ans.n, 0) as answers
			  from att left join ans on ans.quiz_attempt_id = att.id
		),
		primary_course as (
			select distinct on (cc.class_id) cc.class_id, c.department_id
			  from catalog.course_classes cc
			  join catalog.courses c on c.id = cc.course_id
			 order by cc.class_id, cc.position
		),
		breadth as (
			select a.user_id,
			       count(distinct a.section_id) filter (
			         where s.name is distinct from ${EXAM_SIMULATION_SECTION}
			       )::int as distinct_sections,
			       count(distinct s.class_id)::int as distinct_classes,
			       count(distinct pc.department_id)::int as distinct_departments
			  from attempt a
			  left join catalog.sections s on s.id = a.section_id
			  left join primary_course pc on pc.class_id = s.class_id
			 group by a.user_id
		),
		volume as (
			select a.user_id,
			       count(*)::int as quizzes_completed,
			       sum(a.time_spent)::bigint as total_time_ms,
			       count(*) filter (
			         where a.score >= 33 and a.answers >= 10
			       )::int as perfect_quizzes,
			       count(*) filter (
			         where a.quiz_mode = 'EXAM_SIMULATION'
			           and a.score >= 27 and a.answers >= 15
			       )::int as exam_sims_passed
			  from attempt a
			 group by a.user_id
		),
		hard as (
			select a.user_id, count(distinct aa.question_id)::int as hard_correct
			  from quiz.answer_attempts aa
			  join attempt a on a.id = aa.quiz_attempt_id
			 where aa.difficulty = 'HARD' and aa.is_correct
			 group by a.user_id
		),
		section_runs as (
			select a.user_id, a.section_id,
			       count(*)::int as runs,
			       (array_agg(a.score order by a.completed_at))[1] as first_score,
			       (array_agg(a.score order by a.completed_at desc))[1] as last_score
			  from attempt a
			 where a.section_id is not null
			 group by a.user_id, a.section_id
		),
		improve as (
			select user_id,
			       max(last_score - first_score)::float8 as max_section_improvement
			  from section_runs
			 where runs >= 3
			 group by user_id
		),
		flash as (
			select fa.user_id, count(*)::int as flashcard_sessions
			  from quiz.flashcard_attempts fa
			  join target t on t.user_id = fa.user_id
			 group by fa.user_id
		),
		book as (
			select a.user_id,
			       count(distinct aa.question_id)::int as bookmarked_then_correct
			  from quiz.answer_attempts aa
			  join attempt a on a.id = aa.quiz_attempt_id
			  join public.bookmarks b
			    on b.user_id = a.user_id and b.question_id = aa.question_id
			 where aa.is_correct and b.created_at < a.completed_at
			 group by a.user_id
		),
		req as (
			select cr.user_id, count(*)::int as approved_requests
			  from internal.content_requests cr
			  join target t on t.user_id = cr.user_id
			 where cr.status = 'APPROVED'
			 group by cr.user_id
		),
		days as (
			select a.user_id, (a.completed_at at time zone 'Europe/Rome')::date as day
			  from attempt a
			 union
			select fa.user_id, (fa.completed_at at time zone 'Europe/Rome')::date
			  from quiz.flashcard_attempts fa
			  join target t on t.user_id = fa.user_id
		),
		islands as (
			select user_id, day,
			       day - (row_number() over (
			         partition by user_id order by day
			       ))::int as grp
			  from days
		),
		streak as (
			select user_id, max(len)::int as best_day_streak
			  from (
			    select user_id, grp, count(*)::int as len
			      from islands group by user_id, grp
			  ) runs
			 group by user_id
		),
		weeks as (
			select user_id, count(*)::int as active_weeks
			  from (
			    select user_id, date_trunc('week', day) as wk, count(*) as n
			      from days group by user_id, date_trunc('week', day)
			  ) w
			 where w.n >= 3
			 group by user_id
		)
		select t.user_id,
		       coalesce(v.quizzes_completed, 0) as quizzes_completed,
		       coalesce(b.distinct_sections, 0) as distinct_sections,
		       coalesce(b.distinct_classes, 0) as distinct_classes,
		       coalesce(b.distinct_departments, 0) as distinct_departments,
		       coalesce(v.perfect_quizzes, 0) as perfect_quizzes,
		       coalesce(h.hard_correct, 0) as hard_correct,
		       coalesce(v.exam_sims_passed, 0) as exam_sims_passed,
		       coalesce(i.max_section_improvement, 0) as max_section_improvement,
		       coalesce(w.active_weeks, 0) as active_weeks,
		       coalesce(st.best_day_streak, 0) as best_day_streak,
		       coalesce(v.total_time_ms, 0) as total_time_ms,
		       coalesce(f.flashcard_sessions, 0) as flashcard_sessions,
		       coalesce(bk.bookmarked_then_correct, 0) as bookmarked_then_correct,
		       coalesce(r.approved_requests, 0) as approved_requests,
		       sg.signup_rank as signup_rank
		  from target t
		  left join volume v on v.user_id = t.user_id
		  left join breadth b on b.user_id = t.user_id
		  left join hard h on h.user_id = t.user_id
		  left join improve i on i.user_id = t.user_id
		  left join weeks w on w.user_id = t.user_id
		  left join streak st on st.user_id = t.user_id
		  left join flash f on f.user_id = t.user_id
		  left join book bk on bk.user_id = t.user_id
		  left join req r on r.user_id = t.user_id
		  join signup sg on sg.user_id = t.user_id
	`);

	return result.rows.map(row => ({
		userId: String(row.user_id),
		metrics: {
			QUIZZES_COMPLETED: Number(row.quizzes_completed ?? 0),
			DISTINCT_SECTIONS: Number(row.distinct_sections ?? 0),
			DISTINCT_CLASSES: Number(row.distinct_classes ?? 0),
			DISTINCT_DEPARTMENTS: Number(row.distinct_departments ?? 0),
			PERFECT_QUIZZES: Number(row.perfect_quizzes ?? 0),
			HARD_CORRECT: Number(row.hard_correct ?? 0),
			EXAM_SIMS_PASSED: Number(row.exam_sims_passed ?? 0),
			MAX_SECTION_IMPROVEMENT: Number(row.max_section_improvement ?? 0),
			ACTIVE_WEEKS: Number(row.active_weeks ?? 0),
			BEST_DAY_STREAK: Number(row.best_day_streak ?? 0),
			TOTAL_TIME_MS: Number(row.total_time_ms ?? 0),
			FLASHCARD_SESSIONS: Number(row.flashcard_sessions ?? 0),
			BOOKMARKED_THEN_CORRECT: Number(row.bookmarked_then_correct ?? 0),
			APPROVED_REQUESTS: Number(row.approved_requests ?? 0),
			// Compared with LTE, so a missing rank is the worst value, not 0 — the best.
			SIGNUP_RANK:
				row.signup_rank === null || row.signup_rank === undefined
					? Number.POSITIVE_INFINITY
					: Number(row.signup_rank),
		},
	}));
}
