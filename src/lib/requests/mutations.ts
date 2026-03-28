import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  addRequestCommentFn,
  createRequestFn,
  handleRequestFn,
  reviseRequestFn,
} from "./server"

function useMutationWithToast<TInput, TOutput>(
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

// ─── User Mutations ───

export function useCreateRequest(onSuccess?: () => void) {
  return useMutationWithToast(createRequestFn, {
    successMessage: "Richiesta inviata con successo",
    invalidateKeys: [
      ["requests", "mine"],
      ["admin", "requests"],
      ["admin", "requestCount"],
      ["notifications"],
      ["notifications", "unreadCount"],
    ],
    onSuccess,
  })
}

export function useReviseRequest(onSuccess?: () => void) {
  return useMutationWithToast(reviseRequestFn, {
    successMessage: "Richiesta aggiornata con successo",
    invalidateKeys: [
      ["requests", "mine"],
      ["requests", "detail"],
      ["admin", "requests"],
      ["admin", "requestCount"],
    ],
    onSuccess,
  })
}

// ─── Admin Mutations ───

export function useHandleRequest(onSuccess?: () => void) {
  return useMutationWithToast(handleRequestFn, {
    successMessage: "Richiesta gestita con successo",
    invalidateKeys: [
      ["admin", "requests"],
      ["admin", "requestCount"],
      ["requests", "mine"],
      ["requests", "detail"],
      ["notifications"],
      ["notifications", "unreadCount"],
    ],
    onSuccess,
  })
}

export function useAddRequestComment(onSuccess?: () => void) {
  return useMutationWithToast(addRequestCommentFn, {
    successMessage: "Commento aggiunto",
    invalidateKeys: [
      ["requests", "detail"],
      ["notifications"],
      ["notifications", "unreadCount"],
    ],
    onSuccess,
  })
}
