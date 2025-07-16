"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Flashcard } from "@/components/study/flashcard"
import { MockAPI } from "@/lib/mock-api"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"

export default function FlashcardPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sectionInfo, setSectionInfo] = useState<any>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/auth/login")
      return
    }
    setUser(JSON.parse(storedUser))
    loadFlashcards()
  }, [params?.sectionId])

  const loadFlashcards = async () => {
    try {
      const [questionsData, dashboardData, departmentsData] = await Promise.all([
        MockAPI.getQuestions(params?.sectionId as string),
        MockAPI.getDashboard(),
        MockAPI.getDepartments(),
      ])

      if (questionsData.length === 0) {
        router.push("/dashboard")
        return
      }

      setQuestions(questionsData)
      setBookmarkedQuestions(dashboardData.bookmarks.map((b: any) => b.questionId))

      // Find section info
      for (const dept of departmentsData) {
        for (const course of dept.courses) {
          for (const cls of course.classes) {
            const section = cls.sections.find((s: any) => s.id === params?.sectionId)
            if (section) {
              setSectionInfo({
                ...section,
                className: cls.name,
                courseName: course.name,
                departmentName: dept.name,
              })
              break
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading flashcards:", error)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = async (questionId: string) => {
    try {
      const result = await MockAPI.toggleBookmark(questionId)
      if (result.bookmarked) {
        setBookmarkedQuestions((prev) => [...prev, questionId])
      } else {
        setBookmarkedQuestions((prev) => prev.filter((id) => id !== questionId))
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Flashcards Available</h1>
          <p className="text-gray-600 mb-4">There are no questions available for this section.</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TriviaMore Flashcards</h1>
                {sectionInfo && (
                  <p className="text-sm text-gray-600">
                    {sectionInfo.departmentName} {">"} {sectionInfo.courseName} {">"} {sectionInfo.className} {">"}{" "}
                    {sectionInfo.name}
                  </p>
                )}
              </div>
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
        <Flashcard questions={questions} onBookmark={handleBookmark} bookmarkedQuestions={bookmarkedQuestions} />
      </main>
    </div>
  )
}
