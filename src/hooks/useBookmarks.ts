import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { BookmarkData } from "@/components/pages/User/Bookmarks";

interface BookmarkToggleResponse {
	bookmarked: boolean;
	message: string;
}

interface BookmarkCheckResponse {
	bookmarked: boolean;
}

export function useBookmarkToggle(userId: string | undefined, questionId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (): Promise<BookmarkToggleResponse> => {
			const response = await fetch("/api/protected/user/bookmarks/toggle", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ questionId }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore durante il toggle del bookmark");
			}

			return response.json();
		},
		onSuccess: data => {
			queryClient.invalidateQueries({ queryKey: ["bookmark", userId, questionId] });
			queryClient.invalidateQueries({ queryKey: ["userBookmarks", userId] });
			queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });

			toast.success(data.message);
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

export function useBookmarkCheck(
	userId: string | undefined,
	questionId: string,
	enabled: boolean = true
) {
	return useQuery({
		queryKey: ["bookmark", userId, questionId],
		queryFn: async (): Promise<BookmarkCheckResponse> => {
			const response = await fetch(
				`/api/protected/user/bookmarks/check?questionId=${questionId}`
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Errore durante la verifica del bookmark");
			}

			return response.json();
		},
		enabled,
	});
}

const fetchBookmarks = async () => {
	const response = await fetch(`/api/protected/user/bookmarks`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Errore durante il recupero dei segnalibri");
	}

	return response.json();
};

export function useUserBookmarks(userId: string) {
	return useQuery<BookmarkData[]>({
		queryKey: ["userBookmarks", userId],
		queryFn: fetchBookmarks,
		enabled: !!userId,
	});
}
