import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { deleteNotificationFn, markAllReadFn, markReadFn } from "./server"

export function useMarkRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markReadFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unreadCount"],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markAllReadFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unreadCount"],
      })
      toast.success("Tutte le notifiche segnate come lette")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteNotificationFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unreadCount"],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
