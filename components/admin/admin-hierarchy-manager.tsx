"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
  GraduationCap,
  BookMarked,
  FileQuestion,
  Search,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  X,
} from "lucide-react"
import { MockAPI } from "@/lib/mock-api"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { NodeType, SelectedNode } from "./admin-dashboard-layout" // Import types
import { useAdminContext } from "./admin-context" // Import admin context

// Define types for hierarchical data (re-defined here for clarity, but ideally shared)
interface Department {
  id: string
  name: string
  code: string
  description?: string
  courses: Course[]
}

interface Course {
  id: string
  name: string
  code: string
  description?: string
  departmentId: string
  classes: Class[]
}

interface Class {
  id: string
  name: string
  code: string
  description?: string
  courseId: string
  sections: Section[]
}

interface Section {
  id: string
  name: string
  description?: string
  isPublic: boolean
  classId: string
  questions?: Question[] // Questions are nested under sections
}

interface Question {
  id: string
  content: string
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
  options: string[] | null
  correctAnswer: string
  explanation?: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  sectionId: string
  section: {
    id: string
    name: string
    class: {
      name: string
      course: {
        name: string
        department: {
          name: string
        }
      }
    }
  }
}

interface AdminHierarchyManagerProps {
  departments: Department[]
  selectedNode: SelectedNode
  onSelectNode: (node: SelectedNode) => void
}

