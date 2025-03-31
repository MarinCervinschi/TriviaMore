"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import Loader from "@/components/Loader"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AddSectionForm from "@/components/admin/AddSectionForm"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import iconMap from "@/lib/iconMap"
import QuizQuestion from "@/types/QuizQuestion"

import { MdAddToPhotos, MdOutlineCancel } from "react-icons/md"
import { LuSave } from "react-icons/lu";
import { FiEdit3, FiDelete } from "react-icons/fi";
import { IoMdArrowRoundBack } from "react-icons/io"

export default function ManageSection() {
    const params = useParams() || notFound();
    const [sectionName, setSectionName] = useState("")
    const [sectionId, setSectionId] = useState("")
    const [sectionIcon, setSectionIcon] = useState("default")
    const [isNewSection, setIsNewSection] = useState(false)
    const [iconNode, setIconNode] = useState<React.ReactNode>(iconMap["default"])
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(params.sectionId !== "new")
    const router = useRouter()

    useEffect(() => {
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
                toast.error("Failed to load section data. Please try again.")
            }
        }

        if (params.sectionId !== "new") {
            fetchSectionData()
            setSectionId(params.sectionId as string)
        } else {
            setLoading(false)
            setIsNewSection(true)
        }
    }, [params.classId, params.sectionId])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            id: sectionId,
            classId: params.classId,
            sectionName: sectionName,
            icon: sectionIcon,
        }

        try {
            const response = await fetch("/api/admin/section", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                toast.success(`${isNewSection ? "Created" : "Updated"} section successfully 🎉`)
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
            toast.error(`Failed to ${isNewSection ? "create" : "update"} section. Please try again.`)
        }
    }

    const handleDeleteSection = async () => {
        if (confirm("Are you sure you want to delete this section? This action cannot be undone.")) {
            try {
                const response = await fetch(`/api/admin/section?sectionId=${params.sectionId}`, {
                    method: "DELETE",
                })

                if (response.ok) {
                    toast.success("Section deleted successfully 🎉")
                    router.push(`/admin/class/${params.classId}`)
                } else {
                    throw new Error("Failed to delete section")
                }
            } catch (error) {
                console.error("Error deleting section:", error)
                toast.error("Failed to delete section. Please try again.")
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
                    toast.success("Question deleted successfully 🎉")
                    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
                } else {
                    throw new Error("Failed to delete question")
                }
            } catch (error) {
                console.error("Error deleting question:", error)
                toast.error("Failed to delete question. Please try again.")
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
                        <Button onClick={handleSubmit}>Save <LuSave /></Button>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                            Cancel <MdOutlineCancel />
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
                        <Button onClick={() => setEditMode(true)}>Edit <FiEdit3 /></Button>
                        <Button variant="destructive" onClick={handleDeleteSection}>
                            Delete <FiDelete />
                        </Button>
                    </div>
                </div>
            )
        }
    }

    return (
        <DefaultLayout>
            <div className="w-full max-w-5xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex gap-1">{isNewSection ? "Add new Section: " : "Manage Section:"} <span className="flex gap-1 items-center">{iconNode}{sectionName}</span></h1>
                    <Button onClick={() => router.push(`/admin/class/${params.classId}`)}><IoMdArrowRoundBack /> Back to Class</Button>
                </div>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Section Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!isNewSection && editSection()}
                        {isNewSection && <AddSectionForm quizClassId={params.classId as string} />}
                    </CardContent>
                </Card>

                {!isNewSection &&
                    <>
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Questions - {questions.length}</CardTitle>
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
                                                                Edit <FiEdit3 />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="destructive" onClick={() => handleDeleteQuestion(question.id as string)}>
                                                            Delete <FiDelete />
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
                            <Link href={`/admin/class/${params.classId}/section/${params.sectionId}/question/new`}>Add New Question <MdAddToPhotos /></Link>
                        </Button>
                    </>
                }
            </div>
        </DefaultLayout>
    )
}

