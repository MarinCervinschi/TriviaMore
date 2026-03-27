import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  addUserClassFn,
  deleteAccountFn,
  removeUserClassFn,
  toggleBookmarkFn,
  updateProfileFn,
} from "./server"

export function useAddClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (classId: string) => addUserClassFn({ data: { classId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "classes"] })
      queryClient.invalidateQueries({ queryKey: ["user", "class-saved"] })
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
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
    mutationFn: (classId: string) =>
      removeUserClassFn({ data: { classId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "classes"] })
      queryClient.invalidateQueries({ queryKey: ["user", "class-saved"] })
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
      toast.success("Classe rimossa dalla tua lista")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; image?: string | null }) =>
      updateProfileFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
      toast.success("Profilo aggiornato")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteAccountFn(),
    onSuccess: () => {
      queryClient.clear()
      window.location.href = "/"
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

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
