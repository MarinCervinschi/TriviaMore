import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * Shared mutation wrapper with automatic toast notifications and cache invalidation.
 * All domain mutation hooks should use this instead of raw useMutation.
 */
export function useMutationWithToast<TInput, TOutput>(
  mutationFn: (input: { data: TInput }) => Promise<TOutput>,
  options: {
    successMessage: string
    invalidateKeys: string[][]
    onSuccess?: () => void
  },
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TInput) => mutationFn({ data }),
    onSuccess: () => {
      for (const key of options.invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
      toast.success(options.successMessage)
      options.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
