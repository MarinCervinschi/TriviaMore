import { useEffect, useState } from "react"

import { useThemeContext } from "@/providers/theme-provider"

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useThemeContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      theme: undefined as string | undefined,
      setTheme,
      resolvedTheme: undefined as string | undefined,
      mounted: false,
      isDark: false,
      isLight: false,
      isSystem: false,
      toggleTheme: () => {},
      setLightTheme: () => {},
      setDarkTheme: () => {},
      setSystemTheme: () => {},
    }
  }

  const isDark = resolvedTheme === "dark"
  const isLight = resolvedTheme === "light"
  const isSystem = theme === "system"

  return {
    theme,
    setTheme,
    resolvedTheme,
    mounted: true,
    isDark,
    isLight,
    isSystem,
    toggleTheme: () => setTheme(isDark ? "light" : "dark"),
    setLightTheme: () => setTheme("light"),
    setDarkTheme: () => setTheme("dark"),
    setSystemTheme: () => setTheme("system"),
  }
}
