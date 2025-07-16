"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, ArrowLeft, Lock, Unlock } from "lucide-react"
import { MockAPI } from "@/lib/mock-api"

export default function BrowsePage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      const data = await MockAPI.getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error("Error loading departments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.courses.some(
        (course: any) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.classes.some((cls: any) => cls.name.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
  )

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Browse Content</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Study Materials</h1>
          <p className="text-gray-600 mb-6">
            Browse our comprehensive collection of study materials organized by department, course, and class.
          </p>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search departments, courses, or classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredDepartments.map((department) => (
            <Card key={department.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      {department.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Code: {department.code}</p>
                    {department.description && <p className="text-sm text-gray-600 mt-2">{department.description}</p>}
                  </div>
                  <Badge variant="secondary">{department.courses.length} courses</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {department.courses.map((course: any) => (
                  <div key={course.id} className="border-l-2 border-blue-200 pl-4">
                    <h4 className="font-semibold text-lg text-gray-900">{course.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">Code: {course.code}</p>

                    <div className="grid gap-3">
                      {course.classes.map((classItem: any) => (
                        <div key={classItem.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900">{classItem.name}</h5>
                              <p className="text-sm text-gray-600">Code: {classItem.code}</p>
                              {classItem.description && (
                                <p className="text-sm text-gray-600 mt-1">{classItem.description}</p>
                              )}
                            </div>
                            <Badge variant="outline">{classItem.sections.length} sections</Badge>
                          </div>

                          <div className="grid gap-2">
                            {classItem.sections.map((section: any) => (
                              <div key={section.id} className="flex justify-between items-center p-2 bg-white rounded">
                                <div className="flex items-center gap-2">
                                  {section.isPublic ? (
                                    <Unlock className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  )}
                                  <span className="text-sm font-medium">{section.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={section.isPublic ? "default" : "secondary"} className="text-xs">
                                    {section.isPublic ? "Public" : "Private"}
                                  </Badge>
                                  {section.isPublic ? (
                                    <Link href="/auth/register">
                                      <Button size="sm" variant="outline">
                                        Study Now
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button size="sm" variant="outline" disabled>
                                      Login Required
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600">Try adjusting your search terms or browse all available content.</p>
          </div>
        )}

        <div className="mt-12 text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h2>
          <p className="text-gray-600 mb-6">
            Create a free account to access quizzes, flashcards, and track your progress across all subjects.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
