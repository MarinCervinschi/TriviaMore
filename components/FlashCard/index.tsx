"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import QuizSection from "@/types/QuizSection"
import QuizQuestion from "@/types/QuizQuestion"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface FlashCardProps {
    section: QuizSection
    questions: QuizQuestion[]
    quizClassId: string | undefined
}

export function FlashCard({ section, questions, quizClassId }: FlashCardProps) {
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [progress, setProgress] = useState(0)
    const route = useRouter()

    useEffect(() => {
        // Update progress when card changes
        if (questions.length > 0) {
            setProgress(((currentCardIndex) / questions.length) * 100)
        }
    }, [currentCardIndex, questions.length])

    const handleNext = useCallback(() => {
        if (currentCardIndex < questions.length - 1) {
            setCurrentCardIndex((prev) => prev + 1)
            setIsFlipped(false)
        } else {
            toast.success("You've completed all flash cards!")
            route.push(`/${quizClassId}`)
        }
    }, [currentCardIndex, questions.length, route, quizClassId])

    const handlePrevious = useCallback(() => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex((prev) => prev - 1)
            setIsFlipped(false)
        }
    }, [currentCardIndex])

    const handleFlip = useCallback(() => {
        setIsFlipped((prev) => !prev)
    }, [])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft" && currentCardIndex > 0) {
                handlePrevious();
            } else if (event.key === "ArrowRight" && currentCardIndex < questions.length - 1) {
                handleNext();
            } else if (event.code === "Space" || event.key === "Enter") {
                // Prevent default behavior of space key (scrolling the page)
                event.preventDefault();
                handleFlip();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentCardIndex, handlePrevious, handleNext, questions.length, handleFlip]);

    const question = questions[currentCardIndex]
    const correctAnswers = question.answer.map((index) => question.options[index])

    const getLink = (answer: string) => {
        const fileId = answer.split('/file/d/')[1].split('/')[0];
        return `https://drive.google.com/file/d/${fileId}/preview`;
    };

    return (
        <div className="w-[400px] sm:w-[500px] md:w-[700px] lg:w-[850px] mx-auto px-4">
            <Progress value={progress} className="h-1 mb-8" />

            <div className="w-full min-h-[400px] perspective-1000">
                <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""
                        }`}
                >
                    {/* Front of card (Question) */}
                    <div className={`absolute w-full h-full backface-hidden ${isFlipped ? "invisible" : ""}`}>
                        <Card className="relative">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>
                                    <span className="flex items-center gap-2">{section.icon}{section.sectionName} - Flash Card</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-[250px]">
                                <p className="p-5 text-sm sm:text-md md:text-lg font-medium text-center break-words overflow-auto">{question.question}</p>
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <Button onClick={handleFlip}>Show Answer</Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Back of card (Answer) */}
                    <div className={`absolute w-full h-full backface-hidden rotate-y-180 ${!isFlipped ? "invisible" : ""}`}>
                        <Card className="relative">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>
                                    <span className="flex items-center gap-2">{section.icon}{section.sectionName} - Answer</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center h-[250px]">
                                <div className="p-5 text-sm sm:text-md md:text-lg font-medium break-words text-green-600 overflow-auto">
                                    {section.id === "theorems" && quizClassId == "telecommunications" ? (
                                        correctAnswers.length === 1 ? (
                                            <Link href={getLink(correctAnswers[0])} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                View Document
                                            </Link>
                                        ) : (
                                            <ul className="list-disc pl-5">
                                                {correctAnswers.map((answer, index) => (
                                                    <li key={index}>
                                                        <Link href={getLink(answer)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                            View Document {index + 1}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )
                                    ) : (
                                        correctAnswers.length === 1 ? (
                                            <p>{correctAnswers[0]}</p>
                                        ) : (
                                            <ul className="list-disc pl-5">
                                                {correctAnswers.map((answer, index) => (
                                                    <li key={index}>{answer}</li>
                                                ))}
                                            </ul>
                                        )
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <Button onClick={handleFlip}>Show Question</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <Button onClick={handlePrevious} disabled={currentCardIndex === 0} variant="ghost">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <span className="text-sm font-medium">{currentCardIndex + 1} / {questions.length}</span>
                <Button
                    onClick={handleNext}
                    variant="ghost"
                >
                    {currentCardIndex === questions.length - 1 ? "Submit" : "Next"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
