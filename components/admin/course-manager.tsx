"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, BookOpen, Search } from "lucide-react"
import { MockAPI } from "@/lib/mock-api"

export function CourseManager() {
  const [departments, setDepartments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    departmentId: "default", // Updated default value to be a non-empty string
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("default") // Updated default value to be a non-empty string

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const deptData = await MockAPI.getDepartments()
      setDepartments(deptData)

      // Extract all courses from departments
      const allCourses = deptData.flatMap((dept: any) =>
        dept.courses.map((course: any) => ({
          ...course,
          departmentName: dept.name,
          departmentId: dept.id, // Add departmentId here
        })),
      )
      setCourses(allCourses)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCourses = useMemo(() => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedDepartmentId && selectedDepartmentId !== "default") {
      filtered = filtered.filter((course) => course.departmentId === selectedDepartmentId)
    }

    return filtered
  }, [courses, searchTerm, selectedDepartmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (editingCourse) {
        console.log("Updating course:", formData)
      } else {
        console.log("Creating course:", formData)
      }

      loadData()
      setShowForm(false)
      setEditingCourse(null)
      setFormData({ name: "", code: "", description: "", departmentId: "default" }) // Reset departmentId to default
    } catch (error) {
      console.error("Error saving course:", error)
    }
  }

  const handleEdit = (course: any) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || "",
      departmentId: course.departmentId,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log("Deleting course:", id)
      loadData()
    } catch (error) {
      console.error("Error deleting course:", error)
    }
  }

  if (isLoading) {
    return <div>Loading courses...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-[#d14124] hover:bg-[#b8371f]">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCourse ? "Edit Course" : "Add New Course"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="departmentId">Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#d14124] hover:bg-[#b8371f]">
                  {editingCourse ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCourse(null)
                    setFormData({ name: "", code: "", description: "", departmentId: "default" }) // Reset departmentId to default
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">All Departments</SelectItem> {/* Updated value to be a non-empty string */}
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-[#d14124]" />
                    <h3 className="font-semibold text-lg">{course.name}</h3>
                    <Badge variant="outline">{course.code}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Department: {course.departmentName}</p>
                  {course.description && <p className="text-sm text-gray-700 mb-2">{course.description}</p>}
                  <p className="text-xs text-gray-500">{course.classes?.length || 0} classes</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(course)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredCourses.length === 0 && (
        <div className="text-center py-8 text-gray-500">No courses found matching your criteria.</div>
      )}
    </div>
  )
}
