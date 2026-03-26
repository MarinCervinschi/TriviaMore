import { useState } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToggleBookmark } from "@/lib/user/mutations"
import { cn } from "@/lib/utils"

export function BookmarkButton({
  questionId,
  isGuest,
  className,
}: {
  questionId: string
  isGuest: boolean
  className?: string
}) {
  const toggleBookmark = useToggleBookmark()
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isGuest) return

    setIsBookmarked((prev) => !prev)
    toggleBookmark.mutate(questionId, {
      onError: () => setIsBookmarked((prev) => !prev),
    })
  }

  if (isGuest) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled
              className={cn("h-9 w-9 rounded-xl opacity-50", className)}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Accedi per salvare le domande</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            disabled={toggleBookmark.isPending}
            className={cn(
              "h-9 w-9 rounded-xl transition-all",
              isBookmarked && "text-primary hover:text-primary/80",
              className,
            )}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isBookmarked
              ? "Rimuovi dai segnalibri"
              : "Aggiungi ai segnalibri"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
