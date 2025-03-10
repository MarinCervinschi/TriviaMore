"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
        try {
            const response = await fetch("/api/admin/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(question),
            })
            console.log(question);

            if (response.ok) {
                router.push(`/admin/class/${params.classId}/section/${params.sectionId}`)
            } else {
                throw new Error("Failed to save question")
            }
        } catch (error) {
            console.error("Error saving question:", error)
            alert("Failed to save question. Please try again.")
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

