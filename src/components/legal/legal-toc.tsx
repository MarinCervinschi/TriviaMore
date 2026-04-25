import { List } from "lucide-react"

import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  text: string
}

interface LegalTocProps {
  items: TocItem[]
  className?: string
}

/**
 * Sticky sidebar table of contents. Items are extracted from the `##`
 * headings of the source markdown. Visible on large viewports; the
 * mobile layout omits it — headings themselves remain navigable via
 * the document scroll.
 */
export function LegalToc({ items, className }: LegalTocProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Sommario del documento"
      className={cn(
        "sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <List className="h-3.5 w-3.5" />
        In questa pagina
      </div>
      <ol className="space-y-2.5 border-l border-border/60 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="-ml-px block border-l border-transparent py-0.5 pl-4 leading-snug text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-foreground"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
