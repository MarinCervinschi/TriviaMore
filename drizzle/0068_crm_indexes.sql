CREATE INDEX "idx_career_exams_class" ON "crm"."career_exams" USING btree ("class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_career_exams_plan_row" ON "crm"."career_exams" USING btree ("enrollment_id","plan_code",coalesce("group_code", '')) WHERE "crm"."career_exams"."plan_code" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_calendar_events_career_exam" ON "crm"."calendar_events" USING btree ("career_exam_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_career_exam" ON "crm"."tasks" USING btree ("career_exam_id");