import Link from "next/link"
import { Button } from "@components/ui/button"

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Quiz App
        </Link>
        <nav>
          <Button asChild variant="ghost">
            <Link href="/">Home</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

