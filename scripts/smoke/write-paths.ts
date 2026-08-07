// Exercises the write side of #90 — start, complete, cancel — against the live
// schema, inside a transaction that is rolled back at the end. Nothing is
// persisted, which is the point: every db/ function takes a `DbOrTx`, so the
// whole flow runs on a handle the caller controls.
//
//   pnpm smoke:writes
import { and, eq, inArray, sql } from "drizzle-orm";
import { TransactionRollbackError } from "drizzle-orm/errors";

import { closeDb, getDb } from "../../src/db/index.ts";
import {
	evaluationModes,
	progress,
	questions,
	quizQuestions,
	quizzes,
} from "../../src/db/schema/index.ts";
import { QUIZ_QUESTION_TYPES } from "../../src/lib/catalog/db/questions.ts";
import {
	claimAttempt,
	countAttempts,
	deleteAttempt,
	findAnswers,
	insertAnswers,
	insertAttempt,
} from "../../src/lib/quiz/db/attempts.ts";
import { recordAttemptInProgress } from "../../src/lib/quiz/db/progress.ts";
import {
	deleteQuiz,
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
			.select({ id: questions.id })
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
			score: 21,
			timeSpent: 60_000,
		});
		expect("complete: first claim wins", Boolean(claimed));

		const replay = await claimAttempt(tx, {
			attemptId: attempt.id,
			userId: seed.user_id,
			score: 30,
			timeSpent: 1,
		});
		expect("complete: second claim is refused", replay === undefined);

		const foreign = await claimAttempt(tx, {
			attemptId: attempt.id,
			userId: "00000000-0000-0000-0000-000000000000",
			score: 30,
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
			}))
		);
		const answers = await findAnswers(tx, attempt.id);
		expect("complete: answers stored", answers.length === picked.length);

		// progress upsert, twice: the second run must average instead of overwrite
		const before = await tx
			.select()
			.from(progress)
			.where(
				and(
					eq(progress.userId, seed.user_id),
					eq(progress.sectionId, seed.section_id),
					eq(progress.quizMode, "STUDY")
				)
			)
			.then(rows => rows[0]);

		await recordAttemptInProgress(tx, {
			userId: seed.user_id,
			sectionId: seed.section_id,
			quizMode: "STUDY",
			score: 20,
			timeSpent: 1000,
		});
		await recordAttemptInProgress(tx, {
			userId: seed.user_id,
			sectionId: seed.section_id,
			quizMode: "STUDY",
			score: 30,
			timeSpent: 1000,
		});

		const after = await tx
			.select()
			.from(progress)
			.where(
				and(
					eq(progress.userId, seed.user_id),
					eq(progress.sectionId, seed.section_id),
					eq(progress.quizMode, "STUDY")
				)
			)
			.then(rows => rows[0]);

		expect(
			"progress: counter incremented twice",
			after.quizzesTaken === (before?.quizzesTaken ?? 0) + 2,
			`${before?.quizzesTaken ?? 0} → ${after.quizzesTaken}`
		);
		expect(
			"progress: best score kept",
			(after.bestScore ?? 0) >= Math.max(30, before?.bestScore ?? 0),
			`best = ${after.bestScore}`
		);
		expect(
			"progress: time accumulated",
			after.totalTimeSpent === (before?.totalTimeSpent ?? 0) + 2000
		);
		if (!before) {
			// 20 then 30 on a fresh row averages to 25.
			expect(
				"progress: running average",
				after.averageScore === 25,
				`avg = ${after.averageScore}`
			);
		}

		await deleteAttempt(tx, attempt.id);
		expect("cancel: attempt gone", (await countAttempts(tx, quiz.id)) === 0);
		await deleteQuiz(tx, quiz.id);

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
