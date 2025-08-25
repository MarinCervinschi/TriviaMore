import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateRecentClass = (userId: string) => {
	const queryClient = useQueryClient();
	const updateRecentClass = useMutation({
		mutationFn: async (classId: string) => {
			const response = await fetch("/api/protected/user/recent-classes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ classId }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Errore nell'aggiornamento della classe recente"
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
		},
		onError: (error: Error) => {
			console.error("Error updating user recent class:", error);
		},
	});

	return { updateRecentClass };
};
