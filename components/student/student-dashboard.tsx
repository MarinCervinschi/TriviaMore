"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MockAPI } from "@/lib/mock-api"
import { BookOpen, Trophy, Target, Play, BookmarkIcon, TrendingUp } from "lucide-react"

interface StudentDashboardProps {
  token: string
  user: any
}

export function StudentDashboard({ token, user }: StudentDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [dashboard, depts] = await Promise.all([MockAPI.getDashboard(), MockAPI.getDepartments()])

      setDashboardData(dashboard)
      setDepartments(depts)
      setBookmarkedQuestions(dashboard.bookmarks.map((b: any) => b.questionId))
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartQuiz = async (sectionId: string) => {
    try {
      const quizzes = await MockAPI.getQuizzes(sectionId)
      if (quizzes.length > 0) {
        router.push(`/quiz/${quizzes[0].id}`)
      }
    } catch (error) {
      console.error("Error loading quiz:", error)
    }
  }

  const handleStartFlashcards = (sectionId: string) => {
    router.push(`/flashcards/${sectionId}`)
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.username}!</h1>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.totalQuizzes}</div>
                <div className="text-sm text-gray-600">Quizzes Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.averageScore.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookmarkIcon className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData.stats.totalBookmarks}</div>
                <div className="text-sm text-gray-600">Bookmarked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{dashboardData.progress.length}</div>
                <div className="text-sm text-gray-600">Active Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="study" className="space-y-4">
        <TabsList>
          <TabsTrigger value="study">Study Materials</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="study" className="space-y-4">
          <h2 className="text-xl font-semibold">Available Study Materials</h2>

          {departments.map((department) => (
            <Card key={department.id} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#d14124]" />
                  {department.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {department.courses.map((course: any) => (
                  <div key={course.id} className="space-y-3">
                    <h4 className="font-medium text-lg">{course.name}</h4>
                    {course.classes.map((classItem: any) => (
                      <div key={classItem.id} className="ml-4 space-y-2">
                        <h5 className="font-medium">{classItem.name}</h5>
                        <div className="ml-4 grid gap-2">
                          {classItem.sections.map((section: any) => (
                            <Card key={section.id} className="p-4 study-mode-card">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h6 className="font-medium">{section.name}</h6>
                                  <p className="text-sm text-gray-600">{section.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStartFlashcards(section.id)}
                                    className="hover:bg-[#d14124] hover:text-white"
                                  >
                                    📚 Flashcards
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStartQuiz(section.id)}
                                    className="bg-[#d14124] hover:bg-[#b8371f]"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Quiz
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <h2 className="text-xl font-semibold">Learning Progress</h2>

          {dashboardData.progress.map((prog: any) => (
            <Card key={prog.id} className="card-hover">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{prog.section.name}</h4>
                      <p className="text-sm text-gray-600">
                        {prog.section.class.name} • {prog.section.class.course.name}
                      </p>
                    </div>
                    {prog.averageScore && (
                      <Badge variant={prog.averageScore >= 80 ? "default" : "secondary"} className="badge-primary">
                        {prog.averageScore.toFixed(1)}% avg
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Questions Studied:</span>
                      <span className="ml-2 font-medium">{prog.questionsStudied}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quizzes Taken:</span>
                      <span className="ml-2 font-medium">{prog.quizzesTaken}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last accessed: {new Date(prog.lastAccessedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          <h2 className="text-xl font-semibold">Bookmarked Questions</h2>

          {dashboardData.bookmarks.map((bookmark: any) => (
            <Card key={bookmark.id} className="card-hover">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{bookmark.question.content}</h4>
                    <Badge variant="outline" className={`difficulty-${bookmark.question.difficulty.toLowerCase()}`}>
                      {bookmark.question.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-green-600">Answer: {bookmark.question.correctAnswer}</p>
                  {bookmark.question.explanation && (
                    <p className="text-sm text-gray-600 italic">{bookmark.question.explanation}</p>
                  )}
                  <div className="text-xs text-gray-500">
                    {bookmark.question.section.name} • {bookmark.question.section.class.name}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Quiz Attempts</h2>

          {dashboardData.recentAttempts.map((attempt: any) => (
            <Card key={attempt.id} className="card-hover quiz-result-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium">{attempt.quiz.title}</h4>
                    <p className="text-sm text-gray-600">
                      {attempt.quiz.section.name} • {attempt.quiz.section.class.name}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        Score: <span className="font-medium gradient-text">{attempt.score.toFixed(1)}%</span>
                      </span>
                      <span>
                        Time:{" "}
                        <span className="font-medium">
                          {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={attempt.score >= 80 ? "default" : "secondary"} className="badge-primary">
                      {attempt.correctAnswers}/{attempt.totalQuestions}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
