import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  acknowledgeReportFn,
  approveRequestFn,
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
    successMessage: "Proposta inviata con successo",
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
    successMessage: "Proposta aggiornata con successo",
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
    successMessage: "Proposta gestita con successo",
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

export function useApproveRequest(onSuccess?: () => void) {
  return useMutationWithToast(approveRequestFn, {
    successMessage: "Contenuto approvato e pubblicato!",
    invalidateKeys: [
      ["admin", "requests"],
      ["admin", "requestCount"],
      ["admin", "stats"],
      ["requests", "mine"],
      ["requests", "detail"],
      ["notifications"],
      ["notifications", "unreadCount"],
      ["browse"],
    ],
    onSuccess,
  })
}

export function useAcknowledgeReport(onSuccess?: () => void) {
  return useMutationWithToast(acknowledgeReportFn, {
    successMessage: "Segnalazione presa in carico",
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
