"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, BookOpen, Trophy, TrendingUp, Target, Clock, Award, BarChart3, PieChart } from "lucide-react"

const mockAnalytics = {
  overview: {
    totalUsers: 156,
    activeUsers: 142,
    totalQuizzes: 89,
    totalQuestions: 1247,
    averageScore: 78.5,
    completionRate: 85.2,
  },
  userGrowth: [
    { month: "Jan", users: 45 },
    { month: "Feb", users: 67 },
    { month: "Mar", users: 89 },
    { month: "Apr", users: 123 },
    { month: "May", users: 156 },
  ],
  popularSections: [
    { name: "Algorithms - Complexity Analysis", attempts: 234, avgScore: 82.1 },
    { name: "Calculus I - Derivatives", attempts: 198, avgScore: 75.8 },
    { name: "Thermodynamics - First Law", attempts: 167, avgScore: 79.3 },
    { name: "Algorithms - Sorting", attempts: 145, avgScore: 88.2 },
    { name: "Data Structures - Trees", attempts: 123, avgScore: 71.5 },
  ],
  performanceByDifficulty: [
    { difficulty: "Easy", attempts: 456, avgScore: 89.2, successRate: 94.1 },
    { difficulty: "Medium", attempts: 678, avgScore: 76.8, successRate: 82.3 },
    { difficulty: "Hard", attempts: 234, avgScore: 62.4, successRate: 68.7 },
  ],
  recentActivity: [
    { user: "student1", action: "Completed quiz", subject: "Algorithms", score: 95, time: "2 hours ago" },
    { user: "student2", action: "Started flashcards", subject: "Calculus I", score: null, time: "3 hours ago" },
    { user: "student3", action: "Completed quiz", subject: "Thermodynamics", score: 78, time: "5 hours ago" },
    { user: "student4", action: "Bookmarked question", subject: "Data Structures", score: null, time: "6 hours ago" },
    { user: "student5", action: "Completed quiz", subject: "Algorithms", score: 82, time: "8 hours ago" },
  ],
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(mockAnalytics)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading analytics data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleString()}
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{analytics.overview.activeUsers}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{analytics.overview.totalQuizzes}</div>
                <div className="text-sm text-gray-600">Total Quizzes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{analytics.overview.totalQuestions}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#d14124]" />
              <div>
                <div className="text-2xl font-bold">{analytics.overview.averageScore.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{analytics.overview.completionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#d14124]" />
              Popular Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.popularSections.map((section, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{section.name}</span>
                  <Badge variant="outline">{section.attempts} attempts</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={section.avgScore} className="flex-1" />
                  <span className="text-sm font-medium">{section.avgScore.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance by Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#d14124]" />
              Performance by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.performanceByDifficulty.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className={`difficulty-${item.difficulty.toLowerCase()}`}>{item.difficulty}</Badge>
                    <span className="text-sm">{item.attempts} attempts</span>
                  </div>
                  <span className="text-sm font-medium">{item.avgScore.toFixed(1)}% avg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={item.successRate} className="flex-1" />
                  <span className="text-sm">{item.successRate.toFixed(1)}% success</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d14124]" />
            User Growth Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {analytics.userGrowth.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className="bg-[#d14124] rounded-t"
                  style={{
                    height: `${(data.users / Math.max(...analytics.userGrowth.map((d) => d.users))) * 100}px`,
                    width: "40px",
                  }}
                ></div>
                <div className="text-xs text-gray-600">{data.month}</div>
                <div className="text-xs font-medium">{data.users}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#d14124]" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#d14124] rounded-full"></div>
                  <div>
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-600 ml-2">{activity.action}</span>
                    <span className="text-[#d14124] ml-2">{activity.subject}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activity.score && (
                    <Badge variant="outline" className="badge-primary">
                      {activity.score}%
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
