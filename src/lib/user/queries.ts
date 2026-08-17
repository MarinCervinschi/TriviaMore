import { queryOptions } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/shared/cache";

import {
	getAttemptHistoryFn,
	getBookmarkedQuestionIdsFn,
	getMasteryFn,
	getRecentClassesFn,
	getStudyStatsFn,
	getUserBookmarksFn,
	getUserClassesFn,
	getUserProfileFn,
	getUserProgressFn,
	isClassSavedFn,
} from "./api";
import type { MasteryScope } from "./schemas";

export const userQueries = {
	profile: () =>
		queryOptions({
			queryKey: ["user", "profile"],
			queryFn: () => getUserProfileFn(),
			staleTime: STALE_TIME.STANDARD,
		}),

	classes: () =>
		queryOptions({
			queryKey: ["user", "classes"],
			queryFn: () => getUserClassesFn(),
			staleTime: STALE_TIME.STANDARD,
		}),

	bookmarks: () =>
		queryOptions({
			queryKey: ["user", "bookmarks"],
			queryFn: () => getUserBookmarksFn(),
			staleTime: STALE_TIME.STANDARD,
		}),

	bookmarkedIds: () =>
		queryOptions({
			queryKey: ["user", "bookmarked-ids"],
			queryFn: () => getBookmarkedQuestionIdsFn(),
			staleTime: STALE_TIME.STANDARD,
		}),

	progress: () =>
		queryOptions({
			queryKey: ["user", "progress"],
			queryFn: () => getUserProgressFn(),
			staleTime: STALE_TIME.STANDARD,
		}),

	attemptHistory: () =>
		queryOptions({
			queryKey: ["user", "attempt-history"],
			queryFn: () => getAttemptHistoryFn(),
			staleTime: STALE_TIME.STANDARD,
		}),

	mastery: (scope?: MasteryScope) =>
		queryOptions({
			queryKey: ["user", "mastery", scope ?? null],
			queryFn: () => getMasteryFn(scope ? { data: scope } : undefined),
			staleTime: STALE_TIME.STANDARD,
		}),

	studyStats: (scope?: MasteryScope) =>
		queryOptions({
			queryKey: ["user", "study-stats", scope ?? null],
			queryFn: () => getStudyStatsFn(scope ? { data: scope } : undefined),
			staleTime: STALE_TIME.STANDARD,
		}),

	recentClasses: () =>
		queryOptions({
			queryKey: ["user", "recent-classes"],
			queryFn: () => getRecentClassesFn(),
			staleTime: STALE_TIME.STANDARD,
		}),

	isClassSaved: (classId: string) =>
		queryOptions({
			queryKey: ["user", "class-saved", classId],
			queryFn: () => isClassSavedFn({ data: { classId } }),
			staleTime: STALE_TIME.STANDARD,
		}),
};
