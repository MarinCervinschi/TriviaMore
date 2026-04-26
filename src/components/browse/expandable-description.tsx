import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface ExpandableDescriptionProps {
  text: string
  className?: string
  textClassName?: string
  collapsedLines?: number
}

export function ExpandableDescription({
  text,
  className,
  textClassName,
  collapsedLines = 3,
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  // Reset expansion when the source text changes (e.g. SSR navigation between pages).
  useEffect(() => {
    setIsExpanded(false)
  }, [text])

  // Measure overflow only while collapsed; once detected the toggle remains
  // available even when the user expands and collapses again.
  useEffect(() => {
    if (isExpanded) return
    const el = ref.current
    if (!el) return

    const check = () => {
      setNeedsToggle(el.scrollHeight - el.clientHeight > 1)
    }
    check()

    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [isExpanded, text])

  return (
    <div className={className}>
      <p
        ref={ref}
        style={
          !isExpanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: collapsedLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
        className={cn("text-base text-muted-foreground", textClassName)}
      >
        {text}
      </p>
      {needsToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
        >
          {isExpanded ? "Mostra meno" : "Mostra di più"}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      )}
    </div>
  )
}
