
import { useState } from "react";
import { MdAddToPhotos } from "react-icons/md";
import { IoIosRemoveCircle } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import QuizQuestion from "@/types/QuizQuestion";

interface ClassEditQuestionProps {
    question: QuizQuestion;
    setQuestion: React.Dispatch<React.SetStateAction<QuizQuestion>>;
}

export default function EditQuestionCard({ question, setQuestion }: ClassEditQuestionProps) {

    const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

    return (
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
                <Textarea
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
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={question.options.length <= 1}
                        onClick={() =>
                            setQuestion((prev) => {
                                const newOptions = [...prev.options];
                                newOptions.splice(index, 1);
                                const newAnswers = prev.answer.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i));
                                return { ...prev, options: newOptions, answer: newAnswers };
                            })
                        }
                    >
                        <IoIosRemoveCircle />
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
                Add Option <MdAddToPhotos />
            </Button>
        </>
    );
}