import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { toastUndo } from "@/lib/toast";

import {
	addUserClassFn,
	removeUserClassFn,
	setAttemptFavoriteFn,
	toggleBookmarkFn,
	updateProfileFn,
} from "./api";
import type { AttemptHistoryEntry } from "./types";

const CLASS_INVALIDATE_KEYS = [
	["user", "classes"],
	["user", "class-saved"],
	["user", "profile"],
];

export function useAddClass() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ classId, courseId }: { classId: string; courseId: string }) =>
			addUserClassFn({ data: { classId, courseId } }),
		onSuccess: () => {
			for (const key of CLASS_INVALIDATE_KEYS) {
				queryClient.invalidateQueries({ queryKey: key });
			}
			toast.success("Insegnamento aggiunto alla tua lista");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useRemoveClass() {
	const queryClient = useQueryClient();

	const invalidate = () => {
		for (const key of CLASS_INVALIDATE_KEYS) {
			queryClient.invalidateQueries({ queryKey: key });
		}
	};

	return useMutation({
		mutationFn: ({ classId }: { classId: string; courseId: string | null }) =>
			removeUserClassFn({ data: { classId } }),
		onSuccess: (_result, { classId, courseId }) => {
			invalidate();
			// Re-adding needs the course, so a row that has lost it cannot be put back.
			if (!courseId) {
				toast.success("Insegnamento rimosso dalla tua lista");
				return;
			}
			toastUndo("Classe rimossa dalla tua lista", () => {
				addUserClassFn({ data: { classId, courseId } })
					.then(invalidate)
					.catch((error: Error) => toast.error(error.message));
			});
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useUpdateProfile() {
	return useMutationWithToast(updateProfileFn, {
		successMessage: "Profilo aggiornato",
		invalidateKeys: [
			["user", "profile"],
			["auth", "session"],
		],
	});
}

// TODO: implement useDeleteAccount when proper RLS DELETE policies are in place

export function useToggleBookmark() {
	const queryClient = useQueryClient();

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["user", "bookmarks"] });
		queryClient.invalidateQueries({ queryKey: ["user", "bookmarked-ids"] });
		queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
	};

	return useMutation({
		mutationFn: (questionId: string) => toggleBookmarkFn({ data: { questionId } }),
		onSuccess: (result, questionId) => {
			invalidate();
			// A toggle is its own inverse, so the reversal is the same call again.
			toastUndo(
				result.action === "added" ? "Segnalibro aggiunto" : "Segnalibro rimosso",
				() => {
					toggleBookmarkFn({ data: { questionId } })
						.then(invalidate)
						.catch((error: Error) => toast.error(error.message));
				}
			);
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

/**
 * Stars an attempt. The list is patched before the round trip and rolled back if
 * it fails: a star that waits for the server reads as a broken button, and the
 * call carries the wanted value, so a double click cannot undo itself.
 */
export function useAttemptFavorite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			attemptId,
			isFavorite,
		}: {
			attemptId: string;
			isFavorite: boolean;
		}) => setAttemptFavoriteFn({ data: { attemptId, isFavorite } }),
		onMutate: async ({ attemptId, isFavorite }) => {
			const key = ["user", "attempt-history"];
			await queryClient.cancelQueries({ queryKey: key });
			const previous = queryClient.getQueriesData<AttemptHistoryEntry[]>({
				queryKey: key,
			});
			for (const [queryKey, rows] of previous) {
				if (!rows) continue;
				queryClient.setQueryData(
					queryKey,
					rows.map(row => (row.id === attemptId ? { ...row, isFavorite } : row))
				);
			}
			return { previous };
		},
		onSuccess: (_result, { attemptId, isFavorite }) => {
			// Reversible and frequent, so it gets an undo rather than a confirmation —
			// and the reversal is the same call with the value flipped back.
			toastUndo(isFavorite ? "Aggiunto ai preferiti" : "Rimosso dai preferiti", () => {
				setAttemptFavoriteFn({ data: { attemptId, isFavorite: !isFavorite } })
					.then(() =>
						queryClient.invalidateQueries({ queryKey: ["user", "attempt-history"] })
					)
					.catch((error: Error) => toast.error(error.message));
			});
		},
		onError: (_error, _input, context) => {
			for (const [queryKey, rows] of context?.previous ?? []) {
				queryClient.setQueryData(queryKey, rows);
			}
			toast.error("Non è stato possibile salvare il preferito");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "attempt-history"] });
			queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
		},
	});
}
