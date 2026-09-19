import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { setEnrollmentFn } from "./api";
import type { SetEnrollmentInput } from "./schemas";

export function useSetEnrollment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SetEnrollmentInput) => setEnrollmentFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["crm"] });
			toast.success("Corso di studi salvato");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}
