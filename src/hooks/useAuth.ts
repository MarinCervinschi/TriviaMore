import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useVolatileQuery } from "@/providers/react-query-provider"
import {
  getSessionFn,
  loginFn,
  logoutFn,
  signupFn,
} from "@/lib/auth/server"
import type { AuthSession } from "@/lib/auth/types"

export function useAuth() {
  const queryClient = useQueryClient()

  const {
    data: session,
    isLoading,
    error,
  } = useVolatileQuery<AuthSession | null>({
    queryKey: ["auth", "session"],
    queryFn: () => getSessionFn(),
    retry: false,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["volatile", "auth", "session"],
    })

  const login = useMutation({
    mutationFn: loginFn,
    onSuccess: invalidate,
  })

  const signup = useMutation({
    mutationFn: signupFn,
    onSuccess: invalidate,
  })

  const logout = useMutation({
    mutationFn: logoutFn,
    onSuccess: invalidate,
  })

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    isAuthenticated: !!session,
    error,
    login,
    signup,
    logout,
  }
}
