"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Previeni idratazione diversa lato client/server
  if (!mounted) {
    return {
      theme: undefined,
      setTheme,
      resolvedTheme: undefined,
      systemTheme: undefined,
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

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const setLightTheme = () => setTheme("light")
  const setDarkTheme = () => setTheme("dark")
  const setSystemTheme = () => setTheme("system")

  return {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    mounted: true,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  }
}
