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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { startFlashcardFn, generateGuestFlashcardFn } from "@/lib/flashcard/server"
import { setGuestFlashcardSession } from "@/lib/flashcard/session"

export function StartFlashcardDialog({
  open,
  onOpenChange,
  sectionId,
  maxQuestions,
  isAuthenticated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  maxQuestions: number
  isAuthenticated: boolean
}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [cardCount, setCardCount] = useState("20")

  const handleStart = async () => {
    setLoading(true)
    try {
      if (isAuthenticated) {
        const result = await startFlashcardFn({
          data: {
            sectionId,
            cardCount: Math.min(parseInt(cardCount), maxQuestions),
          },
        })
        onOpenChange(false)
        navigate({
          to: "/flashcard/$sessionId",
          params: { sessionId: result.sessionId },
        })
      } else {
        const session = await generateGuestFlashcardFn({
          data: {
            sectionId,
            cardCount: Math.min(parseInt(cardCount), maxQuestions),
          },
        })
        if (session) {
          setGuestFlashcardSession(session.id, session)
          onOpenChange(false)
          navigate({
            to: "/flashcard/$sessionId",
            params: { sessionId: session.id },
          })
        }
      }
    } catch (error) {
      console.error("Failed to start flashcard session:", error)
    } finally {
      setLoading(false)
    }
  }

  const countOptions = [5, 10, 20].filter((n) => n <= maxQuestions)
  if (!countOptions.includes(maxQuestions)) countOptions.push(maxQuestions)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configura Flashcard</DialogTitle>
          <DialogDescription>
            Scegli quante carte vuoi studiare
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Numero di carte</Label>
            <Select value={cardCount} onValueChange={setCardCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countOptions.map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n === maxQuestions ? `Tutte (${n})` : n.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
