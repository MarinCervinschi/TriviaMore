import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { pinAchievementsFn } from "./api";

export function usePinAchievements() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (keys: string[]) => pinAchievementsFn({ data: { keys } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["achievements"] });
			queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
		},
		onError: (error: Error) => toast.error(error.message),
	});
}
