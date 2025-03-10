"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from "next/navigation"
import iconMap from "@/lib/iconMap"
import Loader from "@/components/Loader"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import QuizQuestion from "@/types/QuizQuestion"

export default function ManageSection() {
    const params = useParams();
    const [sectionName, setSectionName] = useState("")
    const [sectionId, setSectionId] = useState("")
    const [sectionIcon, setSectionIcon] = useState("default")
    const [isNewSection, setIsNewSection] = useState(false)
    const [iconNode, setIconNode] = useState<React.ReactNode>()
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(params.sectionId !== "new")
    const router = useRouter()

    useEffect(() => {
        if (params.sectionId !== "new") {
            fetchSectionData()
            setSectionId(params.sectionId as string)
        } else {
            setLoading(false)
            setIsNewSection(true)
        }
    }, [params.sectionId])

    const fetchSectionData = async () => {
        try {
            const response = await fetch(`/api/questions?classId=${params.classId}&sectionId=${params.sectionId}`)
            if (response.ok) {
                const data = await response.json()

                setSectionId(data.section.id)
                setSectionName(data.section.sectionName)
                setSectionIcon(data.section.icon)
                setIconNode(iconMap[data.section.icon])
                setQuestions(data.questions)
                setLoading(false)
            } else {
                throw new Error("Failed to fetch section data")
            }
        } catch (error) {
            console.error("Error fetching section data:", error)
            alert("Failed to load section data. Please try again.")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {

            const method = isNewSection ? "POST" : "PUT"

            const payload = {
                id: sectionId,
                classId: params.classId,
                sectionName: sectionName,
                icon: sectionIcon,
            }
            console.log(payload);

            const response = await fetch("/api/admin/section", {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                if (isNewSection) {
                    router.push(`/admin/class/${params.classId}`)
                } else {
                    setEditMode(false)
                }
            } else {
                throw new Error(`Failed to ${isNewSection ? "create" : "update"} section`)
            }
        } catch (error) {
            console.error(`Error ${isNewSection ? "creating" : "updating"} section:`, error)
            alert(`Failed to ${isNewSection ? "create" : "update"} section. Please try again.`)
        }
    }

    const handleDeleteSection = async () => {
        if (confirm("Are you sure you want to delete this section? This action cannot be undone.")) {
            try {
                const response = await fetch(`/api/admin/section?sectionId=${params.sectionId}`, {
                    method: "DELETE",
                })

                if (response.ok) {
                    router.push(`/admin/class/${params.classId}`)
                } else {
                    throw new Error("Failed to delete section")
                }
            } catch (error) {
                console.error("Error deleting section:", error)
                alert("Failed to delete section. Please try again.")
            }
        }
    }

    const handleDeleteQuestion = async (questionId: string) => {
        if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
            try {
                const response = await fetch(
                    `/api/admin/question?questionId=${questionId}`,
                    {
                        method: "DELETE",
                    },
                )

                if (response.ok) {
                    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
                } else {
                    throw new Error("Failed to delete question")
                }
            } catch (error) {
                console.error("Error deleting question:", error)
                alert("Failed to delete question. Please try again.")
            }
        }
    }

    if (loading) {
        return <Loader />
    }

    const editSection = () => {
        if (editMode) {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="class-id">Class ID</Label>
                        <Input id="class-id" value={params.classId} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="section-name">Section Name</Label>
                        <Input id="section-name" value={sectionName} onChange={(e) => setSectionName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="section-icon">Section Icon</Label>
                        <Input id="section-icon" value={sectionIcon} onChange={(e) => setSectionIcon(e.target.value)} />
                    </div>
                    <div className="space-x-2">
                        <Button onClick={handleSubmit}>Save</Button>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="space-y-4">
                    <p className="flex gap-1">
                        <strong>Name:</strong> <span className="flex gap-1 items-center">{iconNode}{sectionName}</span>
                    </p>
                    <div className="space-x-2">
                        <Button onClick={() => setEditMode(true)}>Edit</Button>
                        <Button variant="destructive" onClick={handleDeleteSection}>
                            Delete Section
                        </Button>
                    </div>
                </div>
            )
        }
    }

    const newSection = () => {
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="class-id">Class ID</Label>
                    <Input id="class-id" value={params.classId} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="section-id">Section ID</Label>
                    <Input
                        id="section-id"
                        value={sectionId}
                        onChange={(e) => setSectionId(e.target.value)}
                        placeholder="Enter section ID (e.g., html-css)"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="section-name">Section Name</Label>
                    <Input
                        id="section-name"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        placeholder="Enter section name"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="section-icon">Section Icon</Label>
                    <Input
                        id="section-icon"
                        value={sectionIcon}
                        onChange={(e) => setSectionIcon(e.target.value)}
                        placeholder="Enter icon name"
                        required
                    />
                </div>
                <div className="flex justify-between">
                    <Button variant={"outline"} onClick={() => router.push(`/admin/class/${params.classId}`)}>Cancel</Button>
                    <Button type="submit">
                        Create Section
                    </Button>
                </div>
            </form>
        )
    }

    return (
        <DefaultLayout>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex gap-1">Manage Section: <span className="flex gap-1 items-center">{iconNode}{sectionName}</span></h1>
                    <Button onClick={() => router.push(`/admin/class/${params.classId}`)}>Back to Class</Button>
                </div>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Section Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!isNewSection && editSection()}
                        {isNewSection && newSection()}
                    </CardContent>
                </Card>

                {!isNewSection &&
                    <>
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {questions && questions.length > 0 ? (
                                    <div className="space-y-4">
                                        {questions.map((question) => (
                                            <Card key={question.id}>
                                                <CardHeader>
                                                    <CardTitle>{question.question}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="list-disc pl-5">
                                                        {question.options.map((option, index) => (
                                                            <li key={index} className={question.answer.includes(index) ? "text-green-600" : ""}>
                                                                {option}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-4 space-x-2">
                                                        <Button asChild>
                                                            <Link href={`/admin/class/${params.classId}/section/${params.sectionId}/question/${question.id}`}>
                                                                Edit Question
                                                            </Link>
                                                        </Button>
                                                        <Button variant="destructive" onClick={() => handleDeleteQuestion(question.id as string)}>
                                                            Delete Question
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500">No questions found. Add a new question below.</p>
                                )}
                            </CardContent>
                        </Card>
                        <Button asChild>
                            <Link href={`/admin/class/${params.classId}/section/${params.sectionId}/question/new`}>Add New Question</Link>
                        </Button>
                    </>
                }
            </div>
        </DefaultLayout>
    )
}

