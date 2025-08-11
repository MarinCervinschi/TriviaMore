import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface EvaluationMode {
	id: string;
	name: string;
	description?: string | null;
	correctAnswerPoints: number;
	incorrectAnswerPoints: number;
	partialCreditEnabled: boolean;
}

interface QuizSettingsDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	sectionName: string;
	totalQuestions: number;
	questionCount: number[];
	onQuestionCountChange: (value: number[]) => void;
	evaluationModes: EvaluationMode[];
	selectedEvaluationMode: string;
	onEvaluationModeChange: (value: string) => void;
}

export function QuizSettingsDialog({
	isOpen,
	onOpenChange,
	sectionName,
	totalQuestions,
	questionCount,
	onQuestionCountChange,
	evaluationModes,
	selectedEvaluationMode,
	onEvaluationModeChange,
}: QuizSettingsDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="w-full sm:w-auto">
					<Settings className="mr-2 h-4 w-4" />
					Impostazioni
				</Button>
			</DialogTrigger>
			<DialogContent className="mx-4 max-w-sm sm:mx-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Impostazioni Quiz</DialogTitle>
					<DialogDescription>
						Personalizza il tuo quiz per la sezione {sectionName}.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-6 py-4 sm:space-y-8 sm:py-6">
					<div className="space-y-4">
						<Label htmlFor="quiz-question-count" className="text-sm font-medium">
							Numero di domande: {questionCount[0]}
						</Label>
						<div className="px-3">
							<Slider
								id="quiz-question-count"
								min={Math.min(5, totalQuestions)}
								max={Math.min(totalQuestions, 50)}
								step={1}
								value={questionCount}
								onValueChange={onQuestionCountChange}
								className="w-full"
							/>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Da {Math.min(5, totalQuestions)} a {Math.min(totalQuestions, 50)} domande
						</p>
					</div>

					{evaluationModes.length > 0 && (
						<div className="space-y-3">
							<Label htmlFor="evaluation-mode" className="text-sm font-medium">
								Modalità di correzione
							</Label>
							<Select
								value={selectedEvaluationMode}
								onValueChange={onEvaluationModeChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Seleziona modalità">
										{selectedEvaluationMode && (
											<span className="truncate">
												{
													evaluationModes.find(
														mode => mode.id === selectedEvaluationMode
													)?.name
												}
											</span>
										)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
									{evaluationModes.map(mode => (
										<SelectItem key={mode.id} value={mode.id}>
											<div className="w-full py-1">
												<div className="truncate font-medium">{mode.name}</div>
												{mode.description && (
													<div className="mt-1 text-xs text-gray-500">
														{mode.description}
													</div>
												)}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</div>
				<div className="flex flex-col space-y-2 border-t pt-4 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="w-full sm:w-auto"
					>
						Annulla
					</Button>
					<Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
						Salva Impostazioni
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
