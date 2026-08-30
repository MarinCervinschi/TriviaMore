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
 * Stars an attempt, through the shared wrapper: the success toast, the undo and
 * the error path all come from there. A toggle is its own inverse, so the undo is
 * the same call with the value flipped back.
 */
export function useAttemptFavorite() {
	return useMutationWithToast<{ attemptId: string; isFavorite: boolean }, unknown>(
		setAttemptFavoriteFn,
		{
			successMessage: "Preferiti aggiornati",
			invalidateKeys: [
				["user", "attempt-history"],
				["user", "profile"],
				["quiz", "results"],
			],
			undo: input =>
				setAttemptFavoriteFn({
					data: { attemptId: input.attemptId, isFavorite: !input.isFavorite },
				}),
		}
	);
}
