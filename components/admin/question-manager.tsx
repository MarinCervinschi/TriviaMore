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
import { Plus, Edit, Trash2, FileQuestion, X, Search } from "lucide-react"
import { MockAPI } from "@/lib/mock-api"

export function QuestionManager() {
  const [departments, setDepartments] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [formData, setFormData] = useState({
    content: "",
    type: "MULTIPLE_CHOICE",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    difficulty: "MEDIUM",
    sectionId: "",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedSectionId, setSelectedSectionId] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [selectedQuestionType, setSelectedQuestionType] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [deptData, questionData] = await Promise.all([MockAPI.getDepartments(), MockAPI.getQuestions()])
      setDepartments(deptData)
      setQuestions(questionData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAllSections = useMemo(() => {
    const sections: any[] = []
    departments.forEach((dept) => {
      dept.courses.forEach((course: any) => {
        course.classes.forEach((cls: any) => {
          cls.sections.forEach((section: any) => {
            sections.push({
              ...section,
              fullPath: `${dept.name} > ${course.name} > ${cls.name} > ${section.name}`,
              departmentId: dept.id, // Add departmentId
              courseId: course.id, // Add courseId
              classId: cls.id, // Add classId
            })
          })
        })
      })
    })
    return sections
  }, [departments])

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

  const availableSections = useMemo(() => {
    if (!selectedClassId) {
      return availableClasses.flatMap((cls: any) => cls.sections)
    }
    return availableClasses.find((cls: any) => cls.id === selectedClassId)?.sections || []
  }, [availableClasses, selectedClassId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const questionData = {
        ...formData,
        options:
          formData.type === "MULTIPLE_CHOICE"
            ? formData.options.filter((opt) => opt.trim())
            : formData.type === "TRUE_FALSE"
              ? ["True", "False"]
              : null,
      }

      if (editingQuestion) {
        console.log("Updating question:", questionData)
      } else {
        console.log("Creating question:", questionData)
      }

      loadData()
      setShowForm(false)
      setEditingQuestion(null)
      resetForm()
    } catch (error) {
      console.error("Error saving question:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      content: "",
      type: "MULTIPLE_CHOICE",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      difficulty: "MEDIUM",
      sectionId: "",
    })
    setSelectedDepartmentId("")
    setSelectedCourseId("")
    setSelectedClassId("")
    setSelectedSectionId("")
  }

  const handleEdit = (question: any) => {
    setEditingQuestion(question)
    setFormData({
      content: question.content,
      type: question.type,
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      difficulty: question.difficulty,
      sectionId: question.sectionId,
    })
    // Set parent IDs for filter dropdowns
    const section = getAllSections.find((s) => s.id === question.sectionId)
    if (section) {
      setSelectedDepartmentId(section.departmentId)
      setSelectedCourseId(section.courseId)
      setSelectedClassId(section.classId)
      setSelectedSectionId(section.id)
    }
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log("Deleting question:", id)
      loadData()
    } catch (error) {
      console.error("Error deleting question:", error)
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] })
  }

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index)
    setFormData({ ...formData, options: newOptions })
  }

  const filteredQuestions = useMemo(() => {
    let filtered = questions

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.correctAnswer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.explanation?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedDepartmentId) {
      filtered = filtered.filter((q) => q.section.class.course.department.id === selectedDepartmentId)
    }

    if (selectedCourseId) {
      filtered = filtered.filter((q) => q.section.class.course.id === selectedCourseId)
    }

    if (selectedClassId) {
      filtered = filtered.filter((q) => q.section.class.id === selectedClassId)
    }

    if (selectedSectionId) {
      filtered = filtered.filter((q) => q.sectionId === selectedSectionId)
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty)
    }

    if (selectedQuestionType) {
      filtered = filtered.filter((q) => q.type === selectedQuestionType)
    }

    return filtered
  }, [
    questions,
    searchTerm,
    selectedDepartmentId,
    selectedCourseId,
    selectedClassId,
    selectedSectionId,
    selectedDifficulty,
    selectedQuestionType,
  ])

  if (isLoading) {
    return <div>Loading questions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Question Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-[#d14124] hover:bg-[#b8371f]">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="sectionId">Section</Label>
                <Select
                  value={formData.sectionId}
                  onValueChange={(value) => setFormData({ ...formData, sectionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllSections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.fullPath}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Question Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Question Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
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
                    value={formData.difficulty}
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
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        {formData.options.length > 2 && (
                          <Button type="button" size="sm" variant="outline" onClick={() => removeOption(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="outline" onClick={addOption}>
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
                    value={formData.correctAnswer}
                    onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.options
                        .filter((opt) => opt.trim())
                        .map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : formData.type === "TRUE_FALSE" ? (
                  <Select
                    value={formData.correctAnswer}
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
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    required
                  />
                )}
              </div>

              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-[#d14124] hover:bg-[#b8371f]">
                  {editingQuestion ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingQuestion(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search questions..."
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
            setSelectedSectionId("")
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
          value={selectedCourseId}
          onValueChange={(value) => {
            setSelectedCourseId(value)
            setSelectedClassId("")
            setSelectedSectionId("")
          }}
          disabled={availableCourses.length === 0}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Course" />
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
        <Select
          value={selectedClassId}
          onValueChange={(value) => {
            setSelectedClassId(value)
            setSelectedSectionId("")
          }}
          disabled={availableClasses.length === 0}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Class" />
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
        <Select
          value={selectedSectionId}
          onValueChange={setSelectedSectionId}
          disabled={availableSections.length === 0}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {availableSections.map((section: any) => (
              <SelectItem key={section.id} value={section.id}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
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
        <Select value={selectedQuestionType} onValueChange={setSelectedQuestionType}>
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
      </div>

      <div className="grid gap-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileQuestion className="w-5 h-5 text-[#d14124]" />
                    <Badge className={`difficulty-${question.difficulty.toLowerCase()}`}>{question.difficulty}</Badge>
                    <Badge className={`question-${question.type.toLowerCase().replace("_", "-")}`}>
                      {question.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <h3 className="font-medium mb-2">{question.content}</h3>
                  <p className="text-sm text-green-600 mb-2">
                    <strong>Answer:</strong> {question.correctAnswer}
                  </p>
                  {question.explanation && <p className="text-sm text-gray-600 mb-2 italic">{question.explanation}</p>}
                  <p className="text-xs text-gray-500">
                    {question.section.class.course.department.name} &gt; {question.section.class.course.name} &gt;{" "}
                    {question.section.class.name} &gt; {question.section.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(question)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(question.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredQuestions.length === 0 && (
        <div className="text-center py-8 text-gray-500">No questions found matching your criteria.</div>
      )}
    </div>
  )
}
