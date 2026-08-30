// Runs every read path migrated in #90 against the live database, so a broken
// query surfaces here instead of in the browser. It only asserts that the SQL
// executes and returns a plausible shape — the UI check stays manual.
//
//   pnpm smoke:reads
import { sql } from "drizzle-orm";

import { closeDb, getDb } from "../../src/db/index.ts";
import { getClassWithSections } from "../../src/lib/browse/service/classes.ts";
import { searchClasses } from "../../src/lib/browse/service/classes.ts";
import { getAvailableClassYears } from "../../src/lib/browse/service/classes.ts";
import {
	getCourseWithClasses,
	searchCourses,
} from "../../src/lib/browse/service/courses.ts";
import {
	getDepartmentCourseList,
	getDepartmentWithCourses,
	getDepartments,
} from "../../src/lib/browse/service/departments.ts";
import {
	getBrowseOverview,
	getPlatformStats,
} from "../../src/lib/browse/service/overview.ts";
import { getSectionDetail } from "../../src/lib/browse/service/sections.ts";
import { getFlashcardSession } from "../../src/lib/flashcard/service.ts";
import { encodeSessionId } from "../../src/lib/flashcard/session-id.ts";
import {
	getAcceptanceHistory,
	getAcceptanceStatus,
} from "../../src/lib/legal/service.ts";
import {
	getNotifications,
	getUnreadCount,
} from "../../src/lib/notifications/service.ts";
import { getQuiz, getQuizResults } from "../../src/lib/quiz/service.ts";
import { getContentTree } from "../../src/lib/requests/service/content-tree.ts";
import { getUserRequests } from "../../src/lib/requests/service/user-requests.ts";
import { buildSitemap } from "../../src/lib/sitemap/service.ts";
import { getAttemptHistory } from "../../src/lib/user/service/attempt-history.ts";
import {
	getBookmarkedQuestionIds,
	getUserBookmarks,
} from "../../src/lib/user/service/bookmarks.ts";
import {
	getRecentClasses,
	getUserClasses,
	isClassSaved,
} from "../../src/lib/user/service/classes.ts";
import { getMastery } from "../../src/lib/user/service/mastery.ts";
import { getUserProfile } from "../../src/lib/user/service/profile.ts";
import {
	getDailyFlashcardDays,
	getDailyStudyStats,
} from "../../src/lib/user/service/study-stats.ts";

let failures = 0;

async function check(name: string, run: () => Promise<unknown>) {
	try {
		const result = await run();
		const size = Array.isArray(result)
			? `${result.length} rows`
			: result === null
				? "null"
				: "ok";
		console.log(`✔ ${name} — ${size}`);
	} catch (error) {
		failures++;
		console.error(`✘ ${name}`);
		console.error(`  ${error instanceof Error ? error.message : error}`);
	}
}

const db = getDb();

// Sample identifiers from the live catalog so the checks hit real rows.
const [sample] = await db
	.execute<{
		dept_code: string;
		course_code: string;
		class_code: string;
		section_slug: string | null;
		section_id: string;
		user_id: string | null;
	}>(
		sql`
  select d.code as dept_code,
         c.code as course_code,
         cc.code as class_code,
         s.slug as section_slug,
         s.id as section_id,
         (select id from profiles limit 1) as user_id
    from catalog.sections s
    join catalog.classes cl on cl.id = s.class_id
    join catalog.course_classes cc on cc.class_id = cl.id
    join catalog.courses c on c.id = cc.course_id
    join catalog.departments d on d.id = c.department_id
   where s.is_public
   limit 1
`
	)
	.then(r => r.rows);

if (!sample) {
	console.error("no public section in the catalog: nothing to smoke test");
	await closeDb();
	process.exit(1);
}

const userId = sample.user_id;

await check("browse.getDepartments", async () => {
	const rows = await getDepartments();
	// A Postgres array of a custom enum type comes back as a raw string unless it
	// is cast; the UI then spreads it character by character.
	for (const row of rows) {
		if (!Array.isArray(row.campusLocations)) {
			throw new Error(
				`campusLocations is ${typeof row.campusLocations}, not an array: ${JSON.stringify(row.campusLocations)}`
			);
		}
	}
	return rows;
});
await check("browse.getPlatformStats", () => getPlatformStats());
await check("browse.getBrowseOverview", () => getBrowseOverview());
await check("browse.getDepartmentWithCourses", () =>
	getDepartmentWithCourses(sample.dept_code)
);
await check("browse.getCourseWithClasses", () =>
	getCourseWithClasses(sample.dept_code, sample.course_code)
);
await check("browse.getClassWithSections", () =>
	getClassWithSections(userId, {
		deptCode: sample.dept_code,
		courseCode: sample.course_code,
		classCode: sample.class_code,
	})
);
await check("browse.getSectionDetail", () =>
	getSectionDetail(userId, {
		deptCode: sample.dept_code,
		courseCode: sample.course_code,
		classCode: sample.class_code,
		sectionSlug: sample.section_slug ?? "",
	})
);
await check("browse.searchCourses (fts)", () =>
	searchCourses({ query: "ingegneria", page: 1, pageSize: 5 })
);
await check("browse.searchClasses (fts)", () =>
	searchClasses({ query: "analisi", page: 1, pageSize: 5 })
);
await check("browse.getAvailableClassYears", () => getAvailableClassYears({}));
await check("browse.getDepartmentCourseList", async () => {
	const [department] = await getDepartments();
	return department ? getDepartmentCourseList(department.id) : [];
});

