import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { LatexTextField } from "@/components/LateX/latex-text-field";
import SmartInlineMath from "@/components/SmartInlineMath";
import QuizQuestion from "@/types/QuizQuestion";

import { IoIosRemoveCircle } from "react-icons/io";
import { MdAddToPhotos } from "react-icons/md";

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
                <div key={index} className="flex items-center space-x-2">

                    <LatexTextField value={option} onChange={(value) => handleOptionChange(index, value)} multiline={false} />
                    <Checkbox
                        id={`correct-${index}`}
                        checked={question.answer.includes(index)}
                        onCheckedChange={(checked) => handleCorrectAnswerChange(index, checked as boolean)}
                    />
                    <Label htmlFor={`correct-${index}`} className="text-sm">
                        Correct
                    </Label>
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
                <MdAddToPhotos className="mr-1" /> Add Option
            </Button>

            {/* Live Preview Section */}
            <div className="mt-8 p-4 border border-gray-400 rounded-md bg-gray-100">
                <h3 className="font-semibold text-lg mb-2">Live Preview</h3>
                <div className="mb-4 font-semibold overflow-auto">
                    <SmartInlineMath text={question.question} />
                </div>
                <ul className="list-disc pl-6 space-y-3">
                    {question.options.map((option, index) => (
                        <li
                            key={index}
                            className={`overflow-auto ${question.answer.includes(index) ? "text-green-600" : ""}`}
                        >
                            <SmartInlineMath text={option} />
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}