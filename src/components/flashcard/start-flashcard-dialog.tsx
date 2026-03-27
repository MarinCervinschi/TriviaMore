import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { startFlashcardFn } from "@/lib/flashcard/server"

export function StartFlashcardDialog({
  open,
  onOpenChange,
  sectionId,
  maxQuestions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  maxQuestions: number
}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [cardCount, setCardCount] = useState(Math.min(20, maxQuestions))

  const handleStart = async () => {
    setLoading(true)
    try {
      const result = await startFlashcardFn({
        data: {
          sectionId,
          cardCount: Math.min(cardCount, maxQuestions),
        },
      })
      onOpenChange(false)
      navigate({
        to: "/flashcard/$sessionId",
        params: { sessionId: result.sessionId },
      })
    } catch (error) {
      console.error("Failed to start flashcard session:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configura Flashcard</DialogTitle>
          <DialogDescription>
            Scegli quante carte vuoi studiare
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Numero di carte</Label>
              <span className="text-sm font-medium tabular-nums">
                {cardCount === maxQuestions
                  ? `Tutte (${cardCount})`
                  : cardCount}
              </span>
            </div>
            <Slider
              value={[cardCount]}
              onValueChange={([v]) => setCardCount(v)}
              min={1}
              max={maxQuestions}
              step={1}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annulla
          </Button>
          <Button onClick={handleStart} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Inizia Flashcard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