const [quiz] = await db
	.execute<{ id: string; user_id: string }>(
		sql`select qz.id, qa.user_id
          from quiz.quizzes qz
          join quiz.quiz_attempts qa on qa.quiz_id = qz.id
         limit 1`
	)
	.then(r => r.rows);

if (quiz) {
	await check("quiz.getQuiz", () => getQuiz(quiz.user_id, quiz.id));
} else {
	console.log("· quiz.getQuiz — skipped, no quiz in the database");
}

const [attempt] = await db
	.execute<{
		id: string;
		user_id: string;
	}>(
		sql`select id, user_id from quiz.quiz_attempts where completed_at is not null limit 1`
	)
	.then(r => r.rows);

if (attempt) {
	await check("quiz.getQuizResults", () => getQuizResults(attempt.user_id, attempt.id));
} else {
	console.log("· quiz.getQuizResults — skipped, no completed attempt");
}

if (userId) {
	await check("flashcard.getFlashcardSession", () =>
		getFlashcardSession(
			userId,
			encodeSessionId({
				mode: "user",
				seed: 1,
				sectionId: sample.section_id,
				cardCount: 5,
			})
		)
	);
} else {
	console.log("· flashcard.getFlashcardSession — skipped, no profile");
}

if (userId) {
	await check("user.getUserProfile", () => getUserProfile(userId));
	await check("user.getUserClasses", () => getUserClasses(userId));
	await check("user.getRecentClasses", () => getRecentClasses(db, userId));
	await check("user.getUserBookmarks", () => getUserBookmarks(userId));
	await check("user.getBookmarkedQuestionIds", () => getBookmarkedQuestionIds(userId));
	await check("user.getAttemptHistory", () => getAttemptHistory(userId));
	await check("user.getMastery", () => getMastery(userId));
	await check("user.getMastery (scoped)", () =>
		getMastery(userId, { scope: { level: "section", id: sample.section_id } })
	);
	await check("user.getMastery (windowed)", () =>
		getMastery(userId, { from: "2020-01-01", mode: "STUDY" })
	);
	await check("user.getDailyStudyStats", () => getDailyStudyStats(userId));
	await check("user.getDailyStudyStats (scoped)", () =>
		getDailyStudyStats(userId, { level: "section", id: sample.section_id })
	);
	await check("user.getDailyFlashcardDays", () => getDailyFlashcardDays(userId));
	await check("user.getDailyFlashcardDays (scoped)", () =>
		getDailyFlashcardDays(userId, { level: "section", id: sample.section_id })
	);
	await check("user.isClassSaved", () =>
		isClassSaved(userId, "00000000-0000-0000-0000-000000000000")
	);
	await check("requests.getUserRequests", () => getUserRequests(userId));
	await check("requests.getContentTree", () => getContentTree(userId));
	await check("notifications.getNotifications", () => getNotifications(userId));
	await check("notifications.getUnreadCount", () => getUnreadCount(userId));
	await check("legal.getAcceptanceStatus", () => getAcceptanceStatus(userId));
	await check("legal.getAcceptanceHistory", () => getAcceptanceHistory(userId));
} else {
	console.log("· notifications / legal — skipped, no profile");
}

// changelogs is absent on purpose: its version list comes from
// `import.meta.glob`, which only exists under Vite.

await check("sitemap.buildSitemap", async () => {
	const xml = await buildSitemap();
	if (!xml.startsWith("<?xml")) throw new Error("not an XML document");
	const urls = xml.match(/<url>/g)?.length ?? 0;
	if (urls < 5) throw new Error(`only ${urls} urls in the sitemap`);
	return `${urls} urls`;
});

await closeDb();

if (failures > 0) {
	console.error(`\n${failures} failing`);
	process.exitCode = 1;
} else {
	console.log("\nall read paths executed");
}
