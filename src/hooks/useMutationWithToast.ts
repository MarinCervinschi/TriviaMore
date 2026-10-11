import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastUndo } from "@/lib/toast";

export function useMutationWithToast<TInput, TOutput>(
	mutationFn: (input: { data: TInput }) => Promise<TOutput>,
	options: {
		successMessage: string;
		invalidateKeys: string[][];
		onSuccess?: () => void;
		/** Turns the success toast into an undoable one; it receives the input sent and the result. */
		undo?: (input: TInput, output: TOutput) => Promise<unknown>;
	}
) {
	const queryClient = useQueryClient();

	const invalidate = () => {
		for (const key of options.invalidateKeys) {
			queryClient.invalidateQueries({ queryKey: key });
		}
	};

	return useMutation({
		mutationFn: (data: TInput) => mutationFn({ data }),
		onSuccess: (output, input) => {
			invalidate();
			if (options.undo) {
				const undo = options.undo;
				toastUndo(options.successMessage, () => {
					undo(input, output)
						.then(invalidate)
						.catch((error: Error) => toast.error(error.message));
				});
			} else {
				toast.success(options.successMessage);
			}
			options.onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}
