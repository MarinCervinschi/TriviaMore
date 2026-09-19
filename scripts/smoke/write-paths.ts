// Exercises the write side of #90 — start, complete, cancel — against the live
// schema, inside a transaction that is rolled back at the end. Nothing is
// persisted, which is the point: every db/ function takes a `DbOrTx`, so the
// whole flow runs on a handle the caller controls.
//
//   pnpm smoke:writes
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { TransactionRollbackError } from "drizzle-orm/errors";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	courses,
	enrollments,
	evaluationModes,
	flashcardAttempts,
	questions,
	quizAttempts,
	quizQuestions,
	quizzes,
} from "../../src/db/schema/index.ts";
import { QUIZ_QUESTION_TYPES } from "../../src/lib/catalog/db/questions.ts";
import {
	findCurrentEnrollment,
	findEnrollmentByCourse,
	insertEnrollment,
	setEnrollmentCurrent,
	updateEnrollmentDetails,
} from "../../src/lib/crm/db/enrollments.ts";
import { insertFlashcardAttempt } from "../../src/lib/flashcard/db/flashcard-attempts.ts";
import {
	applyAttemptGrade,
	claimAttempt,
	deleteAttempt,
	deleteStaleOpenAttempts,
	findAnswers,
	insertAnswers,
	insertAttempt,
} from "../../src/lib/quiz/db/attempts.ts";
import {
	deleteOrphanQuizzes,
	findQuizQuestionOrder,
	insertQuiz,
	insertQuizQuestions,
} from "../../src/lib/quiz/db/quizzes.ts";

const checks: { name: string; ok: boolean; detail?: string }[] = [];

function expect(name: string, ok: boolean, detail?: string) {
	checks.push({ name, ok, detail });
}

const db = getDb();

const [seed] = await db
	.execute<{ user_id: string; section_id: string }>(
		sql`select p.id as user_id, q.section_id
          from profiles p
          cross join lateral (
            select section_id
              from catalog.questions
             where question_type in ('MULTIPLE_CHOICE', 'TRUE_FALSE')
             group by section_id
            having count(*) >= 2
             limit 1
          ) q
         limit 1`
	)
	.then(r => r.rows);

if (!seed) {
	console.error("no profile or no section with quiz questions: cannot smoke test");
	await closeDb();
	process.exit(1);
}

