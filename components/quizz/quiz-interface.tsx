"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, XCircle } from "lucide-react"

interface QuizInterfaceProps {
  quiz: any
  onComplete: (answers: any[], timeSpent: number) => void
  onBack: () => void
}

export function QuizInterface({ quiz, onComplete, onBack }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null)
  const [startTime] = useState(Date.now())
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  useEffect(() => {
    if (timeLeft === null) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev ? prev - 1 : null
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionId]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer,
      timeSpent: 0,
    }))

    try {
      const result = await onComplete(formattedAnswers, timeSpent)
      setResults(result)
      setShowResults(true)
    } catch (error) {
      console.error("Error submitting quiz:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (showResults && results) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Quiz Completed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{results.score.toFixed(1)}%</div>
            <p className="text-gray-600">
              {results.correctAnswers} out of {results.totalQuestions} correct
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Answer Review:</h3>
            {results.answers.map((answer: any, index: number) => (
              <div key={answer.questionId} className="border rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  {answer.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{answer.question.content}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your answer:{" "}
                      <span className={answer.isCorrect ? "text-green-600" : "text-red-600"}>{answer.userAnswer}</span>
                    </p>
                    {!answer.isCorrect && (
                      <p className="text-sm text-green-600 mt-1">Correct answer: {answer.question.correctAnswer}</p>
                    )}
                    {answer.question.explanation && (
                      <p className="text-sm text-gray-500 mt-2 italic">{answer.question.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={onBack} className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{quiz.title}</CardTitle>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={timeLeft < 300 ? "text-red-500" : ""}>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{currentQuestion.question.content}</h3>

              {currentQuestion.question.type === "MULTIPLE_CHOICE" && (
                <RadioGroup value={answers[currentQuestion.questionId] || ""} onValueChange={handleAnswerChange}>
                  {currentQuestion.question.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.question.type === "TRUE_FALSE" && (
                <RadioGroup value={answers[currentQuestion.questionId] || ""} onValueChange={handleAnswerChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="True" id="true" />
                    <Label htmlFor="true">True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="False" id="false" />
                    <Label htmlFor="false">False</Label>
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.question.type === "SHORT_ANSWER" && (
                <Input
                  value={answers[currentQuestion.questionId] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Enter your answer..."
                />
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button onClick={handleSubmit}>Submit Quiz</Button>
                ) : (
                  <Button onClick={handleNext}>Next</Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
