import { sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";

import {
	ACTIVITY_ZONE,
	EXAM_MIN_ANSWERS,
	EXAM_PASS_SCORE,
	PERFECT_MIN_ANSWERS,
	PERFECT_SCORE,
} from "../constants";

/**
 * Rebuilds every rollup from the history that is their source of truth. Safe to
 * run repeatedly: each statement is an upsert keyed the same way the incremental
 * path writes, so a rebuild converges rather than accumulating.
 *
 * This is the guarantee that makes the derived tables acceptable at all — a
 * counter you cannot rebuild is a corrupt value waiting to be discovered.
 */
export async function backfillRollups(db: DbOrTx): Promise<void> {
	await db.execute(sql`
		insert into public.user_section_stats
			(user_id, section_id, runs, first_score, last_score, first_at, last_at)
		select qa.user_id, qa.section_id, count(*)::int,
		       (array_agg(qa.score order by qa.completed_at))[1],
		       (array_agg(qa.score order by qa.completed_at desc))[1],
		       min(qa.completed_at), max(qa.completed_at)
		  from quiz.quiz_attempts qa
		  join catalog.sections s on s.id = qa.section_id
		 where qa.completed_at is not null
		 group by qa.user_id, qa.section_id
		on conflict (user_id, section_id) do update set
		       runs = excluded.runs,
		       first_score = excluded.first_score,
		       last_score = excluded.last_score,
		       first_at = excluded.first_at,
		       last_at = excluded.last_at
	`);

	await db.execute(sql`
		insert into public.user_question_stats
			(user_id, question_id, hard_correct, bookmarked_then_correct)
		select qa.user_id, aa.question_id,
		       bool_or(aa.difficulty = 'HARD' and aa.is_correct) as hard_correct,
		       bool_or(aa.is_correct and b.question_id is not null) as booked
		  from quiz.answer_attempts aa
		  join quiz.quiz_attempts qa
		    on qa.id = aa.quiz_attempt_id and qa.completed_at is not null
		  join catalog.questions q on q.id = aa.question_id
		  left join public.bookmarks b
		    on b.user_id = qa.user_id
		   and b.question_id = aa.question_id
		   and b.created_at < qa.completed_at
		 group by qa.user_id, aa.question_id
		having bool_or(aa.difficulty = 'HARD' and aa.is_correct)
		    or bool_or(aa.is_correct and b.question_id is not null)
		on conflict (user_id, question_id) do update set
		       hard_correct = excluded.hard_correct,
		       bookmarked_then_correct = excluded.bookmarked_then_correct
	`);

	await db.execute(sql`
		insert into public.user_day_activity (user_id, day, quizzes, flashcards)
		select user_id, day, sum(q)::int, sum(f)::int
		  from (
		    select qa.user_id,
		           (qa.completed_at at time zone ${ACTIVITY_ZONE})::date as day,
		           1 as q, 0 as f
		      from quiz.quiz_attempts qa
		     where qa.completed_at is not null
		    union all
		    select fa.user_id,
		           (fa.completed_at at time zone ${ACTIVITY_ZONE})::date,
		           0, 1
		      from quiz.flashcard_attempts fa
		  ) activity
		 group by user_id, day
		on conflict (user_id, day) do update set
		       quizzes = excluded.quizzes,
		       flashcards = excluded.flashcards
	`);

	await db.execute(sql`
		insert into public.user_stats (
			user_id, quizzes_completed, perfect_quizzes, exam_sims_passed,
			flashcard_sessions, approved_requests, total_time_ms,
			hard_correct, bookmarked_then_correct, updated_at
		)
		with att as (
			select qa.id, qa.user_id, qa.score, qa.quiz_mode,
			       coalesce(qa.time_spent, 0)::bigint as time_spent
			  from quiz.quiz_attempts qa
			 where qa.completed_at is not null
		),
		answers as (
			select aa.quiz_attempt_id, count(*)::int as n
			  from quiz.answer_attempts aa
			  join att a on a.id = aa.quiz_attempt_id
			 group by aa.quiz_attempt_id
		),
		graded as (
			select att.*, coalesce(answers.n, 0) as n
			  from att left join answers on answers.quiz_attempt_id = att.id
		),
		volume as (
			select user_id,
			       count(*)::int as quizzes_completed,
			       count(*) filter (
			         where score >= ${PERFECT_SCORE} and n >= ${PERFECT_MIN_ANSWERS}
			       )::int as perfect_quizzes,
			       count(*) filter (
			         where quiz_mode = 'EXAM_SIMULATION'
			           and score >= ${EXAM_PASS_SCORE} and n >= ${EXAM_MIN_ANSWERS}
			       )::int as exam_sims_passed,
			       sum(time_spent)::bigint as total_time_ms
			  from graded group by user_id
		),
		flash as (
			select user_id, count(*)::int as n from quiz.flashcard_attempts group by user_id
		),
		req as (
			select user_id, count(*)::int as n
			  from internal.content_requests
			 where status = 'APPROVED' group by user_id
		),
		questions as (
			select user_id,
			       count(*) filter (where hard_correct)::int as hard_correct,
			       count(*) filter (where bookmarked_then_correct)::int as booked
			  from public.user_question_stats group by user_id
		)
		select p.id,
		       coalesce(v.quizzes_completed, 0),
		       coalesce(v.perfect_quizzes, 0),
		       coalesce(v.exam_sims_passed, 0),
		       coalesce(f.n, 0),
		       coalesce(r.n, 0),
		       coalesce(v.total_time_ms, 0),
		       coalesce(q.hard_correct, 0),
		       coalesce(q.booked, 0),
		       now()
		  from public.profiles p
		  left join volume v on v.user_id = p.id
		  left join flash f on f.user_id = p.id
		  left join req r on r.user_id = p.id
		  left join questions q on q.user_id = p.id
		on conflict (user_id) do update set
		       quizzes_completed = excluded.quizzes_completed,
		       perfect_quizzes = excluded.perfect_quizzes,
		       exam_sims_passed = excluded.exam_sims_passed,
		       flashcard_sessions = excluded.flashcard_sessions,
		       approved_requests = excluded.approved_requests,
		       total_time_ms = excluded.total_time_ms,
		       hard_correct = excluded.hard_correct,
		       bookmarked_then_correct = excluded.bookmarked_then_correct,
		       updated_at = now()
	`);

	await db.execute(sql`
		update public.profiles p
		   set signup_rank = ranked.rank
		  from (
		    select id, rank() over (order by created_at, id)::int as rank
		      from public.profiles
		  ) ranked
		 where ranked.id = p.id
		   and p.signup_rank is distinct from ranked.rank
	`);
}