// Main Admin Hierarchy Manager Component
export function AdminHierarchyManager() {
  // Get props from context instead of direct props
  const { departments, selectedNode, onSelectNode } = useAdminContext()
  const [questions, setQuestions] = useState<Question[]>([]) // Keep this
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true) // Keep this
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingEntity, setEditingEntity] = useState<any>(null)
  const [formType, setFormType] = useState<NodeType | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [formError, setFormError] = useState("")

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("")
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("")
  const [selectedClassFilter, setSelectedClassFilter] = useState("")
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("")
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState("")
  const [selectedQuestionTypeFilter, setSelectedQuestionTypeFilter] = useState("")
  const [isPublicFilter, setIsPublicFilter] = useState<boolean | "all">("all")

  useEffect(() => {
    // Only load questions here, departments are passed from parent
    const loadQuestions = async () => {
      setIsLoadingQuestions(true)
      try {
        const questionData = await MockAPI.getQuestions()
        setQuestions(questionData as unknown as Question[])
      } catch (error) {
        console.error("Error loading questions:", error)
      } finally {
        setIsLoadingQuestions(false)
      }
    }
    loadQuestions()
  }, []) // This dependency array is correct for fetching questions once

  // Helper to get full path for display
  const getFullPath = (entity: any, type: NodeType) => {
    if (type === "department") return entity.name
    if (type === "course") return `${entity.departmentName} > ${entity.name}`
    if (type === "class") return `${entity.departmentName} > ${entity.courseName} > ${entity.name}`
    if (type === "section")
      return `${entity.departmentName} > ${entity.courseName} > ${entity.className} > ${entity.name}`
    if (type === "question")
      return `${entity.section.class.course.department.name} > ${entity.section.class.course.name} > ${entity.section.class.name} > ${entity.section.name} > ${entity.content}`
    return entity.name
  }

  // Flattened lists for global search and filters (derived from props.departments)
  const allCourses = useMemo(
    () => departments.flatMap((dept) => dept.courses.map((course) => ({ ...course, departmentName: dept.name }))),
    [departments],
  )
  const allClasses = useMemo(
    () =>
      allCourses.flatMap((course) =>
        course.classes.map((cls) => ({
          ...cls,
          courseName: course.name,
          departmentName: course.departmentName,
        })),
      ),
    [allCourses],
  )
  const allSections = useMemo(
    () =>
      allClasses.flatMap((cls) =>
        cls.sections.map((section) => ({
          ...section,
          className: cls.name,
          courseName: cls.courseName,
          departmentName: cls.departmentName,
        })),
      ),
    [allClasses],
  )

  // Filtered content for the main display area
  const currentContent = useMemo(() => {
    let data: any[] = []
    let title = ""
    let addEntityType: NodeType | null = null

    switch (selectedNode.type) {
      case "root":
        data = departments
        title = "Departments"
        addEntityType = "department"
        break
      case "department":
        const dept = departments.find((d) => d.id === selectedNode.id)
        data = dept?.courses || []
        title = `Courses in ${dept?.name}`
        addEntityType = "course"
        break
      case "course":
        const course = allCourses.find((c) => c.id === selectedNode.id)
        data = course?.classes || []
        title = `Classes in ${course?.name}`
        addEntityType = "class"
        break
      case "class":
        const cls = allClasses.find((c) => c.id === selectedNode.id)
        data = cls?.sections || []
        title = `Sections in ${cls?.name}`
        addEntityType = "section"
        break
      case "section":
        const section = allSections.find((s) => s.id === selectedNode.id)
        data = questions.filter((q) => q.sectionId === selectedNode.id) // Use `questions` state here
        title = `Questions in ${section?.name}`
        addEntityType = "question"
        break
      default:
        break
    }

    // Apply global search and filters to the current content
    let filteredData = data

    if (searchTerm) {
      filteredData = filteredData.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())), // For questions
      )
    }

    if (selectedDepartmentFilter && selectedDepartmentFilter !== "all") {
      filteredData = filteredData.filter((item) => item.departmentId === selectedDepartmentFilter)
    }
    if (selectedCourseFilter && selectedCourseFilter !== "all") {
      filteredData = filteredData.filter((item) => item.courseId === selectedCourseFilter)
    }
    if (selectedClassFilter && selectedClassFilter !== "all") {
      filteredData = filteredData.filter((item) => item.classId === selectedClassFilter)
    }
    if (selectedSectionFilter && selectedSectionFilter !== "all") {
      filteredData = filteredData.filter((item) => item.sectionId === selectedSectionFilter)
    }
    if (selectedDifficultyFilter && selectedDifficultyFilter !== "all") {
      filteredData = filteredData.filter((item) => item.difficulty === selectedDifficultyFilter)
    }
    if (selectedQuestionTypeFilter && selectedQuestionTypeFilter !== "all") {
      filteredData = filteredData.filter((item) => item.type === selectedQuestionTypeFilter)
    }
    if (isPublicFilter !== "all") {
      filteredData = filteredData.filter((item) => item.isPublic === isPublicFilter)
    }

    return { data: filteredData, title, addEntityType }
  }, [
    selectedNode,
    departments,
    allCourses,
    allClasses,
    allSections,
    questions, // Add questions as a dependency
    searchTerm,
    selectedDepartmentFilter,
    selectedCourseFilter,
    selectedClassFilter,
    selectedSectionFilter,
    selectedDifficultyFilter,
    selectedQuestionTypeFilter,
    isPublicFilter,
  ])

  const handleAddClick = (type: NodeType) => {
    setFormType(type)
    setEditingEntity(null)
    setFormData({})
    setFormError("")

    // Pre-fill parent IDs if a node is selected
    if (selectedNode.type === "department" && type === "course") {
      setFormData({ ...formData, departmentId: selectedNode.id })
    } else if (selectedNode.type === "course" && type === "class") {
      setFormData({ ...formData, courseId: selectedNode.id })
    } else if (selectedNode.type === "class" && type === "section") {
      setFormData({ ...formData, classId: selectedNode.id })
    } else if (selectedNode.type === "section" && type === "question") {
      setFormData({ ...formData, sectionId: selectedNode.id })
    }

    setShowFormModal(true)
  }

  const handleEditClick = (entity: any, type: NodeType) => {
    setFormType(type)
    setEditingEntity(entity)
    setFormData({ ...entity })
    setFormError("")
    setShowFormModal(true)
  }

  const handleDeleteClick = async (id: string, type: NodeType) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      // Simulate delete API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      console.log(`Deleting ${type} with ID: ${id}`)
      // In a real app, you'd call your API: await MockAPI.deleteDepartment(id) etc.
      // For questions, we need to update the local state
      if (type === "question") {
        setQuestions((prev) => prev.filter((q) => q.id !== id))
      } else {
        // For other types, we'd ideally re-fetch departments from the parent or update deeply
        // For mock, we'll just log and assume parent reload handles it.
        // In a real app, you'd trigger a re-fetch in the parent AdminDashboardLayout
        // or use a global state management.
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      setFormError(`Failed to delete ${type}.`)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    try {
      // Simulate save API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      if (editingEntity) {
        console.log(`Updating ${formType}:`, formData)
      } else {
        console.log(`Creating ${formType}:`, formData)
      }
      // In a real app, you'd call your API: await MockAPI.createDepartment(formData) or updateDepartment(id, formData)
      // For questions, update local state
      if (formType === "question") {
        if (editingEntity) {
          setQuestions((prev) => prev.map((q) => (q.id === editingEntity.id ? formData : q)))
        } else {
          setQuestions((prev) => [...prev, { ...formData, id: `q-${Date.now()}` }]) // Mock ID
        }
      } else {
        // For other types, trigger a re-fetch in the parent layout
        // This is a simplified approach for the mock. In a real app,
        // you might have a more sophisticated state management or
        // pass a callback to the parent to trigger its data reload.
      }
      setShowFormModal(false)
    } catch (error) {
      console.error(`Error saving ${formType}:`, error)
      setFormError(`Failed to save ${formType}.`)
    }
  }

  const renderFormContent = () => {
    switch (formType) {
      case "department":
        return (
          <>
            <div>
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Department Code</Label>
              <Input
                id="code"
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </>
        )
      case "course":
        return (
          <>
            <div>
              <Label htmlFor="departmentId">Department</Label>
              <Select
                value={formData.departmentId || ""}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
              >
                <SelectTrigger id="departmentId">
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
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </>
        )
      case "class":
        const coursesForClassForm = departments.flatMap((dept) => dept.courses)
        return (
          <>
            <div>
              <Label htmlFor="courseId">Course</Label>
              <Select
                value={formData.courseId || ""}
                onValueChange={(value) => setFormData({ ...formData, courseId: value })}
              >
                <SelectTrigger id="courseId">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {coursesForClassForm.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Class Code</Label>
              <Input
                id="code"
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </>
        )
      case "section":
        const classesForSectionForm = departments.flatMap((dept) => dept.courses.flatMap((course) => course.classes))
        return (
          <>
            <div>
              <Label htmlFor="classId">Class</Label>
              <Select
                value={formData.classId || ""}
                onValueChange={(value) => setFormData({ ...formData, classId: value })}
              >
                <SelectTrigger id="classId">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classesForSectionForm.map((cls) => (
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
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
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
          </>
        )
      case "question":
        const sectionsForQuestionForm = departments.flatMap((dept) =>
          dept.courses.flatMap((course) => course.classes.flatMap((cls) => cls.sections)),
        )
        return (
          <>
            <div>
              <Label htmlFor="sectionId">Section</Label>
              <Select
                value={formData.sectionId || ""}
                onValueChange={(value) => setFormData({ ...formData, sectionId: value })}
              >
                <SelectTrigger id="sectionId">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionsForQuestionForm.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Question Content</Label>
              <Textarea
                id="content"
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Question Type</Label>
                <Select
                  value={formData.type || "MULTIPLE_CHOICE"}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                    <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty || "MEDIUM"}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.type === "MULTIPLE_CHOICE" && (
              <div>
                <Label>Answer Options</Label>
                <div className="space-y-2">
                  {(formData.options || ["", "", "", ""]).map((option: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(formData.options || ["", "", "", ""])]
                          newOptions[index] = e.target.value
                          setFormData({ ...formData, options: newOptions })
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      {(formData.options || []).length > 2 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newOptions = (formData.options || []).filter((_: any, i: number) => i !== index)
                            setFormData({ ...formData, options: newOptions })
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, options: [...(formData.options || []), ""] })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              {formData.type === "MULTIPLE_CHOICE" ? (
                <Select
                  value={formData.correctAnswer || ""}
                  onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.options || [])
                      .filter((opt: string) => opt.trim())
                      .map((option: string, index: number) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : formData.type === "TRUE_FALSE" ? (
                <Select
                  value={formData.correctAnswer || ""}
                  onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">True</SelectItem>
                    <SelectItem value="False">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="correctAnswer"
                  value={formData.correctAnswer || ""}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  required
                />
              )}
            </div>
            <div>
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                value={formData.explanation || ""}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={2}
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  if (isLoadingQuestions) {
    return <div className="flex justify-center items-center min-h-screen">Loading content...</div>
  }

  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-2xl font-bold">{currentContent.title}</h2>

      {/* Global Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search all content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedDepartmentFilter}
          onValueChange={(value) => {
            setSelectedDepartmentFilter(value)
            setSelectedCourseFilter("")
            setSelectedClassFilter("")
            setSelectedSectionFilter("")
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
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
          value={selectedCourseFilter}
          onValueChange={(value) => {
            setSelectedCourseFilter(value)
            setSelectedClassFilter("")
            setSelectedSectionFilter("")
          }}
          disabled={allCourses.length === 0}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {allCourses
              .filter(
                (c) =>
                  !selectedDepartmentFilter ||
                  selectedDepartmentFilter === "all" ||
                  c.departmentId === selectedDepartmentFilter,
              )
              .map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedClassFilter}
          onValueChange={(value) => {
            setSelectedClassFilter(value)
            setSelectedSectionFilter("")
          }}
          disabled={allClasses.length === 0}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {allClasses
              .filter(
                (c) => !selectedCourseFilter || selectedCourseFilter === "all" || c.courseId === selectedCourseFilter,
              )
              .map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedSectionFilter}
          onValueChange={setSelectedSectionFilter}
          disabled={allSections.length === 0}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {allSections
              .filter((s) => !selectedClassFilter || selectedClassFilter === "all" || s.classId === selectedClassFilter)
              .map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {(selectedNode.type === "section" ||
          selectedNode.type === "question" ||
          selectedQuestionTypeFilter !== "" ||
          selectedDifficultyFilter !== "") && (
          <>
            <Select value={selectedDifficultyFilter} onValueChange={setSelectedDifficultyFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedQuestionTypeFilter} onValueChange={setSelectedQuestionTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
        {(selectedNode.type === "section" || isPublicFilter !== "all") && (
          <Select
            value={isPublicFilter.toString()}
            onValueChange={(value) => setIsPublicFilter(value === "true" ? true : value === "false" ? false : "all")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Public</SelectItem>
              <SelectItem value="false">Private</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Add New Button */}
      {currentContent.addEntityType && (
        <div className="flex justify-end">
          <Button
            onClick={() => handleAddClick(currentContent.addEntityType!)}
            className="bg-[#d14124] hover:bg-[#b8371f]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {currentContent.addEntityType.charAt(0).toUpperCase() + currentContent.addEntityType.slice(1)}
          </Button>
        </div>
      )}

      {/* List of Entities */}
      <div className="grid gap-4">
        {currentContent.data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No {currentContent.title.toLowerCase()} found.</div>
        ) : (
          currentContent.data.map((item) => (
            <Card key={item.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedNode.type === "root" && <BookOpen className="w-5 h-5 text-[#d14124]" />}
                      {selectedNode.type === "department" && <GraduationCap className="w-5 h-5 text-[#d14124]" />}
                      {selectedNode.type === "course" && <BookMarked className="w-5 h-5 text-[#d14124]" />}
                      {selectedNode.type === "class" && <FileQuestion className="w-5 h-5 text-[#d14124]" />}
                      {selectedNode.type === "section" && (
                        <>
                          <FileQuestion className="w-5 h-5 text-[#d14124]" />
                          <Badge className={`difficulty-${item.difficulty?.toLowerCase() || "medium"}`}>
                            {item.difficulty}
                          </Badge>
                          <Badge className={`question-${item.type?.toLowerCase().replace("_", "-") || "short-answer"}`}>
                            {item.type?.replace("_", " ")}
                          </Badge>
                        </>
                      )}
                      <h3 className="font-semibold text-lg">{item.name || item.content}</h3>
                      {item.code && <Badge variant="outline">{item.code}</Badge>}
                      {item.isPublic !== undefined && (
                        <Badge variant="outline">
                          {item.isPublic ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                          {item.isPublic ? "Public" : "Private"}
                        </Badge>
                      )}
                    </div>
                    {item.description && <p className="text-sm text-gray-700 mb-2">{item.description}</p>}
                    {item.correctAnswer && (
                      <p className="text-sm text-green-600 mb-2">
                        <strong>Answer:</strong> {item.correctAnswer}
                      </p>
                    )}
                    {item.explanation && <p className="text-sm text-gray-600 mb-2 italic">{item.explanation}</p>}
                    <p className="text-xs text-gray-500">
                      {item.departmentName && `Department: ${item.departmentName}`}
                      {item.courseName && ` > Course: ${item.courseName}`}
                      {item.className && ` > Class: ${item.className}`}
                      {item.sectionName && ` > Section: ${item.sectionName}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleEditClick(
                          item,
                          selectedNode.type === "root"
                            ? "department"
                            : selectedNode.type === "department"
                              ? "course"
                              : selectedNode.type === "course"
                                ? "class"
                                : selectedNode.type === "class"
                                  ? "section"
                                  : "question",
                        )
                      }
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleDeleteClick(
                          item.id,
                          selectedNode.type === "root"
                            ? "department"
                            : selectedNode.type === "department"
                              ? "course"
                              : selectedNode.type === "course"
                                ? "class"
                                : selectedNode.type === "class"
                                  ? "section"
                                  : "question",
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form Modal for Add/Edit */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? "Edit" : "Add New"} {formType ? formType?.charAt(0).toUpperCase() + formType?.slice(1) : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            {renderFormContent()}
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#d14124] hover:bg-[#b8371f]">
                {editingEntity ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
// Add display name for React.Children.map to identify
;(AdminHierarchyManager as any).displayName = "AdminHierarchyManager"

