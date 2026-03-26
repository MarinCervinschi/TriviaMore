import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, BookOpen, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Theme toggle */}
      {mounted && (
        <div className="fixed right-4 top-4 z-10">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Back + Logo */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla home
          </Link>
          <div className="mt-3 flex items-center justify-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold gradient-text">TriviaMore</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
