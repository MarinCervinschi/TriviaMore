import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizQuestion from "@/types/QuizQuestion";
import QuizSection from "@/types/QuizSection";
interface QuizReviewProps {
    questions: QuizQuestion[];
    userAnswers: number[][]; // Updated to handle multiple selections
    section: QuizSection;
}

export default function QuizReview({ questions, userAnswers, section }: QuizReviewProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Quiz Review</CardTitle>
            </CardHeader>
            <CardContent>
                {questions.map((question, questionIndex) => {
                    const userSelected = userAnswers[questionIndex] || []; // Ensure array exists

                    return (
                        <div key={questionIndex} className="mb-8 last:mb-0">
                            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
                            {section.id === "random" && <p className="text-sm text-gray-600 mb-4">Section: {question.sectionId}</p>}
                            <div className="space-y-2">
                                {question.options.map((option, optionIndex) => {
                                    const isCorrect = question.answer.includes(optionIndex); // ✅ Multiple correct answers
                                    const isSelected = userSelected.includes(optionIndex); // Check if user selected this option
                                    const isIncorrectSelection = isSelected && !isCorrect; // ❌ Selected but wrong
                                    const isMissedCorrect = !isSelected && isCorrect; // 🔷 Correct but user didn’t select

                                    return (
                                        <div
                                            key={optionIndex}
                                            className={`flex items-center p-4 rounded-lg ${isCorrect && isSelected
                                                ? "bg-green-100 dark:bg-green-700/50" // ✅ Correctly selected
                                                : isIncorrectSelection
                                                    ? "bg-red-100 dark:bg-red-700/50" // ❌ Wrong selection
                                                    : isMissedCorrect
                                                        ? "bg-blue-100 dark:bg-blue-700/50" // 🔷 Missed correct answer
                                                        : "border border-border" // Neutral option
                                                }`}
                                        >
                                            <span className="text-lg font-medium mr-4 w-6">{optionIndex + 1}</span>
                                            <span className="flex-grow">{option}</span>
                                            {isCorrect && isSelected && <Check className="ml-2 text-green-600 dark:text-green-400" size={20} />}
                                            {isIncorrectSelection && <X className="ml-2 text-red-600 dark:text-red-400" size={20} />}
                                            {isMissedCorrect && <Check className="ml-2 text-blue-600 dark:text-blue-400" size={20} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}