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
import { Plus, Edit, Trash2, BookMarked, Search } from "lucide-react"
import { MockAPI } from "@/lib/mock-api"

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
    description?: string
    courseId: string
    departmentId?: string
    courseName?: string
    departmentName?: string
    sections: any[]
}

export function ClassManager() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [classes, setClasses] = useState<Class[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingClass, setEditingClass] = useState<Class | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        courseId: "",
    })
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("")
    const [selectedCourseId, setSelectedCourseId] = useState("")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const deptData = await MockAPI.getDepartments()
            setDepartments(deptData)

            const allClasses = deptData.flatMap((dept) =>
                dept.courses.flatMap((course) =>
                    course.classes.map((cls) => ({
                        ...cls,
                        courseName: course.name,
                        departmentName: dept.name,
                        departmentId: dept.id,
                    })),
                ),
            )
            setClasses(allClasses)
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

    const filteredClasses = useMemo(() => {
        let filtered = classes

        if (searchTerm) {
            filtered = filtered.filter(
                (cls) =>
                    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cls.description?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        if (selectedDepartmentId) {
            filtered = filtered.filter((cls) => cls.departmentId === selectedDepartmentId)
        }

        if (selectedCourseId) {
            filtered = filtered.filter((cls) => cls.courseId === selectedCourseId)
        }

        return filtered
    }, [classes, searchTerm, selectedDepartmentId, selectedCourseId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500))

            if (editingClass) {
                console.log("Updating class:", formData)
            } else {
                console.log("Creating class:", formData)
            }

            loadData()
            setShowForm(false)
            setEditingClass(null)
            setFormData({ name: "", code: "", description: "", courseId: "" })
        } catch (error) {
            console.error("Error saving class:", error)
        }
    }

    const handleEdit = (cls: Class) => {
        setEditingClass(cls)
        setFormData({
            name: cls.name,
            code: cls.code,
            description: cls.description || "",
            courseId: cls.courseId,
        })
        setSelectedDepartmentId(cls.departmentId || "") // Set department for course filter
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class?")) return

        try {
            await new Promise((resolve) => setTimeout(resolve, 500))
            console.log("Deleting class:", id)
            loadData()
        } catch (error) {
            console.error("Error deleting class:", error)
        }
    }

    if (isLoading) {
        return <div>Loading classes...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Class Management</h2>
                <Button onClick={() => setShowForm(true)} className="bg-[#d14124] hover:bg-[#b8371f]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Class
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingClass ? "Edit Class" : "Add New Class"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="departmentSelect">Department</Label>
                                <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
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
                                <Label htmlFor="courseId">Course</Label>
                                <Select
                                    value={formData.courseId}
                                    onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                                    disabled={availableCourses.length === 0}
                                >
                                    <SelectTrigger id="courseId">
                                        <SelectValue placeholder="Select a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCourses.map((course) => (
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
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="code">Class Code</Label>
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
                                    {editingClass ? "Update" : "Create"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingClass(null)
                                        setFormData({ name: "", code: "", description: "", courseId: "" })
                                        setSelectedDepartmentId("")
                                        setSelectedCourseId("")
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
                        placeholder="Search classes..."
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
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={availableCourses.length === 0}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by Course" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {availableCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                                {course.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4">
                {filteredClasses.map((cls) => (
                    <Card key={cls.id} className="card-hover">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookMarked className="w-5 h-5 text-[#d14124]" />
                                        <h3 className="font-semibold text-lg">{cls.name}</h3>
                                        <Badge variant="outline">{cls.code}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Course: {cls.courseName} ({cls.departmentName})
                                    </p>
                                    {cls.description && <p className="text-sm text-gray-700 mb-2">{cls.description}</p>}
                                    <p className="text-xs text-gray-500">{cls.sections?.length || 0} sections</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(cls)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDelete(cls.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {filteredClasses.length === 0 && (
                <div className="text-center py-8 text-gray-500">No classes found matching your criteria.</div>
            )}
        </div>
    )
}
