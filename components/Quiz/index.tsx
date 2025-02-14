"use client"

import Link from "next/link"
import { useState } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Timer } from "@/components/Timer"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import QuizProps from "@/types/QuizProps"

export function Quiz({ section, questions, quizClassId }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[][]>(questions.map(() => []))
  const [showResults, setShowResults] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [totalTime, setTotalTime] = useState<number | null>(null)

  console.log(section);

  const handleAnswerChange = (optionIndex: number) => {
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
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      calculateScores()
      setShowResults(true)
      setIsTimerRunning(false)
      setTotalTime(Math.floor((Date.now() - startTime) / 1000))
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const calculateScores = () => {
    const newScores = questions.map((question, index) => {
      const userAnswer = userAnswers[index]
      const correctAnswers = question.answer

      const correctGuesses = userAnswer.filter((answer) => correctAnswers.includes(answer)).length
      const incorrectGuesses = userAnswer.filter((answer) => !correctAnswers.includes(answer)).length

      const totalCorrectAnswers = correctAnswers.length
      const score = Math.max(0, correctGuesses / totalCorrectAnswers - incorrectGuesses / totalCorrectAnswers)

      return Math.round(score * 100) / 100 // Round to 2 decimal places
    })

    setScores(newScores)
  }

  if (showResults) {
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className='flex text-xl items-center font-bold'>{section.icon}&nbsp;{section.sectionName} Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold">
              Your total score: {totalScore.toFixed(2)} out of {questions.length}
            </p>
            {totalTime !== null && <Timer isRunning={false} totalTime={totalTime} />}
          </div>
          {questions.map((question, index) => (
            <div key={`${question._id}`} className="mb-6">
              <p className="font-medium mb-2">{question.question}</p>
              <p className="text-sm text-gray-600 mb-2">Section: {question.sectionId}</p>
              <p className="text-sm font-semibold mb-2">Your score: {scores[index].toFixed(2)}</p>
              {question.options.map((option, optionIndex) => {
                const isCorrect = question.answer.includes(optionIndex)
                const isSelected = userAnswers[index].includes(optionIndex)
                let textColorClass = "";
                if (isSelected) {
                  textColorClass = isCorrect ? "text-green-600" : "text-red-600"
                }
                return (
                  <div key={optionIndex} className={`flex items-center space-x-2 mb-1 ${textColorClass}`}>
                    <span className="text-sm">{isSelected ? (isCorrect ? "✓" : "✗") : "○"}</span>
                    <span className="text-sm">{option}</span>
                    {isCorrect && !isSelected && <span className="text-green-600 font-bold text-sm ml-2">(Correct)</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href={`/${quizClassId}`}>Choose Another Section</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const question = questions[currentQuestion]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-col items-center justify-between sm:flex-row space-x-9">
        <CardTitle className='flex text-xl items-center font-bold '>
          {section.icon} &nbsp;
          {section.sectionName} - Question {currentQuestion + 1} of {questions.length}
        </CardTitle>
        <Timer isRunning={isTimerRunning} />
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium mb-4">{question.question}</p>
        {section.id === "random" && <p className="text-sm text-gray-600 mb-4">Section: {question.sectionId}</p>}
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
        <Button onClick={handleNext}>{currentQuestion < questions.length - 1 ? "Next" : "Finish"}</Button>
      </CardFooter>
    </Card>
  )
}

