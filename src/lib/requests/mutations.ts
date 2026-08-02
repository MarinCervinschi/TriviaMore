import { useMutationWithToast } from "@/hooks/useMutationWithToast"

import {
  acknowledgeRequestFn,
  approveRequestFn,
  createRequestFn,
  deleteReportFn,
  handleRequestFn,
  reviseRequestFn,
  updateReportFn,
} from "./api"

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

export function useUpdateReport(onSuccess?: () => void) {
  return useMutationWithToast(updateReportFn, {
    successMessage: "Segnalazione aggiornata",
    invalidateKeys: [
      ["requests", "mine"],
      ["admin", "requests"],
      ["admin", "requestCount"],
    ],
    onSuccess,
  })
}

export function useDeleteReport(onSuccess?: () => void) {
  return useMutationWithToast(deleteReportFn, {
    successMessage: "Segnalazione eliminata",
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

export function useAcknowledgeRequest(onSuccess?: () => void) {
  return useMutationWithToast(acknowledgeRequestFn, {
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
