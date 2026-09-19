import { sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants";

import { ACTIVE_WEEK_MIN_DAYS, IMPROVEMENT_MIN_RUNS } from "../constants";
import type { UserMetrics } from "../types";

type MetricRow = Record<string, string | number | null>;

/** The one place a row becomes a snapshot, so the rollup read and the recompute
 *  can never disagree about a null. */
export function toUserMetrics(row: MetricRow): UserMetrics {
	return {
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
			ENROLLMENT_DECLARED: Number(row.enrollment_declared ?? 0),
			// Compared with LTE, so a missing rank is the worst value, not 0 — the best.
			SIGNUP_RANK:
				row.signup_rank === null || row.signup_rank === undefined
					? Number.POSITIVE_INFINITY
					: Number(row.signup_rank),
		},
	};
}

/**
 * Every metric for a user, read from the rollups rather than from the history
 * that produced them. Eight counters come straight off `user_stats`; the four
 * that need a set come off `user_section_stats`, whose size is bounded by the
 * catalogue; the two calendar ones are windowed over `user_day_activity`, which
 * is one row per active day.
 *
 * The shape of the result is unchanged, deliberately: `evaluate` is pure and
 * still runs the same over a live unlock and a replay. What changed is that the
 * cost no longer grows with how long a student has been studying.
 *
 * Authority still belongs to `recomputeMetricSnapshots`; this is the derived
 * read, and `pnpm achievements:reconcile` is what keeps the two honest.
 */
export async function readMetricSnapshots(
	db: DbOrTx,
	userId?: string
): Promise<UserMetrics[]> {
	const scoped = userId ? sql` where p.id = ${userId}` : sql``;

	const result = await db.execute<MetricRow>(sql`
		with target as (
			select p.id as user_id, p.signup_rank
			  from public.profiles p${scoped}
		),
		primary_course as (
			select distinct on (cc.class_id) cc.class_id, c.department_id
			  from catalog.course_classes cc
			  join catalog.courses c on c.id = cc.course_id
			 order by cc.class_id, cc.position
		),
		breadth as (
			select ss.user_id,
			       count(*) filter (
			         where s.name is distinct from ${EXAM_SIMULATION_SECTION}
			       )::int as distinct_sections,
			       count(distinct s.class_id)::int as distinct_classes,
			       count(distinct pc.department_id)::int as distinct_departments,
			       max(ss.last_score - ss.first_score) filter (
			         where ss.runs >= ${IMPROVEMENT_MIN_RUNS}
			       )::float8 as max_section_improvement
			  from public.user_section_stats ss
			  join target t on t.user_id = ss.user_id
			  left join catalog.sections s on s.id = ss.section_id
			  left join primary_course pc on pc.class_id = s.class_id
			 group by ss.user_id
		),
		days as (
			select d.user_id, d.day
			  from public.user_day_activity d
			  join target t on t.user_id = d.user_id
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
		enrolled as (
			select e.user_id
			  from crm.enrollments e
			  join target t on t.user_id = e.user_id
			 where e.is_current
			 group by e.user_id
		),
		weeks as (
			select user_id, count(*)::int as active_weeks
			  from (
			    select user_id, date_trunc('week', day) as wk, count(*) as n
			      from days group by user_id, date_trunc('week', day)
			  ) w
			 where w.n >= ${ACTIVE_WEEK_MIN_DAYS}
			 group by user_id
		)
		select t.user_id,
		       coalesce(us.quizzes_completed, 0) as quizzes_completed,
		       coalesce(b.distinct_sections, 0) as distinct_sections,
		       coalesce(b.distinct_classes, 0) as distinct_classes,
		       coalesce(b.distinct_departments, 0) as distinct_departments,
		       coalesce(us.perfect_quizzes, 0) as perfect_quizzes,
		       coalesce(us.hard_correct, 0) as hard_correct,
		       coalesce(us.exam_sims_passed, 0) as exam_sims_passed,
		       coalesce(b.max_section_improvement, 0) as max_section_improvement,
		       coalesce(w.active_weeks, 0) as active_weeks,
		       coalesce(st.best_day_streak, 0) as best_day_streak,
		       coalesce(us.total_time_ms, 0) as total_time_ms,
		       coalesce(us.flashcard_sessions, 0) as flashcard_sessions,
		       coalesce(us.bookmarked_then_correct, 0) as bookmarked_then_correct,
		       coalesce(us.approved_requests, 0) as approved_requests,
		       t.signup_rank,
		       (en.user_id is not null)::int as enrollment_declared
		  from target t
		  left join public.user_stats us on us.user_id = t.user_id
		  left join breadth b on b.user_id = t.user_id
		  left join streak st on st.user_id = t.user_id
		  left join weeks w on w.user_id = t.user_id
		  left join enrolled en on en.user_id = t.user_id
	`);

	return result.rows.map(toUserMetrics);
}
