"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import QuizQuestion from "@/types/QuizQuestion"
import { useParams } from "next/navigation"
import DefaultLayout from "@/components/Layouts/DefaultLayout"
import Loader from "@/components/Loader"

export default function ManageQuestion() {
    const params = useParams();
    const [question, setQuestion] = useState<QuizQuestion>({
        question: "",
        options: ["", "", "", ""],
        answer: [],
        classId: params.classId as string || "",
        sectionId: params.sectionId as string || "",

    })
    const [loading, setLoading] = useState(params.questionId !== "new")
    const [isJsonMode, setIsJsonMode] = useState(false)
    const [jsonData, setJsonData] = useState("")
    const router = useRouter()

    useEffect(() => {
        if (params.questionId !== "new") {
            fetchQuestionData()
        }
    }, [params.questionId]) // Updated dependency array

    const fetchQuestionData = async () => {
        try {
            const response = await fetch(
                `/api/admin/question?questionId=${params.questionId}`,
            )
            if (response.ok) {
                const data = await response.json()
                setQuestion(data)
                setLoading(false)
            } else {
                throw new Error("Failed to fetch question data")
            }
        } catch (error) {
            console.error("Error fetching question data:", error)
            alert("Failed to load question data. Please try again.")
        }
    }

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion((prev) => ({ ...prev, question: e.target.value }))
    }

    const handleOptionChange = (index: number, value: string) => {
        setQuestion((prev) => {
            const newOptions = [...prev.options]
            newOptions[index] = value
            return { ...prev, options: newOptions }
        })
    }

    const handleCorrectAnswerChange = (index: number, checked: boolean) => {
        setQuestion((prev) => {
            const newCorrectAnswers = checked
                ? [...prev.answer, index]
                : prev.answer.filter((i) => i !== index)
            return { ...prev, answer: newCorrectAnswers }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        let data = {} as QuizQuestion[]

        if (isJsonMode) {
            try {
                data = JSON.parse(jsonData) as QuizQuestion[]
            } catch (error) {
                console.error("Invalid JSON:", error)
                alert("Invalid JSON data: " + error)
                return
            }
        } else {
            data = [question]
        }

        try {
            const response = await fetch("/api/admin/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                router.push(`/admin/class/${params.classId}/section/${params.sectionId}`)
            } else {
                const res = await response.json()
                throw new Error(res.messagge + res.error)
            }
        } catch (error) {
            console.error("Error saving question:", error)
            alert("Failed to save question. Please try again." + error)
        }
    }

    if (loading) {
        return <Loader />
    }

    return (
        <DefaultLayout>
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{params.questionId === "new" ? "Add New Question" : "Edit Question"}</CardTitle>
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
        "classId": "${params.classId}",
        "sectionId": "${params.sectionId}",
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
                                    <>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 ">
                                            <div className="space-y-2">
                                                <Label htmlFor="classId">Class ID</Label>
                                                <Input
                                                    id="classId"
                                                    value={question.classId}
                                                    disabled
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sectionId">Section ID</Label>
                                                <Input
                                                    id="sectionId"
                                                    value={question.sectionId}
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="question">Question</Label>
                                            <Input
                                                id="question"
                                                value={question.question}
                                                onChange={handleQuestionChange}
                                                placeholder="Enter question"
                                                required
                                            />
                                        </div>
                                        {question.options.map((option, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Input
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    required
                                                />
                                                <Checkbox
                                                    id={`correct-${index}`}
                                                    checked={question.answer.includes(index)}
                                                    onCheckedChange={(checked) => handleCorrectAnswerChange(index, checked as boolean)}
                                                />
                                                <Label htmlFor={`correct-${index}`}>Correct</Label>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/admin/class/${params.classId}/section/${params.sectionId}`)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" onClick={handleSubmit}>
                            Save Question
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </DefaultLayout>
    )
}

