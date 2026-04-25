import { useMutation, useQueryClient } from "@tanstack/react-query"

import { markChangelogsReadFn } from "./server"

import type { MarkChangelogsReadInput } from "./schemas"

// Silent fire-and-forget mutation: invoked when /news mounts so the
// megaphone badge clears. No toast — the badge update is the feedback.
export function useMarkChangelogsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkChangelogsReadInput) =>
      markChangelogsReadFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["changelogs", "unreadVersions"],
      })
    },
  })
}
