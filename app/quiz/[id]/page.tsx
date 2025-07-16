"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { QuizInterface } from "@/components/quizz/quiz-interface"
import { MockAPI } from "@/lib/mock-api"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"

export default function QuizPage() {
  const [quiz, setQuiz] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/auth/login")
      return
    }
    setUser(JSON.parse(storedUser))
    loadQuiz()
  }, [params?.id])

  const loadQuiz = async () => {
    try {
      const quizzes = await MockAPI.getQuizzes()
      const foundQuiz = quizzes.find((q: any) => q.id === params?.id)
      if (foundQuiz) {
        setQuiz(foundQuiz)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error loading quiz:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuizComplete = async (answers: any[], timeSpent: number) => {
    try {
      const result = await MockAPI.submitQuizAttempt(quiz.id, answers, timeSpent)
      return result
    } catch (error) {
      console.error("Error submitting quiz:", error)
      throw error
    }
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h1>
          <Button onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#d14124]" />
              <h1 className="text-2xl font-bold text-gray-900">TriviaMore</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <Button variant="outline" onClick={handleBackToDashboard}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuizInterface quiz={quiz} onComplete={handleQuizComplete} onBack={handleBackToDashboard} />
      </main>
    </div>
  )
}
