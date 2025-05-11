import { useState } from "react";
import { MdAddToPhotos } from "react-icons/md";
import { IoIosRemoveCircle } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import QuizQuestion from "@/types/QuizQuestion";
import SmartInlineMath from "@/components/SmartInlineMath";

import { LatexTextField } from "@/components/LateX/latex-text-field";

interface ClassEditQuestionProps {
    question: QuizQuestion;
    setQuestion: React.Dispatch<React.SetStateAction<QuizQuestion>>;
}

export default function EditQuestionCard({ question, setQuestion }: ClassEditQuestionProps) {

    const handleQuestionChange = (value: string) => {
        setQuestion((prev: any) => ({ ...prev, question: value }))
    }

    const handleOptionChange = (index: number, value: string) => {
        setQuestion((prev: any) => {
            const newOptions = [...prev.options]
            newOptions[index] = value
            return { ...prev, options: newOptions }
        })
    }

    const handleCorrectAnswerChange = (index: number, checked: boolean) => {
        setQuestion((prev: any) => {
            const newCorrectAnswers = checked
                ? [...prev.answer, index]
                : prev.answer.filter((i: any) => i !== index)
            return { ...prev, answer: newCorrectAnswers }
        })
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="classId">Class ID</Label>
                    <Input id="classId" value={question.classId} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sectionId">Section ID</Label>
                    <Input id="sectionId" value={question.sectionId} disabled />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <LatexTextField value={question.question} onChange={handleQuestionChange} multiline={true} />
            </div>

            {question.options.map((option, index) => (
                <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`correct-${index}`}
                                checked={question.answer.includes(index)}
                                onCheckedChange={(checked) => handleCorrectAnswerChange(index, checked as boolean)}
                            />
                            <Label htmlFor={`correct-${index}`} className="text-sm">
                                Correct
                            </Label>
                        </div>
                    </div>
                    <LatexTextField value={option} onChange={(value) => handleOptionChange(index, value)} multiline={false} />
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={question.options.length <= 1}
                        onClick={() => {
                            setQuestion((prev) => {
                                const newOptions = [...prev.options]
                                newOptions.splice(index, 1)
                                const newAnswers = prev.answer.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
                                return { ...prev, options: newOptions, answer: newAnswers }
                            })
                        }}
                        className="mt-1"
                    >
                        <IoIosRemoveCircle className="mr-1" /> Remove Option
                    </Button>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={() =>
                    setQuestion((prev) => ({
                        ...prev,
                        options: [...prev.options, ""],
                    }))
                }
            >
                <MdAddToPhotos className="mr-1" /> Add Option
            </Button>

            {/* Live Preview Section */}
            <div className="mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-muted/20">
                <h3 className="font-semibold text-lg mb-2">Live Preview</h3>
                <div className="mb-4 p-3 bg-background rounded-md border">
                    <SmartInlineMath text={question.question} />
                </div>
                <ul className="list-disc pl-6 space-y-3">
                    {question.options.map((option, index) => (
                        <li
                            key={index}
                            className={`p-2 rounded ${question.answer.includes(index) ? "bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-background border"}`}
                        >
                            <SmartInlineMath text={option} />
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}