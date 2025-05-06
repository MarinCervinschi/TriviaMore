"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import Loader from "@/components/Loader"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { useQuestionData } from "@/hooks/admin/useQuestionData"
import { useQuestionMutation } from "@/hooks/admin/useQuestionMutation"
import EditQuestionCard from "@/components/admin/EditQuestionCard"

import QuizQuestion from "@/types/QuizQuestion"
import iconMap from "@/lib/iconMap"

import { LuSave } from "react-icons/lu"
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md"

export default function ManageQuestion({ params }: { params: Promise<{ classId: string, sectionId: string, questionId: string }> }) {
    const { classId, sectionId, questionId } = use(params)
    const [question, setQuestion] = useState<QuizQuestion>({
        question: "",
        options: ["", "", "", ""],
        answer: [],
        classId: classId,
        sectionId: sectionId,

    })
    const [isJsonMode, setIsJsonMode] = useState(false)
    const [jsonData, setJsonData] = useState("")
    const router = useRouter()
    const isNewQuestion = questionId === "new"

    const { data, isLoading, isError, error } = useQuestionData(questionId, !isNewQuestion)
    const { saveQuestionMutaion } = useQuestionMutation(classId, sectionId, questionId)

    useEffect(() => {
        if (data) setQuestion(data)
    }, [data])


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        let questions: QuizQuestion[]

        if (isJsonMode) {
            try {
                questions = JSON.parse(jsonData)
            } catch (err) {
                toast.error("Invalid JSON data: " + err)
                return
            }
        } else {
            questions = [question]
        }
        console.log(questions);
        const data = questions.map((q) => ({
            ...q,
            classId: classId,
            sectionId: sectionId,
        }))

        saveQuestionMutaion.mutate(data)
    }

    if (isLoading) return <Loader />
    if (isError) return <p className="text-red-500">{error.message}</p>

    return (
        <DefaultLayout>
            <div className="w-full max-w-5xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex gap-1">{questionId === "new" ? "Add New Question" : "Edit Question"} {iconMap["default"]}</h1>
                    <Button onClick={() => router.push(`/admin/class/${classId}/section/${sectionId}`)}><IoMdArrowRoundBack /> Back to Sections</Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Question Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="input-mode">Input Mode:</Label>
                                    <Button type="button" variant={isJsonMode ? "outline" : "default"} onClick={() => setIsJsonMode(false)}>
                                        Form
                                    </Button>
                                    <Button type="button" variant={isJsonMode ? "default" : "outline"} onClick={() => setIsJsonMode(true)}>
                                        JSON
                                    </Button>
                                </div>
                                {isJsonMode ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Example:</Label>
                                            <pre className="bg-gray-100 p-2 rounded">
                                                {`[
    {
        "classId": "${classId}",
        "sectionId": "${sectionId}",
        "question": "What does the span tag in HTML do?",
        "options": [
            "Defines a hyperlink",
            "Defines a section in a document",
            "Defines a paragraph",
            "Defines a division or a section in an HTML document"
        ],
        "answer": [3]
    }
]`}
                                            </pre>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="json-data">JSON Data</Label>
                                            <Textarea
                                                id="json-data"
                                                value={jsonData}
                                                onChange={(e) => setJsonData(e.target.value)}
                                                placeholder="Enter JSON data for the new class"
                                                rows={10}
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <EditQuestionCard question={question} setQuestion={setQuestion} />
                                )}
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/admin/class/${classId}/section/${sectionId}`)}
                        >
                            Cancel <MdOutlineCancel />
                        </Button>
                        <Button type="submit" onClick={handleSubmit} disabled={saveQuestionMutaion.isPending}>
                            {saveQuestionMutaion.isPending ? "Saving..." : "Save Question"} <LuSave />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </DefaultLayout>
    )
}

