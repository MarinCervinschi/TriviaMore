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
import { Plus, Edit, Trash2, BookOpen, Search, Lock, Unlock } from "lucide-react"
import { MockAPI } from "@/lib/mock-api"
import { Checkbox } from "@/components/ui/checkbox"

interface Department {
  id: string
  name: string
  code: string
  courses: Course[]
}

interface Course {
  id: string
  name: string
  code: string
  departmentId: string
  classes: Class[]
}

interface Class {
  id: string
  name: string
  code: string
  courseId: string
  sections: Section[]
}

interface Section {
  id: string
  name: string
  description?: string
  isPublic: boolean
  classId: string
}

export function SectionManager() {
  const [departments, setDepartments] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    classId: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const deptData = await MockAPI.getDepartments()
      setDepartments(deptData)

      const allSections = deptData.flatMap((dept) =>
        dept.courses.flatMap((course) =>
          course.classes.flatMap((cls) =>
            cls.sections.map((section) => ({
              ...section,
              className: cls.name,
              classCode: cls.code,
              courseName: course.name,
              courseCode: course.code,
              departmentName: dept.name,
              departmentCode: dept.code,
              departmentId: dept.id,
              courseId: course.id,
            })),
          ),
        ),
      )
      setSections(allSections)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const availableCourses = useMemo(() => {
    if (!selectedDepartmentId) {
      return departments.flatMap((dept) => dept.courses)
    }
    return departments.find((dept) => dept.id === selectedDepartmentId)?.courses || []
  }, [departments, selectedDepartmentId])

  const availableClasses = useMemo(() => {
    if (!selectedCourseId) {
      return availableCourses.flatMap((course: any) => course.classes)
    }
    return availableCourses.find((course: any) => course.id === selectedCourseId)?.classes || []
  }, [availableCourses, selectedCourseId])

  const filteredSections = useMemo(() => {
    let filtered = sections

    if (searchTerm) {
      filtered = filtered.filter(
        (section) =>
          section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedDepartmentId) {
      filtered = filtered.filter((section) => section.departmentId === selectedDepartmentId)
    }

    if (selectedCourseId) {
      filtered = filtered.filter((section) => section.courseId === selectedCourseId)
    }

    if (selectedClassId) {
      filtered = filtered.filter((section) => section.classId === selectedClassId)
    }

    return filtered
  }, [sections, searchTerm, selectedDepartmentId, selectedCourseId, selectedClassId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (editingSection) {
        console.log("Updating section:", formData)
      } else {
        console.log("Creating section:", formData)
      }

      loadData()
      setShowForm(false)
      setEditingSection(null)
      setFormData({ name: "", description: "", isPublic: true, classId: "" })
    } catch (error) {
      console.error("Error saving section:", error)
    }
  }

  const handleEdit = (section: Section) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      description: section.description || "",
      isPublic: section.isPublic,
      classId: section.classId,
    })
    // Set parent IDs for filter dropdowns
    const parentClass = availableClasses.find((cls: any) => cls.id === section.classId)
    if (parentClass) {
      const parentCourse = availableCourses.find((course: any) => course.id === parentClass.courseId)
      if (parentCourse) {
        setSelectedDepartmentId(parentCourse.departmentId)
        setSelectedCourseId(parentCourse.id)
      }
      setSelectedClassId(parentClass.id)
    }
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log("Deleting section:", id)
      loadData()
    } catch (error) {
      console.error("Error deleting section:", error)
    }
  }

  if (isLoading) {
    return <div>Loading sections...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Section Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-[#d14124] hover:bg-[#b8371f]">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSection ? "Edit Section" : "Add New Section"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="departmentSelect">Department</Label>
                <Select
                  value={selectedDepartmentId}
                  onValueChange={(value) => {
                    setSelectedDepartmentId(value)
                    setSelectedCourseId("")
                    setSelectedClassId("")
                  }}
                >
                  <SelectTrigger id="departmentSelect">
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
                <Label htmlFor="courseSelect">Course</Label>
                <Select
                  value={selectedCourseId}
                  onValueChange={(value) => {
                    setSelectedCourseId(value)
                    setSelectedClassId("")
                  }}
                  disabled={availableCourses.length === 0}
                >
                  <SelectTrigger id="courseSelect">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => setFormData({ ...formData, classId: value })}
                  disabled={availableClasses.length === 0}
                >
                  <SelectTrigger id="classId">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Section Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: Boolean(checked) })}
                />
                <Label htmlFor="isPublic">Public Section</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#d14124] hover:bg-[#b8371f]">
                  {editingSection ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSection(null)
                    setFormData({ name: "", description: "", isPublic: true, classId: "" })
                    setSelectedDepartmentId("")
                    setSelectedCourseId("")
                    setSelectedClassId("")
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
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedDepartmentId}
          onValueChange={(value) => {
            setSelectedDepartmentId(value)
            setSelectedCourseId("")
            setSelectedClassId("")
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedCourseId}
          onValueChange={(value) => {
            setSelectedCourseId(value)
            setSelectedClassId("")
          }}
          disabled={availableCourses.length === 0}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {availableCourses.map((course: any) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={availableClasses.length === 0}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {availableClasses.map((cls: any) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredSections.map((section) => (
          <Card key={section.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-[#d14124]" />
                    <h3 className="font-semibold text-lg">{section.name}</h3>
                    <Badge variant="outline">
                      {section.isPublic ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                      {section.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                  {section.description && <p className="text-sm text-gray-700 mb-2">{section.description}</p>}
                  <p className="text-xs text-gray-500">
                    {section.departmentName} &gt; {section.courseName} &gt; {section.className}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(section)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(section.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredSections.length === 0 && (
        <div className="text-center py-8 text-gray-500">No sections found matching your criteria.</div>
      )}
    </div>
  )
}
