import { createFileRoute, redirect } from "@tanstack/react-router"

import { verifyEmailFn } from "@/lib/auth/server"

export const Route = createFileRoute("/auth/confirm")({
  validateSearch: (search: Record<string, unknown>) => ({
    token_hash: typeof search.token_hash === "string" ? search.token_hash : "",
    type: typeof search.type === "string" ? search.type : "",
  }),
  beforeLoad: async ({ search }) => {
    if (!search.token_hash || !search.type) {
      throw redirect({ to: "/auth/auth-code-error" })
    }

    const result = await verifyEmailFn({
      data: { token_hash: search.token_hash, type: search.type },
    })

    if (!result.success) {
      throw redirect({ to: "/auth/auth-code-error" })
    }

    throw redirect({ to: "/user" })
  },
  component: () => null,
})
