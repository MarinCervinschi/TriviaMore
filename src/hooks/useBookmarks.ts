import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
			const response = await fetch("/api/protected/bookmarks/toggle", {
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
				`/api/protected/bookmarks/check?questionId=${questionId}`
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
