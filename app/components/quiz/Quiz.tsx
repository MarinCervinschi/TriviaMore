"use client"

import { useState, useCallback, createElement } from "react"
import { QuizSection, getRandomQuestions } from "@/lib/quiz-data"
import { Checkbox } from "@components/ui/checkbox"
import { Button } from "@components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@components/ui/card"
import { SectionSelector } from "./SectionSelector"
import { Timer } from "./Timer"

interface QuizProps {
  sections: QuizSection[]
}

export function Quiz({ sections }: QuizProps) {
  const [selectedSection, setSelectedSection] = useState<QuizSection | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[][]>([])
  const [showResults, setShowResults] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const handleSectionSelect = useCallback(
    (sectionId: string) => {
      const section = sections.find((s) => s.id === sectionId)
      if (section) {
        setSelectedSection(section)
        setCurrentQuestion(0)
        setUserAnswers(section.questions.map(() => []))
        setShowResults(false)
        setScores([])
        setIsTimerRunning(true)
      }
    },
    [sections],
  )

  const handleRandomSelect = useCallback(() => {
    const randomSection = getRandomQuestions()
    setSelectedSection(randomSection)
    setCurrentQuestion(0)
    setUserAnswers(randomSection.questions.map(() => []))
    setShowResults(false)
    setScores([])
    setIsTimerRunning(true)
  }, [])

  const handleAnswerChange = (optionIndex: number) => {
    if (!selectedSection) return

    setUserAnswers((prev) => {
      const newAnswers = [...prev]
      const currentAnswers = newAnswers[currentQuestion]
      if (currentAnswers?.includes(optionIndex)) {
        newAnswers[currentQuestion] = currentAnswers.filter((i) => i !== optionIndex)
      } else {
        newAnswers[currentQuestion] = [...currentAnswers, optionIndex]
      }
      return newAnswers
    })
  }

  const handleNext = () => {
    if (!selectedSection) return

    if (currentQuestion < selectedSection.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      calculateScores()
      setShowResults(true)
      setIsTimerRunning(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const calculateScores = () => {
    if (!selectedSection) return

    const newScores = selectedSection.questions.map((question, index) => {
      const userAnswer = userAnswers[index]
      const correctAnswers = question.correctAnswers

      const correctGuesses = userAnswer.filter((answer) => correctAnswers.includes(answer)).length
      const incorrectGuesses = userAnswer.filter((answer) => !correctAnswers.includes(answer)).length

      const totalCorrectAnswers = correctAnswers.length
      const score = Math.max(0, (correctGuesses / totalCorrectAnswers) - (incorrectGuesses / totalCorrectAnswers))

      return Math.round(score * 100) / 100 // Round to 2 decimal places
    })

    setScores(newScores)
  }

  const resetQuiz = () => {
    setSelectedSection(null)
    setCurrentQuestion(0)
    setUserAnswers([])
    setShowResults(false)
    setScores([])
    setIsTimerRunning(false)
  }

  if (!selectedSection) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <SectionSelector
            sections={sections}
            onSelectSection={handleSectionSelect}
            onSelectRandom={handleRandomSelect}
          />
        </CardContent>
      </Card>
    )
  }

  if (showResults) {
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className='flex'>{selectedSection.icon && createElement(selectedSection.icon)}&nbsp;{selectedSection.name} Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold mb-4">
            Your total score: {totalScore.toFixed(2)} out of {selectedSection.questions.length}
          </p>
          {selectedSection.questions.map((question, index) => (
            <div key={question.id} className="mb-6">
              <p className="font-medium mb-2">{question.question}</p>
              <p className="text-sm text-gray-600 mb-2">Section: {question.section}</p>
              <p className="text-sm font-semibold mb-2">Your score: {scores[index].toFixed(2)}</p>
              {question.options.map((option, optionIndex) => {
                const isCorrect = question.correctAnswers.includes(optionIndex)
                const isSelected = userAnswers[index].includes(optionIndex)
                let textColorClass = "";
                if (isSelected) {
                  textColorClass = isCorrect ? "text-green-600" : "text-red-600"
                }
                return (
                  <div key={optionIndex} className={`flex items-center space-x-2 mb-1 ${textColorClass}`}>
                    <span className="text-sm">{isSelected ? (isCorrect ? "✓" : "✗") : "○"}</span>
                    <span className="text-sm">{option}</span>
                    {isCorrect && !isSelected && <span className="text-green-600 text-sm ml-2">(Correct)</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={resetQuiz}>Choose Another Section</Button>
        </CardFooter>
      </Card>
    )
  }

  const question = selectedSection.questions[currentQuestion]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-col items-center justify-between tablet:flex-row">
        <CardTitle className='flex text-xl items-center font-bold'>{selectedSection.icon && createElement(selectedSection.icon)}&nbsp;{selectedSection.name} - Question {currentQuestion + 1} of {selectedSection.questions.length}</CardTitle>
        <Timer isRunning={isTimerRunning} />
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium mb-4">{question.question}</p>
        {selectedSection.id === "random" && <p className="text-sm text-gray-600 mb-4">Section: {question.section}</p>}
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Checkbox
              id={`option-${index}`}
              checked={userAnswers[currentQuestion]?.includes(index)}
              onCheckedChange={() => handleAnswerChange(index)}
            />
            <label
              htmlFor={`option-${index}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option}
            </label>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline">
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentQuestion < selectedSection.questions.length - 1 ? "Next" : "Finish"}
        </Button>
      </CardFooter>
    </Card>
  )
}

