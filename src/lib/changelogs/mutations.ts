import { useMutationWithToast } from "@/hooks/useMutationWithToast"

import {
  createChangelogFn,
  updateChangelogFn,
  deleteChangelogFn,
  publishChangelogFn,
} from "./server"

export function useCreateChangelog(onSuccess?: () => void) {
  return useMutationWithToast(createChangelogFn, {
    successMessage: "Changelog creato con successo",
    invalidateKeys: [["admin", "changelogs"]],
    onSuccess,
  })
}

export function useUpdateChangelog(onSuccess?: () => void) {
  return useMutationWithToast(updateChangelogFn, {
    successMessage: "Changelog aggiornato con successo",
    invalidateKeys: [
      ["admin", "changelogs"],
      ["admin", "changelog"],
      ["changelogs"],
    ],
    onSuccess,
  })
}

export function useDeleteChangelog(onSuccess?: () => void) {
  return useMutationWithToast(deleteChangelogFn, {
    successMessage: "Changelog eliminato con successo",
    invalidateKeys: [["admin", "changelogs"], ["changelogs"]],
    onSuccess,
  })
}

export function usePublishChangelog(onSuccess?: () => void) {
  return useMutationWithToast(publishChangelogFn, {
    successMessage: "Changelog pubblicato e notifiche inviate",
    invalidateKeys: [
      ["admin", "changelogs"],
      ["admin", "changelog"],
      ["changelogs"],
      ["notifications"],
      ["notifications", "unreadCount"],
    ],
    onSuccess,
  })
}
