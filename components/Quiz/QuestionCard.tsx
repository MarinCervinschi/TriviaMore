import React from 'react';
import { Check, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizQuestion from "@/types/QuizQuestion";
import SmartInlineMath from "@/components/SmartInlineMath";
import { toast } from "sonner"


interface QuestionCardProps {
    question: QuizQuestion;
    selectedAnswers: number[];
    onSelectAnswer: (answerIndex: number) => void;
    isSubmitted: boolean;
    random: boolean;
    showCorrectAnswer: boolean;
}

export default function QuestionCard({
    question,
    selectedAnswers,
    onSelectAnswer,
    random = false,
    showCorrectAnswer
}: QuestionCardProps) {
    const copyQuestionToClipboard = async () => {
        try {
            const questionText = question.question;
            const optionsText = question.options.map((option, index) => `${index + 1}. ${option}`).join('\n');

            const fullText = `Domanda: ${questionText}\n\nOpzioni:\n${optionsText}\n`;

            await navigator.clipboard.writeText(fullText);
            toast.success("Domanda copiata negli appunti!");
        } catch (err) {
            console.error('Errore nel copiare negli appunti:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold leading-tight overflow-auto flex-grow">
                    <SmartInlineMath text={question.question} />
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyQuestionToClipboard}
                    className="shrink-0"
                    title="Copia domanda e risposte"
                >
                    <Copy size={16} />
                </Button>
            </div>
            {random && (
                <p className="text-sm text-gray-600 mb-4">
                    Section: {question.sectionId}
                </p>
            )}
            <div className="grid grid-cols-1 gap-4">
                {question.options.map((option, index) => {
                    const isSelected = selectedAnswers.includes(index);
                    const isCorrect = question.answer.includes(index);

                    let variant: 'outline' | 'secondary' = "outline";
                    let bgColor = "";

                    if (showCorrectAnswer) {
                        if (isCorrect && isSelected) bgColor = "bg-green-600 hover:bg-green-700";
                        if (!isCorrect && isSelected) bgColor = "bg-red-600 hover:bg-red-700";
                    } else if (isSelected) {
                        variant = "secondary";
                    }

                    return (
                        <Button
                            key={index}
                            variant={variant}
                            className={`h-auto py-6 px-4 justify-start text-left whitespace-normal ${bgColor}`}
                            onClick={() => onSelectAnswer(index)}
                        >
                            <span className="text-lg font-medium mr-4 shrink-0">{index + 1}</span>
                            <span className="flex-grow overflow-auto">
                                <SmartInlineMath text={option} />
                            </span>

                            {showCorrectAnswer && isCorrect && <Check className="ml-2 shrink-0 text-white" size={20} />}
                            {showCorrectAnswer && !isCorrect && isSelected && <X className="ml-2 shrink-0 text-white" size={20} />}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}