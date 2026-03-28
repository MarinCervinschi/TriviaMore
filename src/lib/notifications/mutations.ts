import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { deleteNotificationFn, markAllReadFn, markReadFn } from "./server"

const NOTIFICATION_KEYS = [["notifications"], ["notifications", "unreadCount"]]

export function useMarkRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markReadFn({ data: { id } }),
    onSuccess: () => {
      for (const key of NOTIFICATION_KEYS) {
        queryClient.invalidateQueries({ queryKey: key })
      }
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
      for (const key of NOTIFICATION_KEYS) {
        queryClient.invalidateQueries({ queryKey: key })
      }
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
      for (const key of NOTIFICATION_KEYS) {
        queryClient.invalidateQueries({ queryKey: key })
      }
      toast.success("Notifica eliminata")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
