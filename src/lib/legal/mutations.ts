import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { recordLegalAcceptanceFn } from "./api"
import type { AcceptLegalInput } from "./schemas"

export function useAcceptLegal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AcceptLegalInput) =>
      recordLegalAcceptanceFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["legal", "acceptance-status"],
      })
      toast.success("Accettazione registrata")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
