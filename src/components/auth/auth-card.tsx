import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { useTheme } from "@/hooks/useTheme"

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  const { mounted, isDark, toggleTheme } = useTheme()

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Mesh gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background dark:from-primary/15 dark:via-background dark:to-background" />
        <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/12 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-orange-400/15 blur-[100px] dark:bg-orange-500/10" />
        <div className="absolute bottom-1/4 left-1/3 h-[350px] w-[350px] rounded-full bg-red-300/10 blur-[90px] dark:bg-red-500/8" />
        <div className="absolute inset-0 dot-pattern" />
      </div>

      {/* Theme toggle */}
      {mounted && (
        <div className="fixed right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl backdrop-blur-sm bg-card/50"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Cambia tema</span>
          </Button>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Back link */}
        <div className="mb-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla home
          </Link>
        </div>

        {/* Glass card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-card/80 p-8 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-card/60">
          {/* Logo + title */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <Logo size="lg" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
