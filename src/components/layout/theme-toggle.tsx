import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/hooks/useTheme"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { mounted, isDark, toggleTheme } = useTheme()

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl"
        disabled
      />
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-xl"
      onClick={toggleTheme}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Cambia tema</span>
    </Button>
  )
}
