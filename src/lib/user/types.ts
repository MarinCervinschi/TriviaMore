import type { profiles, progress, questions } from "@/db/schema";
import type { QuizMode } from "@/lib/quiz/types";

type Profile = typeof profiles.$inferSelect;
type QuestionRow = typeof questions.$inferSelect;

export type ActivityDay = { date: string; value: number };

export type UserProfile = Profile & {
	stats: UserStats;
	recentClasses: RecentClass[];
	recentQuizAttempts: RecentQuizAttempt[];
	activity: { days: ActivityDay[]; endDate: string };
};

export type UserStats = {
	quizAttemptsCount: number;
	userClassesCount: number;
	bookmarksCount: number;
	totalQuizzes: number;
	averageScore: number;
};

// A class as it appears in a user's own lists: the class itself, the junction
// fields for the course they saved it under, and that course's department.
type EnrolledClass = {
	classId: string;
	className: string;
	classCode: string | null;
	classYear: number | null;
	mandatory: boolean | null;
	catalogueUrl: string | null;
	curriculum: string | null;
	courseId: string;
	courseName: string;
	courseCode: string;
	courseType: string;
	departmentId: string;
	departmentName: string;
	departmentCode: string;
};

export type UserClass = EnrolledClass & {
	createdAt: string;
};

export type RecentClass = EnrolledClass & {
	lastVisited: string;
	visitCount: number;
};

// Where a section sits in the catalog, resolved through the primary course of
// its class.
type SectionLocation = {
	sectionId: string;
	sectionName: string;
	classId: string;
	className: string;
	courseId: string | null;
	courseName: string | null;
	departmentId: string | null;
	departmentName: string | null;
};

export type UserBookmark = SectionLocation &
	Pick<
		QuestionRow,
		| "content"
		| "questionType"
		| "options"
		| "correctAnswer"
		| "explanation"
		| "difficulty"
	> & {
		questionId: string;
		createdAt: string;
	};

export type RecentQuizAttempt = SectionLocation & {
	id: string;
	score: number;
	completedAt: string;
	classCode: string | null;
	courseCode: string | null;
	departmentCode: string | null;
};

// One UTC day of study for one quiz mode. The client windows and sub-buckets
// these into week/month/year metrics, and splits STUDY vs EXAM_SIMULATION.
export type DailyStudyStat = {
	date: string;
	quizMode: QuizMode;
	quizzes: number;
	/** Sum of attempt grades (0–33), for a weighted average. */
	gradeSum: number;
	timeSpent: number;
	answersTotal: number;
	answersCorrect: number;
};

// Per-question mastery, aggregated from the frozen `answer_attempts` verdicts.
export type MasteryBreakdown = { key: string; total: number; correct: number };

export type SectionAccuracy = {
	sectionId: string;
	sectionName: string | null;
	courseName: string | null;
	path: string | null;
	total: number;
	correct: number;
	/** Mean seconds per answered question in this section (null when untimed). */
	avgSeconds: number | null;
};

export type UserMastery = {
	totalAnswers: number;
	/** Mean seconds per answered question across the scope (null when untimed). */
	avgSecondsPerQuestion: number | null;
	byDifficulty: MasteryBreakdown[];
	weakSections: SectionAccuracy[];
	strongSections: SectionAccuracy[];
};

export type AttemptHistoryEntry = {
	id: string;
	score: number;
	timeSpent: number | null;
	completedAt: string;
	quizMode: QuizMode | null;
	sectionId: string | null;
	sectionName: string | null;
	classId: string | null;
	className: string | null;
	classCode: string | null;
	courseId: string | null;
	courseName: string | null;
	courseCode: string | null;
	departmentId: string | null;
	departmentName: string | null;
	departmentCode: string | null;
};

export type UserProgress = SectionLocation &
	Pick<
		typeof progress.$inferSelect,
		| "id"
		| "quizMode"
		| "quizzesTaken"
		| "averageScore"
		| "bestScore"
		| "totalTimeSpent"
		| "lastAccessedAt"
	>;
