import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { toastUndo } from "@/lib/toast";

/**
 * Shared mutation wrapper with automatic toast notifications and cache invalidation.
 * All domain mutation hooks should use this instead of raw useMutation.
 */
export function useMutationWithToast<TInput, TOutput>(
	mutationFn: (input: { data: TInput }) => Promise<TOutput>,
	options: {
		successMessage: string;
		invalidateKeys: string[][];
		onSuccess?: () => void;
		/**
		 * The inverse call. Declaring it turns the success toast into an undoable one — for actions
		 * that are frequent and reversible, where a confirmation dialog would be read once and
		 * dismissed forever after. It receives the input that was sent and the result that came
		 * back, so an undo can address whatever the action created.
		 */
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
