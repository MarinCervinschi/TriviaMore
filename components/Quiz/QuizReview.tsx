import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizQuestion from "@/types/QuizQuestion";
import QuizSection from "@/types/QuizSection";
import SmartInlineMath from "@/components/SmartInlineMath";

interface QuizReviewProps {
    questions: QuizQuestion[];
    userAnswers: number[][];
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
                    const userSelected = userAnswers[questionIndex] || [];

                    return (
                        <div key={questionIndex} className="mb-8 last:mb-0">
                            <h3 className="text-lg font-semibold mb-4">
                                <SmartInlineMath text={question.question} />
                            </h3>
                            {section.id === "random" && (
                                <p className="text-sm text-gray-600 mb-4">Section: {question.sectionId}</p>
                            )}
                            <div className="space-y-2">
                                {question.options.map((option, optionIndex) => {
                                    const isCorrect = question.answer.includes(optionIndex);
                                    const isSelected = userSelected.includes(optionIndex);
                                    const isIncorrectSelection = isSelected && !isCorrect;
                                    const isMissedCorrect = !isSelected && isCorrect;

                                    const className = isCorrect && isSelected
                                        ? "bg-green-100 dark:bg-green-700/50"
                                        : isIncorrectSelection
                                            ? "bg-red-100 dark:bg-red-700/50"
                                            : isMissedCorrect
                                                ? "bg-blue-100 dark:bg-blue-700/50"
                                                : "border border-border";

                                    return (
                                        <div
                                            key={optionIndex}
                                            className={`flex items-center p-4 rounded-lg ${className}`}
                                        >
                                            <span className="text-lg font-medium mr-4 w-6">{optionIndex + 1}</span>
                                            <span className="flex-grow">
                                                <SmartInlineMath text={option} />
                                            </span>
                                            {isCorrect && isSelected && (
                                                <Check className="ml-2 text-green-600 dark:text-green-400" size={20} />
                                            )}
                                            {isIncorrectSelection && (
                                                <X className="ml-2 text-red-600 dark:text-red-400" size={20} />
                                            )}
                                            {isMissedCorrect && (
                                                <Check className="ml-2 text-blue-600 dark:text-blue-400" size={20} />
                                            )}
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