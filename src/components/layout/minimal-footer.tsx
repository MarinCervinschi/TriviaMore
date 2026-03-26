import { Link } from "@tanstack/react-router"
import { BookOpen } from "lucide-react"

export function MinimalFooter() {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold">TriviaMore</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="https://github.com/MarinCervinschi/TriviaMore"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <Link
              to="/about"
              className="transition-colors hover:text-foreground"
            >
              Chi siamo
            </Link>
            <Link
              to="/contact"
              className="transition-colors hover:text-foreground"
            >
              Contattaci
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TriviaMore.
          </div>
        </div>
      </div>
    </footer>
  )
}
