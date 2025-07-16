"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RotateCcw, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react"

interface FlashcardProps {
  questions: any[]
  onBookmark: (questionId: string) => void
  bookmarkedQuestions: string[]
}

export function Flashcard({ questions, onBookmark, bookmarkedQuestions }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentQuestion = questions[currentIndex]
  const isBookmarked = bookmarkedQuestions.includes(currentQuestion?.id)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % questions.length)
    setIsFlipped(false)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length)
    setIsFlipped(false)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleBookmark = () => {
    onBookmark(currentQuestion.id)
  }

  if (!currentQuestion) {
    return <div>No questions available</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Flashcards</h2>
        <div className="text-sm text-gray-600">
          {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="relative">
        <Card className="min-h-[300px] cursor-pointer transition-transform hover:scale-[1.02]" onClick={handleFlip}>
          <CardContent className="p-8 flex flex-col justify-center items-center text-center min-h-[300px]">
            {!isFlipped ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-500 uppercase tracking-wide">Question</div>
                <div className="text-lg font-medium">{currentQuestion.content}</div>
                <div className="text-sm text-gray-400">Click to reveal answer</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-green-600 uppercase tracking-wide">Answer</div>
                <div className="text-lg font-medium text-green-700">{currentQuestion.correctAnswer}</div>
                {currentQuestion.explanation && (
                  <div className="text-sm text-gray-600 italic">{currentQuestion.explanation}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            handleBookmark()
          }}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-blue-500" /> : <Bookmark className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handlePrevious}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button variant="outline" onClick={handleFlip}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Flip Card
        </Button>

        <Button variant="outline" onClick={handleNext}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">Section: {currentQuestion.section.name}</div>
        <div className="text-xs text-gray-500">
          {currentQuestion.section.class.name} • {currentQuestion.section.class.course.name}
        </div>
      </div>
    </div>
  )
}