try {
	await db.transaction(async tx => {
		const [mode] = await tx
			.select({ id: evaluationModes.id })
			.from(evaluationModes)
			.limit(1);
		if (!mode) throw new Error("no evaluation mode configured");

		const picked = await tx
			.select({
				id: questions.id,
				difficulty: questions.difficulty,
				questionType: questions.questionType,
			})
			.from(questions)
			.where(
				and(
					eq(questions.sectionId, seed.section_id),
					inArray(questions.questionType, [...QUIZ_QUESTION_TYPES])
				)
			)
			.limit(2);

		const quiz = await insertQuiz(tx, {
			sectionId: seed.section_id,
			evaluationModeId: mode.id,
			quizMode: "STUDY",
			timeLimit: 30,
		});
		await insertQuizQuestions(
			tx,
			quiz.id,
			picked.map(question => question.id)
		);
		const attempt = await insertAttempt(tx, {
			userId: seed.user_id,
			quizId: quiz.id,
		});

		const order = await findQuizQuestionOrder(tx, quiz.id);
		expect("start: questions linked in order", order.length === picked.length);
		expect(
			"start: order is 1-based and dense",
			order.every((entry, index) => entry.order === index + 1)
		);

		const claimed = await claimAttempt(tx, {
			attemptId: attempt.id,
			userId: seed.user_id,
			timeSpent: 60_000,
		});
		expect("complete: first claim wins", Boolean(claimed));

		const replay = await claimAttempt(tx, {
			attemptId: attempt.id,
			userId: seed.user_id,
			timeSpent: 1,
		});
		expect("complete: second claim is refused", replay === undefined);

		const foreign = await claimAttempt(tx, {
			attemptId: attempt.id,
			userId: "00000000-0000-0000-0000-000000000000",
			timeSpent: 1,
		});
		expect("complete: another user cannot claim", foreign === undefined);

		await insertAnswers(
			tx,
			attempt.id,
			picked.map(question => ({
				questionId: question.id,
				userAnswer: ["x"],
				score: 0.5,
				isCorrect: false,
				sectionId: seed.section_id,
				difficulty: question.difficulty,
				questionType: question.questionType,
			}))
		);
		const answers = await findAnswers(tx, attempt.id);
		expect("complete: answers stored", answers.length === picked.length);

		await applyAttemptGrade(tx, {
			attemptId: attempt.id,
			score: 21,
			sectionId: seed.section_id,
			quizMode: "STUDY",
		});
		const [graded] = await tx
			.select({
				score: quizAttempts.score,
				sectionId: quizAttempts.sectionId,
				quizMode: quizAttempts.quizMode,
			})
			.from(quizAttempts)
			.where(eq(quizAttempts.id, attempt.id));
		expect(
			"complete: server grade + snapshot applied",
			graded?.score === 21 &&
				graded?.sectionId === seed.section_id &&
				graded?.quizMode === "STUDY"
		);

		// flashcard: one row per session, and replaying its id records nothing more.
		const flashcardSession = `smoke-${seed.section_id}`;
		for (let i = 0; i < 2; i++) {
			await insertFlashcardAttempt(tx, {
				userId: seed.user_id,
				sessionId: flashcardSession,
				sectionId: seed.section_id,
				cardsReviewed: 5,
			});
		}
		const flashRows = await tx
			.select({ cardsReviewed: flashcardAttempts.cardsReviewed })
			.from(flashcardAttempts)
			.where(
				and(
					eq(flashcardAttempts.userId, seed.user_id),
					eq(flashcardAttempts.sectionId, seed.section_id)
				)
			);
		expect(
			"flashcard: session recorded once",
			flashRows.length === 1 && flashRows[0]?.cardsReviewed === 5
		);

		await deleteAttempt(tx, attempt.id);
		const cancelled = await tx
			.select({ id: quizAttempts.id })
			.from(quizAttempts)
			.where(eq(quizAttempts.id, attempt.id));
		expect("cancel: attempt gone", cancelled.length === 0);
		await deleteOrphanQuizzes(tx, [quiz.id]);

		const orphanQuestions = await tx
			.select({ id: quizQuestions.id })
			.from(quizQuestions)
			.where(eq(quizQuestions.quizId, quiz.id));
		expect("cancel: quiz_questions cascaded", orphanQuestions.length === 0);

		const orphanQuiz = await tx
			.select({ id: quizzes.id })
			.from(quizzes)
			.where(eq(quizzes.id, quiz.id));
		expect("cancel: quiz gone", orphanQuiz.length === 0);

		const staleQuiz = await insertQuiz(tx, {
			sectionId: seed.section_id,
			evaluationModeId: mode.id,
			quizMode: "STUDY",
			timeLimit: null,
		});
		await insertQuizQuestions(
			tx,
			staleQuiz.id,
			picked.map(question => question.id)
		);

		// Completed first: the partial unique index allows one open attempt per user,
		// so the quiz can only be held by a second attempt that is already finished.
		const doneAttempt = await insertAttempt(tx, {
			userId: seed.user_id,
			quizId: staleQuiz.id,
		});
		await tx
			.update(quizAttempts)
			.set({ completedAt: sql`now()` })
			.where(eq(quizAttempts.id, doneAttempt.id));

		const staleAttempt = await insertAttempt(tx, {
			userId: seed.user_id,
			quizId: staleQuiz.id,
		});
		await tx
			.update(quizAttempts)
			.set({ lastSeenAt: sql`now() - interval '3 days'` })
			.where(eq(quizAttempts.id, staleAttempt.id));

		const reaped = await deleteStaleOpenAttempts(tx, seed.user_id);
		expect(
			"reap: the stale attempt's quiz is reported",
			reaped.filter(id => id === staleQuiz.id).length === 1
		);

		const survivors = await tx
			.select({ id: quizAttempts.id })
			.from(quizAttempts)
			.where(inArray(quizAttempts.id, [staleAttempt.id, doneAttempt.id]));
		expect(
			"reap: the completed attempt survives",
			survivors.length === 1 && survivors[0]?.id === doneAttempt.id
		);

		await deleteOrphanQuizzes(tx, reaped);
		const heldQuiz = await tx
			.select({ id: quizzes.id })
			.from(quizzes)
			.where(eq(quizzes.id, staleQuiz.id));
		expect("reap: a quiz another attempt holds is kept", heldQuiz.length === 1);

		// Two courses the seed profile has never been enrolled in. The unique index
		// is on (user_id, course_id) and ignores is_current, so a demoted row from
		// an earlier career collides just as hard as the live one.
		const heldCourses = await tx
			.select({ courseId: enrollments.courseId })
			.from(enrollments)
			.where(eq(enrollments.userId, seed.user_id));
		const held = await findCurrentEnrollment(tx, seed.user_id);
		const taken = heldCourses.map(row => row.courseId);
		const pair = await tx
			.select({ id: courses.id })
			.from(courses)
			.where(taken.length > 0 ? notInArray(courses.id, taken) : undefined)
			.orderBy(courses.createdAt)
			.limit(2);
		if (pair.length === 2) {
			const [first, second] = pair as [{ id: string }, { id: string }];

			// One current row per user, so step aside before adding ours. Everything
			// here is inside the transaction that is rolled back at the end.
			if (held) await setEnrollmentCurrent(tx, held.id, false);

			await insertEnrollment(tx, { userId: seed.user_id, courseId: first.id });
			const opened = await findCurrentEnrollment(tx, seed.user_id);
			expect("enrolment: the first one is current", opened?.courseId === first.id);

			// Switching course demotes the old row instead of deleting it, so the
			// exam record built on its id survives.
			if (opened) await setEnrollmentCurrent(tx, opened.id, false);
			await insertEnrollment(tx, { userId: seed.user_id, courseId: second.id });
			const switched = await findCurrentEnrollment(tx, seed.user_id);
			expect(
				"enrolment: switching promotes the new course",
				switched?.courseId === second.id
			);
			expect(
				"enrolment: the previous course is kept as history",
				(await findEnrollmentByCourse(tx, seed.user_id, first.id)) !== undefined
			);

			// Switching back promotes the original row rather than adding a third.
			if (switched) await setEnrollmentCurrent(tx, switched.id, false);
			const previous = await findEnrollmentByCourse(tx, seed.user_id, first.id);
			if (previous) await setEnrollmentCurrent(tx, previous.id, true);
			const back = await findCurrentEnrollment(tx, seed.user_id);
			expect(
				"enrolment: switching back reuses the original row",
				back?.id === opened?.id && back?.courseId === first.id
			);

			// The wizard sends only a course, so the details patch is empty and
			// `.set({})` would throw "No values to set" — it must be a no-op.
			let emptyPatchThrew = false;
			try {
				await updateEnrollmentDetails(tx, back!.id, {
					curriculum: undefined,
					startYear: undefined,
				});
			} catch {
				emptyPatchThrew = true;
			}
			expect("enrolment: an empty details patch is a no-op", !emptyPatchThrew);

			await updateEnrollmentDetails(tx, back!.id, { startYear: 2023 });
			const patched = await findCurrentEnrollment(tx, seed.user_id);
			expect("enrolment: a non-empty patch still writes", patched?.startYear === 2023);
		}

		tx.rollback();
	});
} catch (error) {
	// Drizzle signals an explicit rollback by throwing; anything else is a real
	// failure.
	if (!(error instanceof TransactionRollbackError)) {
		console.error(error);
		await closeDb();
		process.exit(1);
	}
}

await closeDb();

for (const check of checks) {
	console.log(
		`${check.ok ? "✔" : "✘"} ${check.name}${check.detail ? ` — ${check.detail}` : ""}`
	);
}

const failed = checks.filter(check => !check.ok).length;
if (failed > 0) {
	console.error(`\n${failed} failing`);
	process.exitCode = 1;
} else {
	console.log("\nall write paths verified, transaction rolled back");
}
