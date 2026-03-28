import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useMutationWithToast } from "@/hooks/useMutationWithToast"

import {
  addUserClassFn,
  removeUserClassFn,
  toggleBookmarkFn,
  updateProfileFn,
} from "./server"

const CLASS_INVALIDATE_KEYS = [["user", "classes"], ["user", "class-saved"], ["user", "profile"]]

export function useAddClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (classId: string) => addUserClassFn({ data: { classId } }),
    onSuccess: () => {
      for (const key of CLASS_INVALIDATE_KEYS) {
        queryClient.invalidateQueries({ queryKey: key })
      }
      toast.success("Classe aggiunta alla tua lista")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useRemoveClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (classId: string) => removeUserClassFn({ data: { classId } }),
    onSuccess: () => {
      for (const key of CLASS_INVALIDATE_KEYS) {
        queryClient.invalidateQueries({ queryKey: key })
      }
      toast.success("Classe rimossa dalla tua lista")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateProfile() {
  return useMutationWithToast(updateProfileFn, {
    successMessage: "Profilo aggiornato",
    invalidateKeys: [["user", "profile"], ["auth", "session"]],
  })
}

// TODO: implement useDeleteAccount when proper RLS DELETE policies are in place

export function useToggleBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (questionId: string) =>
      toggleBookmarkFn({ data: { questionId } }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["user", "bookmarks"] })
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
      toast.success(
        result.action === "added"
          ? "Segnalibro aggiunto"
          : "Segnalibro rimosso",
      )
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
