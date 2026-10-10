import { sql } from "drizzle-orm";

/** Read straight from the student's own record, which is the authority: there is no rollup to drift. */
export const CRM_METRIC_CTES = sql`
		career as (
			select e.user_id,
			       count(*) filter (where ce.status = 'PASSED')::int as exams_passed,
			       coalesce(sum(ce.cfu) filter (where ce.status = 'PASSED'), 0)::int as cfu_earned,
			       count(*) filter (where ce.status = 'PASSED' and ce.honours)::int as honours_earned
			  from crm.enrollments e
			  join target t on t.user_id = e.user_id
			  join crm.career_exams ce on ce.enrollment_id = e.id
			 where e.is_current
			 group by e.user_id
		),
		ticked as (
			select k.user_id, count(*)::int as tasks_done
			  from crm.tasks k
			  join target t on t.user_id = k.user_id
			 where k.done
			 group by k.user_id
		)`;

export const CRM_METRIC_COLUMNS = sql`
		       coalesce(ca.exams_passed, 0) as exams_passed,
		       coalesce(ca.cfu_earned, 0) as cfu_earned,
		       coalesce(ca.honours_earned, 0) as honours_earned,
		       coalesce(tk.tasks_done, 0) as tasks_done`;

export const CRM_METRIC_JOINS = sql`
		  left join career ca on ca.user_id = t.user_id
		  left join ticked tk on tk.user_id = t.user_id`;
