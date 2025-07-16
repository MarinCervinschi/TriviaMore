"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, FileQuestion, BarChart3, Plus, Settings } from "lucide-react"
import Link from "next/link"

export function AdminDashboard() {
  const quickActions = [
    { 
      title: "Manage Data", 
      description: "Manage departments, courses, classes, sections and questions",
      icon: BookOpen, 
      href: "/admin/data",
      color: "bg-blue-500"
    },
    { 
      title: "User Management", 
      description: "Add, edit, and manage user accounts",
      icon: Users, 
      href: "/admin/users",
      color: "bg-green-500"
    },
    { 
      title: "Analytics", 
      description: "View performance metrics and statistics",
      icon: BarChart3, 
      href: "/admin/analytics",
      color: "bg-purple-500"
    },
    { 
      title: "Settings", 
      description: "Configure system settings and preferences",
      icon: Settings, 
      href: "/admin/settings",
      color: "bg-gray-500"
    },
  ]

  const stats = [
    { title: "Total Users", value: "245", icon: Users },
    { title: "Total Questions", value: "1,428", icon: FileQuestion },
    { title: "Active Courses", value: "32", icon: BookOpen },
    { title: "Monthly Quiz Sessions", value: "89", icon: BarChart3 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the TriviaMore administration panel</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 text-[#d14124]" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4">{action.description}</p>
                  <Button asChild className="w-full">
                    <Link href={action.href}>
                      Go to {action.title}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">New user registration: john@example.com</span>
              <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Quiz completed: Computer Science - Data Structures</span>
              <span className="text-xs text-gray-400 ml-auto">4 hours ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600">New questions added to Mathematics section</span>
              <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-600">System backup completed successfully</span>
              <span className="text-xs text-gray-400 ml-auto">2 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
