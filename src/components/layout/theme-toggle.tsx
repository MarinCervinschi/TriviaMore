import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"
import { Button, type ButtonProps } from "@/components/ui/button"

interface ThemeIconsProps {
  className?: string
  strokeWidth?: number
}

export function ThemeIcons({ className, strokeWidth = 2 }: ThemeIconsProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Sun
        strokeWidth={strokeWidth}
        className="rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0 motion-reduce:transition-none"
      />
      <Moon
        strokeWidth={strokeWidth}
        className="absolute inset-0 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100 motion-reduce:transition-none"
      />
    </span>
  )
}

interface ThemeToggleProps
  extends Omit<ButtonProps, "onClick" | "children" | "asChild"> {}

export function ThemeToggle({
  variant = "ghost",
  size = "icon",
  className,
  disabled,
  ...rest
}: ThemeToggleProps) {
  const { mounted, toggleTheme } = useTheme()

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-xl", className)}
      onClick={(event) => toggleTheme(event.nativeEvent)}
      disabled={disabled || !mounted}
      aria-label="Cambia tema"
      {...rest}
    >
      <ThemeIcons />
      <span className="sr-only">Cambia tema</span>
    </Button>
  )
}
